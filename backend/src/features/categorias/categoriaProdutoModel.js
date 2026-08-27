// O modelo categoriaProduto é responsável por interagir com o banco de dados para operações relacionadas as categorias de produtos.

const { pool, query } = require("../../config/db");

const categoriaProduto = {
  async inserir({ nome, descricao, usuario_criador_id }) {
    try {
      const dbPool = await pool;
      const sql = `
                INSERT INTO categoria_produto (nome, descricao, usuario_criador_id)
                OUTPUT inserted.*
                VALUES (@nome, @descricao, @usuario_criador_id);
            `;

      const result = await dbPool
        .request()
        .input("nome", nome)
        .input("descricao", descricao)
        .input("usuario_criador_id", usuario_criador_id)
        .query(sql);

      const categoria = await dbPool.request()
        .input("id", result.recordset[0].id)
        .query("SELECT id, nome, descricao FROM categoria_produto WHERE id = @id");

      return { id: categoria.recordset[0].id, nome: categoria.recordset[0].nome, descricao: categoria.recordset[0].descricao };
    } catch (error) {
      console.error("Erro ao inserir categoria de produto:", error);
      throw new Error("Erro ao inserir categoria de produto: " + error);
    }
  },

  async listarTodas() {
    try {
      const sql = "SELECT id, nome, descricao FROM categoria_produto WHERE excluido = 0";
      const categorias = await query(sql);
      return categorias;
    } catch (error) {
      console.error("Erro ao listar categorias de produto:", error);
      throw new Error("Erro ao listar categorias de produto: " + error);
    }
  },

  async buscarPorId(id) {
    try {
      const dbPool = await pool;
      const result = await dbPool
        .request()
        .input("id", id)
        .query(
          "SELECT id, nome, descricao FROM categoria_produto WHERE id = @id",
        );
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao buscar categoria de produto:", error);
      throw new Error("Erro ao buscar categoria de produto: " + error);
    }
  },

  async atualizar({ id, nome, descricao }) {
    try {
      const dbPool = await pool;
      const sql = `
                UPDATE categoria_produto
                SET nome = @nome, descricao = @descricao
                WHERE id = @id;
            `;

      await dbPool
        .request()
        .input("id", id)
        .input("nome", nome)
        .input("descricao", descricao)
        .query(sql);

      return await categoriaProduto.buscarPorId(id);
    } catch (error) {
      console.error("Erro ao atualizar categoria de produto:", error);
      throw new Error("Erro ao atualizar categoria de produto: " + error);
    }
  },

  async excluir(id) {
    try {
      const dbPool = await pool;
      const sql = `
                UPDATE categoria_produto
                SET excluido = 1
                WHERE id = @id;
            `;

      await dbPool
        .request()
        .input("id", id)
        .query(sql);

      return true;
    } catch (error) {
      console.error("Erro ao excluir categoria de produto:", error);
      throw new Error("Erro ao excluir categoria de produto: " + error);
    }
  },
};

module.exports = categoriaProduto;
