import { Request, Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware"; // Ensure AuthRequest is exported from authMiddleware

export const createForm = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { templateId, answers } = req.body; // Assume answers are being sent in the request body
  const userId = Number(req.user?.id);

  // Validate input
  if (!templateId || !Array.isArray(answers) || answers.length === 0) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  try {
    const form = await prisma.form.create({
      data: {
        template: { connect: { id: templateId } },
        user: { connect: { id: userId } },
        answers: {
          create: answers.map((answer: any) => ({
            question: { connect: { id: answer.questionId } },
            value: answer.value,
          })),
        },
      },
    });
    res.status(201).json({ message: "Form created", form });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ message: "Error creating form", error });
  }
};

export const getFilledFormsByTemplateId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { templateId } = req.params;

  try {
    const filledForms = await prisma.form.findMany({
      where: { templateId: Number(templateId) },
      include: { answers: true, user: true }, // Include answers and user info
    });
    res.json(filledForms);
  } catch (error) {
    console.error("Error fetching filled forms:", error);
    res.status(500).json({ message: "Error fetching filled forms", error });
  }
};

export const deleteForm = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const formToDelete = await prisma.form.findUnique({
      where: { id: Number(id) },
    });

    if (!formToDelete) {
      res.status(404).json({ message: "Form not found" });
      return;
    }

    // Delete related answers first
    await prisma.answer.deleteMany({
      where: { formId: Number(id) },
    });

    // Now delete the form
    await prisma.form.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Form deleted" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error deleting form:", error);
      res
        .status(500)
        .json({ message: "Error deleting form", error: error.message });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};
export const getFilledFormsByUserId = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = Number(req.user?.id); // Get the user ID from the authenticated request

  try {
    const filledForms = await prisma.form.findMany({
      where: { userId },
      include: { template: true }, // Include template info
    });
    res.json(
      filledForms.map((form) => ({
        id: form.id,
        templateTitle: form.template.title, // Return the template title
      }))
    );
  } catch (error) {
    console.error("Error fetching filled forms:", error);
    res.status(500).json({ message: "Error fetching filled forms", error });
  }
};
// Function to get a filled form by ID
export const getFilledFormById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const filledForm = await prisma.form.findUnique({
      where: { id: Number(id) },
      include: {
        answers: true,
        user: true,
        template: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!filledForm) {
      res.status(404).json({ message: "Filled form not found" });
      return;
    }

    res.json(filledForm);
  } catch (error) {
    console.error("Error fetching filled form:", error);
    res.status(500).json({ message: "Error fetching filled form", error });
  }
};
// In formController.js
export const updateForm = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { answers } = req.body;

  try {
    const updatedForm = await prisma.form.update({
      where: { id: Number(id) },
      data: {
        answers: {
          deleteMany: {}, // Optional: delete existing answers before updating
          create: answers.map((answer: any) => ({
            question: { connect: { id: answer.questionId } },
            value: answer.value,
          })),
        },
      },
    });
    res.status(200).json({ message: "Form updated successfully", updatedForm });
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ message: "Error updating form", error });
  }
};
