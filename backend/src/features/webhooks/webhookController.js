const pedidoService = require('../pedidos/pedidoService');

const webhookController = {
  /**
   * Recebe as notificações de webhook enviadas pelo Mercado Livre.
   */
  async receberWebhook(req, res) {
    try {
      const payload = req.body;

      console.log('[Webhook] Notificação recebida do Mercado Livre:', payload);

      // O Mercado Livre exige uma resposta HTTP 200 OK rápida para confirmar o recebimento
      res.status(200).json({ received: true });

      // Processamento assíncrono para não travar a resposta do webhook
      if (payload && (payload.topic === 'orders' || payload.topic === 'orders_v2' || (payload.resource && payload.resource.includes('orders')))) {
        await pedidoService.processarWebhookPedido(payload);
      } else {
        console.log(`[Webhook] Tópico ignorado ou não direcionado para pedidos: ${payload ? payload.topic : 'Vazio'}`);
      }
    } catch (error) {
      console.error('[Webhook Controller] Erro ao processar webhook:', error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro interno no processamento' });
      }
    }
  }
};

module.exports = webhookController;
