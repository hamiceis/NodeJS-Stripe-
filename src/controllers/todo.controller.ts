import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod"

export const createTodoController = async (req: Request, res: Response) => {
  const userIdSchema = z.string().min(1)
  const bodySchema = z.object({
    title: z.string().min(3)
  })

  try {
    const validaResult = userIdSchema.safeParse(req.headers["x-user-id"])

    if (!validaResult.success) {
      return res.status(403).send({
       error: validaResult.error.errors[0].message,
       message: "Not authorized"
      });
    }
    const userId = validaResult.data 

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(403).send({
        error: "Not authorized",
      });
    }

    const { title } = bodySchema.parse(req.body)

    const todo = await prisma.todo.create({
      data: {
        title,
        ownerId: user.id
      }
    })

    return res.status(201).send(todo)

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
