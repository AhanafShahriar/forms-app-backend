import { Request, Response, RequestHandler } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

// Define the User type or import it from your models or types file
interface User {
  id: number; // Assuming you have an ID field
  // Add other fields as necessary
}

// Create a new template with optional image upload
export const createTemplate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { title, description, topic, tags, questions, imageUrl } = req.body;
  const isPublic = req.body.public; // Directly use the boolean value
  const userId = Number(req.user?.id);

  if (!userId) {
    res.status(400).json({ message: "User  ID is required." });
    return; // Add return statement
  }

  // Log the request body for debugging
  console.log("Request body:", req.body);

  let selectedUsers: User[] = [];
  if (req.body.selectedUsers) {
    const selectedUsersInput = req.body.selectedUsers;

    // Check if selectedUsersInput is a non-empty string
    if (
      typeof selectedUsersInput === "string" &&
      selectedUsersInput.trim() !== ""
    ) {
      try {
        selectedUsers = JSON.parse(selectedUsersInput);
      } catch (error) {
        console.error("Error parsing selectedUsers:", error);
        res.status(400).json({ message: "Invalid JSON for selectedUsers." });
        return;
      }
    } else {
      // Handle the case where selectedUsers is an empty string or not a string
      console.warn("selectedUsers is empty or not a valid string.");
    }
  }

  try {
    console.log("Creating template with data:", {
      title,
      description,
      topic,
      public: isPublic,
      author: { connect: { id: userId } },
      tags,
      questions,
      imageUrl,
    });
    // Create the template
    const newTemplate = await prisma.template.create({
      data: {
        title,
        description,
        topic,
        public: isPublic,
        author: { connect: { id: userId } },
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        questions: {
          create: questions.map((question: any) => {
            if (
              question.type === "CHECKBOX" &&
              !Array.isArray(question.options)
            ) {
              throw new Error(
                "Options must be an array for CHECKBOX type questions."
              );
            }
            return {
              description: question.description,
              title: question.title,
              type: question.type,
              displayedInTable: question.displayedInTable,
              options:
                question.type === "CHECKBOX" && Array.isArray(question.options)
                  ? {
                      create: question.options.map((option: string) => ({
                        value: option,
                      })),
                    }
                  : undefined,
            };
          }),
        },
        imageUrl: imageUrl || null,
      },
      include: { author: true, tags: true },
    });

    if (!isPublic && selectedUsers.length > 0) {
      await prisma.template.update({
        where: { id: newTemplate.id },
        data: {
          allowedUsers: {
            connect: selectedUsers.map((user: User) => ({ id: user.id })),
          },
        },
      });
    }

    res.status(201).json(newTemplate);
  } catch (error: unknown) {
    console.error("Error creating template:", error);

    // Type assertion to access the message property
    const errorMessage =
      (error as Error).message || "An unknown error occurred.";

    res
      .status(500)
      .json({ message: "Internal server error", error: errorMessage });
  }
};

// Get all public templates
export const getTemplates: RequestHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const templates = await prisma.template.findMany({
      where: { public: true },
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });
    res.json(templates);
  } catch (error) {
    res.status(400).json({ message: "Error fetching templates", error });
  }
};

// Search templates based on query
export const searchTemplates: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const query = req.query.query as string | undefined;

  if (!query) {
    res.status(400).json({ message: "Query parameter is required." });
    return;
  }

  try {
    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          {
            tags: { some: { name: { contains: query, mode: "insensitive" } } },
          },
          {
            comments: {
              some: { content: { contains: query, mode: "insensitive" } },
            },
          },
        ],
      },
      include: {
        tags: true,
        comments: true,
      },
    });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error searching templates", error });
  }
};

// Get a template by ID
export const getTemplateById: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { templateId } = req.params;

  try {
    const template = await prisma.template.findUnique({
      where: { id: Number(templateId) },
      include: { questions: true, tags: true, author: true, comments: true },
    });

    if (!template) {
      res.status(404).json({ message: "Template not found" });
      return;
    }

    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching template", error });
  }
};

// Get comments for a specific template
export const getTemplateComments: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { templateId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { templateId: Number(templateId) },
      include: { user: true },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

// Create a new comment on a template
export const createComment: RequestHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { templateId } = req.params;
  const { content } = req.body;
  const userId = Number(req.user?.id); // Updated access

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        template: { connect: { id: Number(templateId) } },
        user: { connect: { id: userId } },
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: "Error creating comment", error });
  }
};

// Edit a template
export const editTemplate: RequestHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { templateId } = req.params;
  const { title, description, topic, tags, questions } = req.body;

  try {
    const updatedTemplate = await prisma.template.update({
      where: { id: Number(templateId) },
      data: {
        title,
        description,
        topic,
        tags: {
          set: tags.map((tag: string) => ({ name: tag })),
        },
        questions: {
          deleteMany: {}, // Clear existing questions
          create: questions.map((question: any) => ({
            text: question.text,
            type: question.type,
            options: question.options,
          })),
        },
      },
    });
    res.json(updatedTemplate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating template", error });
  }
};

// Delete a template
export const deleteTemplate: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { templateId } = req.params;

  try {
    await prisma.template.delete({
      where: { id: Number(templateId) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting template", error });
  }
};

// Edit a comment
export const editComment: RequestHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const updatedComment = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { content },
    });
    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error });
  }
};

// Delete a comment
export const deleteComment: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { commentId } = req.params;

  try {
    await prisma.comment.delete({
      where: { id: Number(commentId) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};

// Get tags
export const getTags: RequestHandler = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tags", error });
  }
};
