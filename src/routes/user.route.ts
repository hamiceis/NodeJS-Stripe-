import { Router } from "express";
import { 
  listUsersController,
  findOneUserController,
  createUserController
 } from "../controllers/user.controller"

export const userRouter = Router()

userRouter.get("/users", listUsersController)
userRouter.get("/users/:userId", findOneUserController)
userRouter.post("/users", createUserController)