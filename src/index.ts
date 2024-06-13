import express from "express";
import cors from "cors";

import { userRouter } from "./routes/user.route";
import { todoRouter } from "./routes/todo.route";
import { checkoutRouter } from "./routes/checkout.route";
import { stripeWebhookRouter } from "./routes/stripe-webhook.route";

const app = express();

app.use(cors({
  origin: "*"
}));

// Rota do webhook Stripe antes do middleware express.json(), pois webhook não aceita JSON
app.use("/", stripeWebhookRouter);

// Isso faz com que o express aceite pelo corpo da requisição o formato JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use(userRouter);
app.use(todoRouter);
app.use(checkoutRouter);

app.get("/", (req, res) => {
  return res.send("Hello World");
});

app.listen(3333, () => {
  console.log("Server running http://localhost:3333");
});