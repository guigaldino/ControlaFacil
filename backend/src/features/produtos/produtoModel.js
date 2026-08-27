// O modelo Produto é responsável por interagir com o banco de dados para operações relacionadas aos produtos.

const { pool } = require("../../config/db");
const { produtoStatus, integracaoStatus } = require("../../utils/enums");

const produtoModel = {
  async inserir(dados, transaction = null) {
    try {
      const dbPool = await pool;
      const request = transaction ? transaction.request() : dbPool.request();
      
      const caracteristicasStr = typeof dados.caracteristicas === 'object' && dados.caracteristicas !== null 
        ? JSON.stringify(dados.caracteristicas) 
        : dados.caracteristicas || null;

      const result = await request
        .input('nome', dados.nome)
        .input('sku', dados.sku)
        .input('preco', dados.preco)
        .input('descricao', dados.descricao || null)
        .input('condicao', dados.condicao || 'new')
        .input('categoria_id', dados.categoria_id)
        .input('caracteristicas', caracteristicasStr)
        .input('gtin', dados.gtin || null)
        .input('usuario_criador_id', dados.usuario_criador_id)
        .input('integracao_id', dados.integracao_id)
        .input('categoria_ml', dados.categoria_ml)
        .input('produtoStatus', produtoStatus.ATIVO)
        .query(`
          INSERT INTO produto (
            nome, sku, preco, descricao, condicao, categoria_id, caracteristicas, gtin, usuario_criador_id, integracao_id, ml_categoria_id, excluido
          )
          OUTPUT INSERTED.id
          VALUES (
            @nome, @sku, @preco, @descricao, @condicao, @categoria_id, @caracteristicas, @gtin, @usuario_criador_id, @integracao_id, @categoria_ml, @produtoStatus
          );
        `);

      return {
        id: result.recordset[0].id,
        nome: dados.nome
      };
    } catch (error) {
      console.error("Erro ao inserir produto", error);
      throw new Error("Erro ao inserir produto: " + error.message);
    }
  },

  async inserirDadosML(dados, transaction = null){
    try{
      const dbPool = await pool;
      const request = transaction ? transaction.request() : dbPool.request();

      const result = await request
        .input("produto_id", dados.produto_id)
        .input("ml_item_id", dados.ml_item_id)
        .input("ml_domain_id", dados.ml_domain_id)
        .input("ml_link_anuncio", dados.ml_link_anuncio).query(`
          UPDATE produto
          SET 
            ml_item_id = @ml_item_id,
            ml_domain_id = @ml_domain_id,
            ml_link_anuncio = @ml_link_anuncio,
            data_alteracao = GETDATE()
          OUTPUT INSERTED.id, INSERTED.nome
          WHERE id = @produto_id;
        `);

      if (result.recordset.length === 0) {
        throw new Error("Produto não encontrado para atualização");
      }

      return {
        id: result.recordset[0].id,
        nome: result.recordset[0].nome
      };

    }catch(error){
      console.error("Erro ao inserir dados no ML", error);
      throw new Error("Erro ao inserir dados no ML: " + error.message);
    }
  },
  
  async excluir(id) {
    try {
      const dbPool = await pool;
      await dbPool.request()
        .input("id", id)
        .input('excluido', produtoStatus.EXCLUIDO)
        .query(
          "UPDATE produto SET excluido = @excluido, data_alteracao = GETDATE() WHERE id = @id"
        );
      return true;
    } catch (error) {
      console.error("Erro ao excluir produto", error);
      throw new Error("Erro ao excluir produto: " + error.message);
    }
  },

  async atualizar(id, dados, transaction = null) {
    try {
      const caracteristicasStr = typeof dados.caracteristicas === 'object' && dados.caracteristicas !== null 
        ? JSON.stringify(dados.caracteristicas) 
        : dados.caracteristicas || null;

      const dbPool = await pool;
      const request = transaction ? transaction.request() : dbPool.request();
      await request
        .input('id', id)
        .input('nome', dados.nome)
        .input('sku', dados.sku)
        .input('preco', dados.preco)
        .input('descricao', dados.descricao)
        .input('condicao', dados.condicao)
        .input('categoria_id', dados.categoria_id)
        .input('caracteristicas', caracteristicasStr)
        .input('gtin', dados.gtin)
        .query(`
          UPDATE produto
          SET nome = @nome, 
              sku = @sku, 
              preco = @preco, 
              descricao = @descricao, 
              condicao = @condicao, 
              categoria_id = @categoria_id, 
              caracteristicas = @caracteristicas, 
              gtin = @gtin,
              data_alteracao = GETDATE()
          WHERE id = @id;
        `);

      return { id, ...dados };
    } catch (error) {
      console.error("Erro ao atualizar produto", error);
      throw new Error("Erro ao atualizar produto: " + error.message);
    }
  },

  async listarTodas() {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .query(`SELECT * FROM produto WHERE excluido != ${produtoStatus.EXCLUIDO} ORDER BY data_criacao DESC`);
      return result.recordset;
    } catch (error) {
      console.error("Erro ao listar produtos", error);
      throw new Error("Erro ao listar produtos: " + error.message);
    }
  },

  /**
   * Lista todos os produtos ativos e já inclui a imagem de destaque (ou a primeira imagem)
   * de cada um em uma única query — evita N requests extras no frontend.
   * O campo retornado é `imagem_destaque` com a URL relativa da imagem.
   */
  async listarTodasComImagemDestaque() {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .query(`
          SELECT
            p.*,
            img.url_imagem AS imagem_destaque
          FROM produto p
          OUTER APPLY (
            SELECT TOP 1 url_imagem
            FROM produto_imagem pi
            WHERE pi.produto_id = p.id
            ORDER BY pi.destaque DESC, pi.ordem ASC
          ) img
          WHERE p.excluido != ${produtoStatus.EXCLUIDO}
          ORDER BY p.data_criacao DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error("Erro ao listar produtos com imagem", error);
      throw new Error("Erro ao listar produtos: " + error.message);
    }
  },

  async buscarPorId(id) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("id", id)
        .query("SELECT * FROM produto WHERE id = @id AND excluido = 0");
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao buscar produto", error);
      throw new Error("Erro ao buscar produto: " + error.message);
    }
  },

  async buscarTodosPorId(id) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("id", id)
        .query("SELECT * FROM produto WHERE id = @id");
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao buscar produto", error);
      throw new Error("Erro ao buscar produto: " + error.message);
    }
  },

  async alterarStatus(id, status) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("id", id)
        .input("status", status)
        .query(`
          UPDATE produto
          SET excluido = @status,
              data_alteracao = GETDATE()
          OUTPUT INSERTED.id, INSERTED.excluido
          WHERE id = @id;
        `);
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao alterar status do produto", error);
      throw new Error("Erro ao alterar status do produto: " + error.message);
    }
  },

  async buscarPorMeliItemId(mlItemId, integracaoId) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("mlItemId", mlItemId)
        .input("integracaoId", integracaoId)
        .query("SELECT * FROM produto WHERE ml_item_id = @mlItemId AND integracao_id = @integracaoId AND excluido = 0");
      return result.recordset[0] || null;
    } catch (error) {
      console.error("Erro ao buscar produto por ml_item_id:", error);
      throw new Error("Erro ao buscar produto por ml_item_id: " + error.message);
    }
  }
};

module.exports = produtoModel;
