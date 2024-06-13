import { Router } from "express";
import { createCheckoutController } from "../controllers/checkout.controller";

export const checkoutRouter = Router();

checkoutRouter.post("/checkout", createCheckoutController);
