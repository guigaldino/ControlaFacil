const express = require("express");
const router = express.Router();
const autenticar = require("../../middlewares/autenticar");
const relatorioController = require("./relatorioController");

// Rotas do Módulo de Relatórios (o prefixo /api é inserido no app.js de forma global)
router.get("/relatorios/dashboard", autenticar, relatorioController.getDashboard);
router.get("/relatorios/predefinido/:tipo", autenticar, relatorioController.getRelatorioPredefinido);

// CRUD de Relatórios Personalizados
router.post("/relatorios/personalizados", autenticar, relatorioController.criarRelatorioPersonalizado);
router.get("/relatorios/personalizados", autenticar, relatorioController.listarRelatoriosPersonalizados);
router.get("/relatorios/personalizados/:id", autenticar, relatorioController.obterRelatorioPersonalizado);
router.put("/relatorios/personalizados/:id", autenticar, relatorioController.atualizarRelatorioPersonalizado);
router.delete("/relatorios/personalizados/:id", autenticar, relatorioController.excluirRelatorioPersonalizado);

module.exports = router;
