import Stripe from "stripe";
import { config } from "../../config";
import { prisma } from "./prisma";

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
});

interface CustomerSubscriptionUpdatedProps {
    object: Stripe.Subscription;
}
interface CheckoutSessionCompletedProps {
  object: Stripe.Checkout.Session;
}

export interface StripeCheckoutTypes {
  event: {
    type: Stripe.Event.Type
  }
}

//Função para buscar no Stripe os clientes por email
export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({ email });
  return customers.data[0]
}

export const createStripeCustomer = async (input: { email: string, name: string}) => {
   //Busca se há algum email correspondente 
   let customer = await getStripeCustomerByEmail(input.email)

   if(customer) {
    return customer
   }

   return await stripe.customers.create({ email: input.email, name: input.name })
}


//Cria um sessão de Checkout
export const createCheckoutSession = async (userId: string, userEmail: string, name: string) => {
  try {
    let customer = await createStripeCustomer({ email: userEmail, name})

    //Objeto com opções de pagamentos, método de pagamento, iD do usuário, quantidade e valor etc
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      client_reference_id: userId,
      customer: customer.id,
      line_items: [
        {
          price: config.stripe.proPriceId,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3333/sucess.html",
      cancel_url: "http://localhost:3333/cancel.html",
    });

    return {
      url: session.url,
    };
  } catch (error) {
    console.log("[STRIPE_ERROR_GENERATE]", error);
    throw new Error("Error to create checkout session")
  }
};

//função assicrona para tratar de eventos de conclusão de sessão de checkout
export const handleProcessWebhookCheckout = async (
  event: CheckoutSessionCompletedProps
) => {
  const clientReferenceId = event.object.client_reference_id as string; //Id do usuário passado pelo checkout
  const stripeSubscriptionId = event.object.subscription as string; //Id do subscription do Stripe
  const stripeCustomerId = event.object.customer as string; // Id Client do Stripe
  const checkoutStatus = event.object.status; // Status do pagamento
 
  if (checkoutStatus !== "complete") {
    return;
  }

  if (!clientReferenceId || !stripeCustomerId || !stripeSubscriptionId) {
    throw new Error(
      "clientReferenceId, stripeSubscriptionId and stripeCustomerId is required"
    );
  }

  const userExist = await prisma.user.findUnique({
    where: {
      id: clientReferenceId,
    },
    select: {
      id: true,
    },
  });

  if (!userExist) {
    throw new Error("user of clientReferenceId not found");
  }

  //Cria um registro com os dados do Stripe ClientId e SubscriptionId
  await prisma.user.update({
    where: {
      id: userExist.id,
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
    },
  });
};

//função assincrona para tratar de eventos de atualização de assinatura
export const handleProcessWebhookUpdatedSubscription = async (
  event: CustomerSubscriptionUpdatedProps
) => {
  const stripeSubscriptionStatus = event.object.status //Status de inscrição do usuário, se ele está atrasado, pagou etc
  const stripeCustomerId = event.object.customer as string //Id do cliente do Stripe
  const stripeSubscriptionId = event.object.id   as string // Id do subscription 

  const userExist = await prisma.user.findFirst({
    where: {
      stripeCustomerId
    },
    select: {
      id: true, 
      stripeSubscriptionStatus: true,
    }
  })

  console.log("Subscription updated with status:", stripeSubscriptionStatus);

  if(!userExist) {
    throw new Error("user of stripeCustomerId not found")
  }

   // Atualiza os dados clientIdStripe e StripeSubscriptionId e Status de pagamento se o novo status é diferente
  if (userExist.stripeSubscriptionStatus !== stripeSubscriptionStatus) {
    await prisma.user.update({
      where: {
        id: userExist.id
      },
      data: {
        stripeCustomerId,
        stripeSubscriptionId,
        stripeSubscriptionStatus
      }
    });
    console.log(`User ${userExist.id} subscription status updated to ${stripeSubscriptionStatus}`);
  } else {
    console.log(`User ${userExist.id} subscription status remains ${stripeSubscriptionStatus}`);
  }
};


