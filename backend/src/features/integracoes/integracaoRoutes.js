const express = require('express');

const autenticar = require('../../middlewares/autenticar');

const router = express.Router();

const integracaoController = require('./integracaoController');


/**
 * @swagger
 * tags:
 *   name: Integrações
 *   description: API para gerenciamento de integrações
 */

router.post('/integracoes', autenticar, integracaoController.cadastrarIntegracao);
router.get('/integracoes', autenticar, integracaoController.listarIntegracoes); 
router.put('/integracoes', autenticar, integracaoController.editarIntegracao);
router.delete('/integracoes/:id', autenticar, integracaoController.inativarIntegracao);
router.get('/integracoes/mercado-livre/auth', autenticar, integracaoController.authMercadoLivre);

// ─── Rotas de Teste ───────────────────────────────────────────────────────────   
// Valida o token atual e faz uma chamada real à API do ML
router.get('/integracoes/mercado-livre/testar-token/:integracaoId', autenticar, integracaoController.testarToken);
// Força a expiração do token no banco e dispara o refresh automático
router.post('/integracoes/mercado-livre/forcar-refresh/:integracaoId', autenticar, integracaoController.forcarRefresh);

module.exports = router;
