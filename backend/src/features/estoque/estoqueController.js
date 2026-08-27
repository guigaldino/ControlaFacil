const estoqueModel = require("./estoqueModel");
const movimentacaoEstoqueModel = require("./movimentacaoEstoqueModel");
const { tipoMovimentacaoEstoque } = require("../../utils/enums")
const { pool, sql } = require("../../config/db");

const estoqueController = {
  async consultarEstoqueProduto(req, res) {
    try {
      const { produtoId } = req.params;
      const saldo = await estoqueModel.consultarSaldo(produtoId);
      
      if (!saldo) {
        return res.status(404).json({ error: "Estoque não encontrado para este produto", sucesso: false });
      }
      
      res.status(200).json({ estoque: saldo, sucesso: true });
    } catch (error) {
      console.error("Erro ao consultar estoque:", error);
      res.status(500).json({ error: "Erro ao consultar estoque: " + error.message });
    }
  },

  async registrarMovimentacao(req, res) {
    let transaction;
    try {
      const { produto_id, quantidade, tipo, motivo } = req.body;
      const usuario_id = req.usuario?.id || req.body.usuario_id || 5;

      if (!produto_id || !quantidade || !tipo) {
        return res.status(400).json({
          error: "Campos obrigatórios ausentes (produto_id, quantidade, tipo)",
          sucesso: false,
        });
      }

      if (tipo !== tipoMovimentacaoEstoque.ENTRADA && tipo !== tipoMovimentacaoEstoque.SAIDA) {
        return res.status(400).json({ error: "Tipo deve ser ENTRADA ou SAIDA", sucesso: false });
      }

      const dbPool = await pool;
      transaction = new sql.Transaction(dbPool);
      await transaction.begin();

      // 1. Verificar o saldo atual
      const saldoAtual = await estoqueModel.consultarSaldo(produto_id);
      if (!saldoAtual) {
        throw new Error("Estoque não encontrado para o produto especificado.");
      }

      let novaQuantidade = saldoAtual.qtd_disponivel;
      if (tipo === tipoMovimentacaoEstoque.ENTRADA) {
        novaQuantidade += quantidade;
      } else {
        if (novaQuantidade < quantidade) {
          throw new Error("Saldo insuficiente para a saída solicitada.");
        }
        novaQuantidade -= quantidade;
      }

      // 2. Atualizar tabela de estoque
      await estoqueModel.atualizarSaldo(produto_id, novaQuantidade, transaction);

      // 3. Registrar a movimentação
      const movimentacao = await movimentacaoEstoqueModel.registrar(
        produto_id, usuario_id, quantidade, tipo, motivo, transaction
      );

      await transaction.commit();

      res.status(201).json({ 
        mensagem: "Movimentação registrada com sucesso",
        movimentacao, 
        novoSaldo: novaQuantidade,
        sucesso: true 
      });

    } catch (error) {
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error("Erro no rollback:", rollbackError);
        }
      }
      console.error("Erro ao registrar movimentação:", error);
      res.status(error.message.includes("Saldo insuficiente") ? 400 : 500).json({ 
        error: "Erro ao registrar movimentação: " + error.message 
      });
    }
  },

  async listarMovimentacoes(req, res) {
    try {
      const { produtoId } = req.params;
      const movimentacoes = await movimentacaoEstoqueModel.listarPorProduto(produtoId);
      res.status(200).json({ movimentacoes, sucesso: true });
    } catch (error) {
      console.error("Erro ao listar movimentações:", error);
      res.status(500).json({ error: "Erro ao listar movimentações: " + error.message });
    }
  },

  async listarTodasMovimentacoes(req, res) {
    try {
      const movimentacoes = await movimentacaoEstoqueModel.listarTodas();
      res.status(200).json({ movimentacoes, sucesso: true });
    } catch (error) {
      console.error("Erro ao listar todas as movimentações:", error);
      res.status(500).json({ error: "Erro ao listar todas as movimentações: " + error.message });
    }
  }
};

module.exports = estoqueController;
