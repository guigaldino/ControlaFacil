const express = require('express');
const router = express.Router();
const webhookController = require('./webhookController');

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: API para recebimento de webhooks externos
 */

// Rota pública para receber as notificações do Mercado Livre
// Nota: Não utilizamos o middleware "autenticar" pois esta chamada é feita diretamente pelos servidores do Mercado Livre
router.post('/webhooks/mercado-livre', webhookController.receberWebhook);

module.exports = router;
