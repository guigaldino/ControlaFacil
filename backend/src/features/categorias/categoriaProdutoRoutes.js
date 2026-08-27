const express = require('express');

const autenticar = require('../../middlewares/autenticar');

const router = express.Router();

const categoriaProdutoController = require('./categoriaProdutoController');

/**
 * @swagger
 * /categoria-produto:
 *   post:
 *     summary: Cria uma nova categoria de produto
 *     tags:
 *       - CategoriaProduto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Escolares"
 *               usuario_criador:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *             required:
 *               - nome
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nome:
 *                       type: string
 *                     usuario_criador:
 *                       type: integer
 *                       nullable: true
 *                     excluido:
 *                       type: integer
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 sucesso:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Erro interno ao criar categoria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 sucesso:
 *                   type: boolean
 *                   example: false
 */

/**
 * @swagger
 * /categoria-produto:
 *   get:
 *     summary: Lista todas as categorias de produto
 *     tags:
 *       - CategoriaProduto
 *     responses:
 *       200:
 *         description: Lista de categorias de produto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nome:
 *                         type: string
 *                       usuario_criador:
 *                         type: integer
 *                         nullable: true
 *                       excluido:
 *                         type: integer
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Erro interno ao listar categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 sucesso:
 *                   type: boolean
 *                   example: false
 */

router.post('/categoria-produto', autenticar, categoriaProdutoController.inserirCategoriaProduto);
router.get('/categoria-produto', autenticar, categoriaProdutoController.listarCategoriasProduto);
router.put('/categoria-produto', autenticar, categoriaProdutoController.atualizarCategoriaProduto);
router.delete('/categoria-produto/:id', autenticar, categoriaProdutoController.excluirCategoriaProduto);
router.post('/categoria-produto/mercado-livre/sugeridas', autenticar, categoriaProdutoController.buscarSugestaoCategorias);
router.post('/categoria-produto/mercado-livre/categoria/atributos', autenticar, categoriaProdutoController.obterAtributosCategoria);

module.exports = router;