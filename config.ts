export const config = {
  stripe: {
    publishableKey:
      "pk_test_51PQuAcBxPSTDgyKK36yNyXQVJ2uUwAojPnKmDOPjmCCsAGhwFharxXnSS9B4JirKpXPWX4ZYOXcVTdzlddkxmmLN007HVH5gmp",
    secretKey:
      "sk_test_51PQuAcBxPSTDgyKKpHeZR0tG6emioaQrRGDeB5cXqmsxgYsd1Dv5F45z7uKroMVYTFUJjYQPKz2ci4X05UPAx47q00IqpKybCE",
    proPriceId: "price_1PQv6TBxPSTDgyKKDthNKLv9",
    webhookSecret: "whsec_6db741fe0f64657c3c1f25143c6e40bbf69509349dba0679cfb53e60662a1a74",
  },
};


/*
Essas variáveis devem estár dentro do arquivo .env que são dados sensíveis e não devem estár expostos, porém como isso é apenas para fins didáticos estou armazenando aqui..


STRIPE_PUBLISHABLE_KEY = Você pega esses dados, na aréa de desenvolvedores no stripe
STRIPE_SECRET_KEY = Você pega esses dados, na aréa de desenvolvedores no stripe

PRO_PRICE_ID = Você cria esse dado no 'Catalogos de produtos' e assim que criar vai ser gerado pelo stripe o Id

WEBHOOK_SECRET = Após você logar com a CLI do Stripe usando o comando "stripe login" concedendo permissão.
                 Você deve rodar depois o seguinte comando "stripe listen --forward-to localhost:3333/webhook"
                 Após confirmar vai ser gerado um WebHook Token para você fazer os testes.

*/