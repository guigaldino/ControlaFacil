const express = require('express');
const estoqueController = require('./estoqueController');
const autenticar = require("../../middlewares/autenticar");

const router = express.Router();

// Rotas de movimentação
router.get('/estoque/movimentacoes', estoqueController.listarTodasMovimentacoes);
router.post('/estoque/movimentacoes', estoqueController.registrarMovimentacao);
router.get('/estoque/movimentacoes/:produtoId', estoqueController.listarMovimentacoes);

// Rotas de saldo de estoque
router.get('/estoque/:produtoId', estoqueController.consultarEstoqueProduto);

module.exports = router;
