// O modelo Estoque gerencia as operações na tabela 'estoque'
const { pool } = require("../../config/db");

const estoqueModel = {
  // O parâmetro 'transaction' é opcional. Se passado, a query fará parte da transação.
  async criarSaldoInicial(produto_id, qtd_inicial = 0, qtd_minima = 0, transaction = null) {
    try {
      const dbPool = await pool;
      const request = transaction ? transaction.request() : dbPool.request();
      
      const result = await request
        .input("produto_id", produto_id)
        .input("qtd_disponivel", qtd_inicial)
        .input("qtd_minima", qtd_minima)
        .query(`
          INSERT INTO estoque (produto_id, qtd_disponivel, qtd_minima)
          OUTPUT INSERTED.id, INSERTED.qtd_disponivel
          VALUES (@produto_id, @qtd_disponivel, @qtd_minima);
        `);
        
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao criar saldo inicial de estoque", error);
      throw error;
    }
  },

  async consultarSaldo(produto_id) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("produto_id", produto_id)
        .query("SELECT * FROM estoque WHERE produto_id = @produto_id");
        
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao consultar estoque", error);
      throw error;
    }
  },

  async atualizarSaldo(produto_id, nova_qtd, transaction = null) {
    try {
      const dbPool = await pool;
      const request = transaction ? transaction.request() : dbPool.request();
      
      const result = await request
        .input("produto_id", produto_id)
        .input("qtd_disponivel", nova_qtd)
        .query(`
          UPDATE estoque 
          SET qtd_disponivel = @qtd_disponivel, data_alteracao = GETDATE()
          WHERE produto_id = @produto_id;
          
          SELECT * FROM estoque WHERE produto_id = @produto_id;
        `);
        
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao atualizar saldo de estoque", error);
      throw error;
    }
  },

  async atualizarEstoqueMinimo(produto_id, qtd_minima, transaction = null) {
    try {
      const dbPool = await pool;
      const request = transaction ? transaction.request() : dbPool.request();
      await request
        .input("produto_id", produto_id)
        .input("qtd_minima", qtd_minima)
        .query(`
          UPDATE estoque
          SET qtd_minima = @qtd_minima, data_alteracao = GETDATE()
          WHERE produto_id = @produto_id;
        `);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar estoque mínimo", error);
      throw error;
    }
  }
};

module.exports = estoqueModel;
