const { pool } = require("../../config/db");

const produtoImagemModel = {
  async inserir(produto_id, url_imagem, ordem = 1, destaque = 0, transaction = null) {
    try {
      const dbPool = await pool;
      const request = transaction ? transaction.request() : dbPool.request();
      
      const result = await request
        .input("produto_id", produto_id)
        .input("url_imagem", url_imagem)
        .input("ordem", ordem)
        .input("destaque", destaque)
        .query(`
          INSERT INTO produto_imagem (produto_id, url_imagem, ordem, destaque)
          OUTPUT INSERTED.id
          VALUES (@produto_id, @url_imagem, @ordem, @destaque);
        `);
        
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao inserir imagem do produto", error);
      throw error;
    }
  },

  async listarPorProduto(produto_id) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("produto_id", produto_id)
        .query("SELECT * FROM produto_imagem WHERE produto_id = @produto_id ORDER BY ordem ASC");
        
      return result.recordset;
    } catch (error) {
      console.error("Erro ao listar imagens do produto", error);
      throw error;
    }
  },

  async excluirPorProduto(produto_id, transaction = null) {
    try {
      const dbPool = await pool;
      const request = transaction ? transaction.request() : dbPool.request();
      await request
        .input("produto_id", produto_id)
        .query("DELETE FROM produto_imagem WHERE produto_id = @produto_id");
      return true;
    } catch (error) {
      console.error("Erro ao excluir imagens do produto", error);
      throw error;
    }
  }
};

module.exports = produtoImagemModel;
