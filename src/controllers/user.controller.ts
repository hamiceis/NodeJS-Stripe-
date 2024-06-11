import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export const listUsersController = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  return res.status(200).json({ users });
};

export const findOneUserController = async (req: Request, res: Response) => {
  const paramsSchema = z.object({
    userId: z.string(),
  });

  try {
    const { userId } = paramsSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const createUserController = async (req: Request, res: Response) => {
  const bodySchema = z.object({
    name: z.string().min(3, { message: "Nome muito curto" }),
    email: z.string().email(),
  });
  try {
    const { name, email } = bodySchema.parse(req.body);

    const userEmailAlreadyExist = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (userEmailAlreadyExist) {
      return res.status(401).json({ message: "Email already exist" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    return res.json(user);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
