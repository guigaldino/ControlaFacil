const express = require('express');

const autenticar = require('../../middlewares/autenticar');
const router = express.Router(); // Cria um objeto router

const usuarioController = require('./usuarioController');

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: API para gerenciamento de usuários
 */

/**
 * @swagger
 * /api/usuarios/me:
 *   get:
 *     summary: Retorna os dados do usuário logado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário logado retornados com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Dados do usuário logado obtidos com sucesso
 *               usuario:
 *                 id: 1
 *                 nome: "João da Silva"
 *                 email: "joao@email.com"
 *                 cpf: "12345678900"
 *                 celular: "11999999999"
 *                 cargo: "Administrador"
 *               sucesso: true
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             example:
 *               error: Token inválido ou ausente
 *               sucesso: false
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: Usuário não encontrado
 *               sucesso: false
 *       500:
 *         description: Erro ao obter dados do usuário logado
 *         content:
 *           application/json:
 *             example:
 *               error: Erro ao obter dados do usuário logado
 *               message: "Mensagem detalhada do erro"
 *               sucesso: false
 */

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Cria um novo usuário no sistema
 *     tags: [Usuários]
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
 *                 example: "João da Silva"
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               cpf:
 *                 type: string
 *                 example: "12345678900"
 *               celular:
 *                 type: string
 *                 example: "11999999999"
 *               cargo:
 *                 type: string
 *                 example: "Administrador"
 *               senha:
 *                 type: string
 *                 example: "senhaSegura123"
 *             required:
 *               - nome
 *               - email
 *               - cpf
 *               - celular
 *               - cargo
 *               - senha
 *     responses:
 *       201:
 *         description: Usuário inserido com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Usuário inserido com sucesso
 *               idUsuario: 10
 *               sucesso: true
 *       400:
 *         description: Erro na requisição
 *         content:
 *           application/json:
 *             examples:
 *               DadosObrigatorios:
 *                 summary: Dados obrigatórios não foram preenchidos
 *                 value:
 *                   error: Dados obrigatórios não foram preenchidos
 *                   sucesso: false
 *               CpfJaCadastrado:
 *                 summary: CPF já cadastrado
 *                 value:
 *                   error: CPF já cadastrado
 *                   sucesso: false
 *               EmailJaCadastrado:
 *                 summary: Email já cadastrado
 *                 value:
 *                   error: Email já cadastrado
 *                   sucesso: false
 *       500:
 *         description: Erro interno ao inserir usuário
 *         content:
 *           application/json:
 *             example:
 *               error: Erro ao inserir usuário
 *               message: "Mensagem detalhada do erro"
 *               sucesso: false
 */

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Faz o login de um usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 example: "senhaSegura123"
 *             required:
 *               - email
 *               - senha
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Login realizado com sucesso
 *               usuario:
 *                 id: 10
 *                 nome: "João da Silva"
 *                 cpf: "12345678900"
 *                 celular: "11999999999"
 *                 email: "joao@email.com"
 *                 cargo: "Administrador"
 *               sucesso: true
 *       400:
 *         description: Dados obrigatórios não foram preenchidos
 *         content:
 *           application/json:
 *             example:
 *               error: Email e senha são obrigatórios
 *               sucesso: false
 *       401:
 *         description: Senha incorreta
 *         content:
 *           application/json:
 *             example:
 *               error: Senha incorreta
 *               sucesso: false
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: Usuário não encontrado
 *               sucesso: false
 *       500:
 *         description: Erro interno ao fazer login
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             example:
 *               quantidade: 2
 *               data:
 *                 - id: 1
 *                   nome: "João da Silva"
 *                   email: "joao@email.com"
 *                   cpf: "12345678900"
 *                   celular: "11999999999"
 *                   cargo: "Administrador"
 *                 - id: 2
 *                   nome: "Maria Souza"
 *                   email: "maria@email.com"
 *                   cpf: "98765432100"
 *                   celular: "11988887778"
 *                   cargo: "Usuário"
 *               sucesso: true
 *       500:
 *         description: Erro ao listar usuários
 *         content:
 *           application/json:
 *             example:
 *               error: Erro ao listar usuários
 *               message: "Mensagem detalhada do erro"
 *               sucesso: false
 */

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Usuário encontrado
 *               data:
 *                 id: 1
 *                 nome: "João da Silva"
 *                 email: "joao@email.com"
 *                 cpf: "12345678900"
 *                 celular: "11999999999"
 *                 cargo: "Administrador"
 *               sucesso: true
 *       400:
 *         description: ID não informado
 *         content:
 *           application/json:
 *             example:
 *               error: ID é obrigatório
 *               sucesso: false
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: Usuário não encontrado
 *               sucesso: false
 *       500:
 *         description: Erro ao buscar usuário
 *         content:
 *           application/json:
 *             example:
 *               error: Erro ao buscar usuário por ID
 *               message: "Mensagem detalhada do erro"
 *               sucesso: false
 */

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Atualiza os dados de um usuário existente
 *     description: Atualiza os campos informados de um usuário pelo ID. Campos não enviados permanecem inalterados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               nome:
 *                 type: string
 *                 example: "João da Silva"
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               cpf:
 *                 type: string
 *                 example: "12345678900"
 *               celular:
 *                 type: string
 *                 example: "11999999999"
 *               cargo:
 *                 type: string
 *                 example: "Administrador"
 *             required:
 *               - id
 *     responses:
 *       '200':
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário atualizado com sucesso"
 *                 data:
 *                   type: object
 *                   description: Dados do usuário atualizado
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *       '400':
 *         description: Erro de validação (ID ausente)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID é obrigatório"
 *                 sucesso:
 *                   type: boolean
 *                   example: false
 *       '404':
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuário com ID 1 não encontrado"
 *                 sucesso:
 *                   type: boolean
 *                   example: false
 *       '500':
 *         description: Erro interno ao atualizar usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao atualizar usuário"
 *                 message:
 *                   type: string
 *                   example: "Detalhes do erro"
 *                 sucesso:
 *                   type: boolean
 *                   example: false
 */

router.post('/usuarios', usuarioController.inserirUsuario);
router.post('/usuarios/login', usuarioController.login);
router.get('/usuarios/verificar-email/:token', usuarioController.verificarEmail);
router.get('/usuarios', autenticar, usuarioController.listarUsuarios);
router.get('/usuarios/me', autenticar, usuarioController.dadosUsuarioLogado);
router.get('/usuarios/:id', autenticar, usuarioController.buscarPorId);
router.put('/usuarios/:id', autenticar, usuarioController.atualizarUsuario);

module.exports = router;