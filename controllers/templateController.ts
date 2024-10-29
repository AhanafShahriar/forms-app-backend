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
  const {
    title,
    description,
    topic,
    tags,
    questions,
    imageUrl,
    selectedUsers,
  } = req.body;
  const isPublic = req.body.public; // Directly use the boolean value
  const userId = Number(req.user?.id);

  if (!userId) {
    res.status(400).json({ message: "User  ID is required." });
    return;
  }

  console.log("Request body:", req.body);

  try {
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

    console.log("New Template Created:", newTemplate);

    // Connect allowed users if the template is not public
    if (!isPublic && Array.isArray(selectedUsers) && selectedUsers.length > 0) {
      console.log("Connecting allowed users:", selectedUsers);
      await prisma.template.update({
        where: { id: newTemplate.id },
        data: {
          allowedUsers: {
            connect: selectedUsers.map((userId: number) => ({ id: userId })),
          },
        },
      });
    }

    res.status(201).json(newTemplate);
  } catch (error: unknown) {
    console.error("Error creating template:", error);
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

export const searchTemplates: RequestHandler = async (req, res) => {
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
          { topic: { contains: query, mode: "insensitive" } },
          {
            tags: { some: { name: { contains: query, mode: "insensitive" } } },
          },
          {
            questions: {
              some: {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                ],
              },
            },
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
        questions: true,
      },
    });

    res.status(200).json(templates);
  } catch (error) {
    console.error("Error searching templates:", error);
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
      include: {
        questions: {
          include: {
            options: true, // Include options for each question
          },
        },
        tags: true,
        author: true,
        comments: true,
      },
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
  req: AuthRequest,
  res: Response
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

export const editTemplate: RequestHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { templateId } = req.params;
  const {
    title,
    description,
    topic,
    tags,
    questions,
    public: isPublic,
    allowedUsers,
  } = req.body;

  try {
    // Validate incoming data
    if (!title || !description || !topic) {
      res
        .status(400)
        .json({ message: "Title, description, and topic are required." });
      return;
    }

    // Check if the template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id: Number(templateId) },
      include: { questions: true, allowedUsers: true },
    });

    if (!existingTemplate) {
      res.status(404).json({ message: "Template not found" });
      return;
    }

    // Clear existing options and questions
    await prisma.option.deleteMany({
      where: {
        questionId: { in: existingTemplate.questions.map((q) => q.id) },
      },
    });

    await prisma.question.deleteMany({
      where: { templateId: Number(templateId) },
    });

    // Create new questions and options
    const createdQuestions = await Promise.all(
      questions.map(async (question: any) => {
        const createdQuestion = await prisma.question.create({
          data: {
            title: question.title,
            description: question.description,
            type: question.type,
            displayedInTable: question.displayedInTable,
            template: {
              connect: {
                id: Number(templateId),
              },
            },
            options: {
              create: question.options.map((option: any) => ({
                value: option.value, // Ensure this is a string
              })),
            },
          },
        });
        return createdQuestion;
      })
    );

    // Update the template with new data
    const updatedTemplate = await prisma.template.update({
      where: { id: Number(templateId) },
      data: {
        title,
        description,
        topic,
        public: isPublic,
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        questions: {
          connect: createdQuestions.map((q) => ({ id: q.id })),
        },
        allowedUsers: {
          connect: allowedUsers.map((userId: number) => ({ id: userId })),
        },
      },
      include: { questions: true, allowedUsers: true },
    });

    res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template:", error);
    const errorMessage =
      (error as Error).message || "An unknown error occurred.";
    res
      .status(500)
      .json({ message: "Error updating template", error: errorMessage });
  }
};

// Delete a template
export const deleteTemplate: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { templateId } = req.params;

  try {
    // First, delete any related records (e.g., Questions)
    await prisma.question.deleteMany({
      where: { templateId: Number(templateId) },
    });

    // Now delete the template
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
export const likeTemplate: RequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  const { templateId } = req.params;
  const userId = req.user?.id;

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: Number(userId),
        templateId: Number(templateId),
      },
    });

    if (existingLike) {
      // If the user already liked the template, remove the like
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      // Otherwise, create a new like
      await prisma.like.create({
        data: {
          template: { connect: { id: Number(templateId) } },
          user: { connect: { id: Number(userId) } },
        },
      });
    }

    res.status(200).json({ message: "Like updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error liking template", error });
  }
};
