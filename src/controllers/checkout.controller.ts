import { type Request, type Response } from "express"
import { z  } from "zod"
import { prisma } from "../lib/prisma"
import { createCheckoutSession } from "../lib/stripe"

//Rota para criação de Checkout 
export const createCheckoutController = async (req: Request, res: Response) => {
    const validationUserId = z.string().min(1)
  try {
      const userId = validationUserId.parse(req.headers["x-user-id"])

      if(!userId) {
        return res.status(403).send({ message: "not authorized"})
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId
        }
      })

      if(!user) {
        return res.status(403).send({ message: "not authorized"})
      }

      const checkout = await createCheckoutSession(user.id, user.email, user.name)

      
      return res.status(200).send(checkout)
       
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Internal server error"
    })
  }
}