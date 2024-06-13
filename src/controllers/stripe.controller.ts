import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { config } from "../../config";
import { 
   stripe,
   handleProcessWebhookCheckout,
   handleProcessWebhookUpdatedSubscription } from "../lib/stripe";

export const stripeWebhookController = async (req: Request, res: Response) => {
  const bodySchama = z.object({
    event: z.object({
      type: z.string()
    })
  })
  const validationStripeSignature = z.string().min(1);

  let event = req.body

  if (!config.stripe.secretKey) {
    console.log("[STRIPE_WEBHOOK_SECRET_KEY não está atribuida]");
    return res.status(400).send();
  }

  const signature = validationStripeSignature.parse(
    req.headers["stripe-signature"]
  );
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.secretKey
    );
  } catch (error) {
    console.error(error);
    return res.status(400).send({ message: "Webhook signature verification failed" });
  }

  try {
    switch(event.type) {
      case 'checkout.session.completed':
        await handleProcessWebhookCheckout(event);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleProcessWebhookUpdatedSubscription(event);
        break;
      default: 
        console.log(`Unhandled event type ${event.type}`)
    }
    return res.json({
      received: true
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: "internal Server Error Webhook"})
  }
};


//Os Event Types você consegue consultar pelos docs do stripe webkooks