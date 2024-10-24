import { Request, Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware"; // Ensure AuthRequest is exported from authMiddleware

export const createForm = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { templateId, answers } = req.body; // Assume answers are being sent in the request body
  const userId = Number(req.user?.id);

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
    console.error(error);
    res.status(400).json({ message: "Error creating form", error });
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
    console.error(error);
    res.status(400).json({ message: "Error fetching filled forms", error });
  }
};

export const deleteForm = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.form.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Form deleted" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error deleting form", error });
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
    console.error(error);
    res.status(400).json({ message: "Error fetching filled forms", error });
  }
};
