const express = require('express');
const produtoController = require("./produtoController");
const autenticar = require("../../middlewares/autenticar");
const { upload } = require("../../middlewares/upload");

const router = express.Router();

// Rotas produto
router.post('/produto', autenticar, produtoController.inserirProduto);
router.get('/produto', autenticar, produtoController.listarProdutos);
router.get('/produto/:id', autenticar, produtoController.listarProdutoPorId);
router.put('/produto/:id', autenticar, produtoController.atualizarProduto);
router.put('/produto/status/:id', autenticar, produtoController.alterarSatusProduto);
router.delete('/produto/:id', autenticar, produtoController.excluirProduto);

// Rotas imagens produto
router.post('/produto/upload-imagem', autenticar, upload.single('imagem'), produtoController.uploadImagem);

// Rotas Mercado Livre
router.post('/produto/mercado-livre/publicar/:produtoId', autenticar, produtoController.publicarProdutoML);
router.put('/produto/mercado-livre/editar/:produtoId', autenticar, produtoController.editarProdutoML);

module.exports = router;