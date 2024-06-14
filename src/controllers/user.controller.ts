import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { createStripeCustomer, getStripeCustomerByEmail, getStripeCustomerSubscription } from "../lib/stripe";

export const listUsersController = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  const customersSubscriptions = await getStripeCustomerSubscription(users.length)

  return res.status(200).json({ users, customersSubscriptions });
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
        todos: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const stripeCustomer = await getStripeCustomerByEmail(user.email)


    return res.status(200).send({
      user,
      stripeCustomer
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const bodySchema = z.object({
      name: z.string().min(3, { message: "Nome muito curto" }),
      email: z.string().email(),
    });

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
    //Cria um client no Stripe
    const stripeCustomer = await createStripeCustomer({ email, name })

    const user = await prisma.user.create({
      data: {
        name,
        email,
        stripeCustomerId: stripeCustomer.id
      },
    });

    return res.json(user);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatedStripeStatusController = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, 
        stripeSubscriptionId: true,
      }
    })
    if(!users) {
      return res.status(403).send("Not Authorized")
    }

    const stripeCustomersActive = await getStripeCustomerSubscription(users.length)

    const updateUsers = async () => {
      for (const user of users) {
        const customer = stripeCustomersActive.find(c => c.id === user.stripeSubscriptionId);
        if (customer) {
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeSubscriptionStatus: "active" }
          });
        }
      }
    };

    await updateUsers()

    return res.status(200).send({ message: "OK"})
  } catch (error) {
    console.log("[STRIPE_UPDATED_STATUS_ROUTE_ERROR]")
    return res.status(500).send({ message: "STRIPE_UPDATED_STATUS_ROUTE_ERROR"})
  }
}
 
export const deleteAllUsersController = async (req: Request, res: Response) => {
  await prisma.todo.deleteMany()
  await prisma.user.deleteMany()
  return res.status(200).send({ messsage: "All users deleted"})
}