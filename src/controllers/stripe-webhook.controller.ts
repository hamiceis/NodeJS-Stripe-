import { type Request, type Response } from "express";
import { z } from "zod"
import { config } from "../../config";
import {
  stripe,
  handleProcessWebhookCheckout,
  handleProcessWebhookUpdatedSubscription,
} from "../lib/stripe";
import Stripe from "stripe"


//Rota do Webhook para armazenamento de dados do banco de dados após a confirmação do pagamento/atualização de pag.
export const stripeWebhookController = async (req: Request, res: Response) => {
  let event: Stripe.Event

  if (!config.stripe.webhookSecret) {
    console.log("[STRIPE_WEBHOOK_SECRET_KEY não está atribuida]");
    return res.status(400).send();
  }

  const signature = req.headers["stripe-signature"] as string
 
  try {
    event = await stripe.webhooks.constructEventAsync(
      req.body,
      signature,
      config.stripe.webhookSecret,
      undefined, //esses dados não são necessários, só estamos colocando se por acaso ocorrer algum erro
      Stripe.createSubtleCryptoProvider(), //esses dados não são necessários 
    );
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .send({ message: "Webhook signature verification failed" });
  }
  
  try {
    switch (event.type) {
      case "checkout.session.completed":
            await handleProcessWebhookCheckout(event.data);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
           await handleProcessWebhookUpdatedSubscription(event.data);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return res.json({
      received: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "internal Server Error Webhook" });
  }
};

//Os Event Types você consegue consultar pelos docs do stripe webkooks, que são eventos de pagamentos, se foi pagamento aceito, rejeitado, se é subscription etc.
