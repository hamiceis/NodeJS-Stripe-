import Stripe from "stripe"
import { config } from "../../config"

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2024-04-10"
})

interface CustomerSubscriptionUpdatedProps {
  event: {
    data: {
      object: Stripe.Subscription
    }
  }
}
interface CheckoutSessionCompletedProps {
  event: {
    data: {
      object: Stripe.Checkout.Session
    }
  }
}

export const createCheckoutSession = async (userId: string) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      client_reference_id: userId,
      line_items: [{
        price: config.stripe.proPriceId,
        quantity: 1
      }],
      success_url: "http://localhost:3333/sucess.html",
      cancel_url: "http://localhost:3333/cancel.html"
    })

    return {
      url: session.url
    }
  } catch(error) {
    console.log("[STRIPE_ERROR_GENERATE]", error)
  }
}
//eventos de conclusão de sessão de checkout
export const handleProcessWebhookCheckout = (event: CheckoutSessionCompletedProps) => {}

//eventos de atualização de assinatura
export const handleProcessWebhookUpdatedSubscription = (event: CustomerSubscriptionUpdatedProps) => { }