import express from "express"
import cors from "cors"

import { userRouter } from "./routes/user.route"
import { todoRouter } from "./routes/todo.route"
import { checkoutRouter } from "./routes/checkout.route"

const app = express()

app.use(express.json())
app.use(cors({
  origin: "*"
}))

//Routers
app.use(userRouter)
app.use(todoRouter)
app.use(checkoutRouter)

app.get("/", (req, res) => {
  return res.send("Hello World")
})

app.listen(3333, () => {
  console.log("Server running http://localhost:3333")
})