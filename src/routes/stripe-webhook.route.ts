import { Router, raw } from "express"
import { stripeWebhookController } from "../controllers/stripe-webhook.controller"

export const stripeWebhookRouter = Router()

stripeWebhookRouter.post("/webhook", raw({ type: "application/json"}), stripeWebhookController)


/*
// Precisamos usar raw({ type: "application/json" }) porque o Stripe exige que os webhooks sejam recebidos
// exatamente como foram enviados, sem qualquer modificação ou processamento. O middleware 'raw' do Express
// permite que o corpo da solicitação seja acessado como um Buffer, mantendo a integridade dos dados e 
// permitindo a verificação da assinatura da mensagem pelo Stripe.
*/

