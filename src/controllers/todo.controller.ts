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

    //precisamos fazer uma count de quantos todos este usuário tem
    //precisamos pegar o idSubscription e stripeStatus para fazer validações
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        stripeSubscriptionId: true, 
        stripeSubscriptionStatus: true,
        _count: {
          select: {
            todos: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(403).send({
        error: "Not authorized",
      });
    }
    const hasQuotaAvailable = user._count.todos < 5
    const hasActiveSubscription = !user.stripeSubscriptionId || user.stripeSubscriptionStatus !== "active"

    if(!hasQuotaAvailable && hasActiveSubscription) {
      return res.status(403).send({
        error: "Not quota available. Please upgrade your plan.",
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
