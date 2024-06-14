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


/* 
1. invoice.updated
Este evento é acionado quando uma fatura (invoice) existente é atualizada. As atualizações podem incluir mudanças em linhas de itens, descontos, notas ou outros atributos da fatura.

2. invoice.paid
Este evento é acionado quando uma fatura é paga. Isso significa que o pagamento foi processado com sucesso e os fundos foram transferidos.

3. checkout.session.completed
Este evento é acionado quando uma sessão de checkout é concluída com sucesso. Isso significa que o cliente passou pelo fluxo de checkout e o pagamento foi efetuado.

Outros eventos importantes
4. invoice.created
Acionado quando uma nova fatura é criada.

5. invoice.payment_failed
Acionado quando um pagamento de fatura falha.

6. customer.created
Acionado quando um novo cliente é criado na plataforma Stripe.

7. customer.updated
Acionado quando um cliente existente é atualizado.

8. customer.subscription.created
Acionado quando uma nova assinatura é criada para um cliente.

9. customer.subscription.updated
Acionado quando uma assinatura existente é atualizada.

10. customer.subscription.deleted
Acionado quando uma assinatura é cancelada ou removida.

11. payment_intent.created
Acionado quando um novo PaymentIntent é criado. PaymentIntents representam a intenção de processar um pagamento e são utilizados para gerenciar o processo de pagamento.

12. payment_intent.succeeded
Acionado quando um PaymentIntent é concluído com sucesso.

13. payment_intent.payment_failed
Acionado quando uma tentativa de pagamento falha.

14. charge.succeeded
Acionado quando uma cobrança (charge) é realizada com sucesso.

15. charge.failed
Acionado quando uma tentativa de cobrança falha.

16. charge.refunded
Acionado quando uma cobrança é reembolsada, total ou parcialmente.

17. payout.created
Acionado quando uma transferência de fundos para a conta bancária do usuário é criada.

18. payout.paid
Acionado quando a transferência de fundos para a conta bancária do usuário é concluída com sucesso.

19. payout.failed
Acionado quando uma transferência de fundos falha.

20. product.created
Acionado quando um novo produto é criado no Stripe.

21. product.updated
Acionado quando um produto existente é atualizado.

22. price.created
Acionado quando um novo preço é criado para um produto.

23. price.updated
Acionado quando um preço existente é atualizado.
*/
