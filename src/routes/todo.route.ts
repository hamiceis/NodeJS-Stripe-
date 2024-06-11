import { Router } from "express"
import { createTodoController } from "../controllers/todo.controller"

export const todoRouter = Router()

todoRouter.post("/todos", createTodoController)