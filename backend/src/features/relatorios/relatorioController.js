const relatorioModel = require("./relatorioModel");

const relatorioController = {
  // ─── 1. DASHBOARD GERAL ───────────────────────────────────────────────────
  async getDashboard(req, res) {
    try {
      const usuarioId = req.usuario?.id || 5; // fallback para desenvolvimento se necessário
      const integracaoId = req.query.integracao_id ? parseInt(req.query.integracao_id, 10) : null;

      const dados = await relatorioModel.obterDashboardGeral(usuarioId, integracaoId);
      return res.status(200).json({
        sucesso: true,
        data: dados
      });
    } catch (error) {
      console.error("Erro no controller ao obter dashboard:", error);
      return res.status(500).json({
        sucesso: false,
        error: error.message
      });
    }
  },

  // ─── 2. RELATORIOS PRE-DEFINIDOS ──────────────────────────────────────────
  async getRelatorioPredefinido(req, res) {
    try {
      const usuarioId = req.usuario?.id || 5;
      const { tipo } = req.params;
      
      const integracaoId = req.query.integracao_id ? parseInt(req.query.integracao_id, 10) : null;
      const categoriaId = req.query.categoria_id ? parseInt(req.query.categoria_id, 10) : null;
      const dataInicio = req.query.data_inicio || null;
      const dataFim = req.query.data_fim || null;

      const filtros = { integracaoId, categoriaId, dataInicio, dataFim };

      let dados;
      if (tipo === "produtos") {
        dados = await relatorioModel.obterRelatorioProdutos(usuarioId, filtros);
      } else if (tipo === "pedidos") {
        dados = await relatorioModel.obterRelatorioPedidos(usuarioId, filtros);
      } else if (tipo === "clientes") {
        dados = await relatorioModel.obterRelatorioClientes(usuarioId, integracaoId);
      } else {
        return res.status(400).json({
          sucesso: false,
          error: "Tipo de relatório pré-definido inválido. Use 'produtos', 'pedidos' ou 'clientes'."
        });
      }

      return res.status(200).json({
        sucesso: true,
        data: dados
      });
    } catch (error) {
      console.error("Erro no controller ao obter relatório pré-definido:", error);
      return res.status(500).json({
        sucesso: false,
        error: error.message
      });
    }
  },

  // ─── 3. CRUD DE RELATORIOS PERSONALIZADOS ──────────────────────────────────
  async criarRelatorioPersonalizado(req, res) {
    try {
      const usuarioId = req.usuario?.id || 5;
      const { nome, descricao, tipo, filtros, colunas, integracao_id } = req.body;

      if (!nome || !tipo || !colunas) {
        return res.status(400).json({
          sucesso: false,
          error: "Campos obrigatórios ausentes (nome, tipo, colunas)"
        });
      }

      if (tipo !== "produtos" && tipo !== "pedidos") {
        return res.status(400).json({
          sucesso: false,
          error: "O tipo de relatório personalizado deve ser 'produtos' ou 'pedidos'."
        });
      }

      const id = await relatorioModel.inserirCustomizado({
        nome,
        descricao,
        tipo,
        filtros,
        colunas,
        usuario_id: usuarioId,
        integracao_id: integracao_id ? parseInt(integracao_id, 10) : null
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Relatório personalizado salvo com sucesso!",
        data: { id }
      });
    } catch (error) {
      console.error("Erro no controller ao criar relatório personalizado:", error);
      return res.status(500).json({
        sucesso: false,
        error: error.message
      });
    }
  },

  async listarRelatoriosPersonalizados(req, res) {
    try {
      const usuarioId = req.usuario?.id || 5;
      const relatorios = await relatorioModel.listarCustomizados(usuarioId);

      return res.status(200).json({
        sucesso: true,
        data: relatorios
      });
    } catch (error) {
      console.error("Erro no controller ao listar relatórios personalizados:", error);
      return res.status(500).json({
        sucesso: false,
        error: error.message
      });
    }
  },

  async obterRelatorioPersonalizado(req, res) {
    try {
      const usuarioId = req.usuario?.id || 5;
      const { id } = req.params;

      const relatorio = await relatorioModel.obterCustomizadoPorId(parseInt(id, 10), usuarioId);
      if (!relatorio) {
        return res.status(404).json({
          sucesso: false,
          error: "Relatório personalizado não encontrado."
        });
      }

      // Executa dinamicamente a consulta baseada nos filtros e colunas salvos
      const resultados = await relatorioModel.executarQueryPersonalizada(usuarioId, relatorio);

      return res.status(200).json({
        sucesso: true,
        relatorio: relatorio,
        data: resultados
      });
    } catch (error) {
      console.error("Erro no controller ao obter e rodar relatório personalizado:", error);
      return res.status(500).json({
        sucesso: false,
        error: error.message
      });
    }
  },

  async atualizarRelatorioPersonalizado(req, res) {
    try {
      const usuarioId = req.usuario?.id || 5;
      const { id } = req.params;
      const { nome, descricao, tipo, filtros, colunas, integracao_id } = req.body;

      if (!nome || !tipo || !colunas) {
        return res.status(400).json({
          sucesso: false,
          error: "Campos obrigatórios ausentes (nome, tipo, colunas)"
        });
      }

      const relatorioExistente = await relatorioModel.obterCustomizadoPorId(parseInt(id, 10), usuarioId);
      if (!relatorioExistente) {
        return res.status(404).json({
          sucesso: false,
          error: "Relatório personalizado não encontrado."
        });
      }

      await relatorioModel.atualizarCustomizado(parseInt(id, 10), {
        nome,
        descricao,
        tipo,
        filtros,
        colunas,
        integracao_id: integracao_id ? parseInt(integracao_id, 10) : null
      }, usuarioId);

      return res.status(200).json({
        sucesso: true,
        mensagem: "Relatório personalizado atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro no controller ao atualizar relatório personalizado:", error);
      return res.status(500).json({
        sucesso: false,
        error: error.message
      });
    }
  },

  async excluirRelatorioPersonalizado(req, res) {
    try {
      const usuarioId = req.usuario?.id || 5;
      const { id } = req.params;

      const relatorioExistente = await relatorioModel.obterCustomizadoPorId(parseInt(id, 10), usuarioId);
      if (!relatorioExistente) {
        return res.status(404).json({
          sucesso: false,
          error: "Relatório personalizado não encontrado."
        });
      }

      await relatorioModel.excluirCustomizado(parseInt(id, 10), usuarioId);

      return res.status(200).json({
        sucesso: true,
        mensagem: "Relatório personalizado excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro no controller ao excluir relatório personalizado:", error);
      return res.status(500).json({
        sucesso: false,
        error: error.message
      });
    }
  }
};

module.exports = relatorioController;
