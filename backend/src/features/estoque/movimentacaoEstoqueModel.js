// O modelo MovimentacaoEstoque gerencia o histórico de entradas e saídas
const { pool } = require("../../config/db");

const movimentacaoEstoqueModel = {
  async registrar(produto_id, usuario_id, quantidade, tipo, motivo = null, transaction = null) {
    try {
      const dbPool = await pool;
      const request = transaction ? transaction.request() : dbPool.request();
      
      const result = await request
        .input("produto_id", produto_id)
        .input("usuario_id", usuario_id)
        .input("quantidade", quantidade)
        .input("tipo", tipo) // 'ENTRADA' ou 'SAIDA'
        .input("motivo", motivo)
        .query(`
          INSERT INTO movimentacao_estoque (produto_id, usuario_id, quantidade, tipo, motivo)
          OUTPUT INSERTED.id, INSERTED.data_hora
          VALUES (@produto_id, @usuario_id, @quantidade, @tipo, @motivo);
        `);
        
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao registrar movimentação de estoque", error);
      throw error;
    }
  },

  async listarPorProduto(produto_id) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("produto_id", produto_id)
        .query(`
          SELECT m.*, u.nome as usuario_nome 
          FROM movimentacao_estoque m
          LEFT JOIN usuarios u ON m.usuario_id = u.id
          WHERE m.produto_id = @produto_id
          ORDER BY m.data_hora DESC
        `);
        
      return result.recordset;
    } catch (error) {
      console.error("Erro ao listar movimentações", error);
      throw error;
    }
  },

  async listarTodas() {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .query(`
          SELECT 
            m.id,
            m.produto_id,
            m.usuario_id,
            m.quantidade,
            m.tipo,
            m.motivo,
            m.data_hora,
            p.nome as produto_nome,
            p.sku as produto_sku,
            u.nome as usuario_nome
          FROM movimentacao_estoque m
          LEFT JOIN produto p ON m.produto_id = p.id
          LEFT JOIN usuarios u ON m.usuario_id = u.id
          ORDER BY m.data_hora DESC
        `);
        
      return result.recordset;
    } catch (error) {
      console.error("Erro ao listar todas as movimentações", error);
      throw error;
    }
  }
};

module.exports = movimentacaoEstoqueModel;
