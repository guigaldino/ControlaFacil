const express = require('express');
const router = express.Router();
const autenticar = require('../../middlewares/autenticar');
const pedidoController = require('./pedidoController');

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: API para gerenciamento de pedidos integrados
 */

// Rota para listar pedidos vinculados ao usuário autenticado (Grid)
router.get('/pedidos', autenticar, pedidoController.listarPedidos);

// Rota para obter detalhes de um pedido específico (Detalhes)
router.get('/pedidos/:id', autenticar, pedidoController.obterDetalhesPedido);

module.exports = router;
