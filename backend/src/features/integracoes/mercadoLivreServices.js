const mlApiClient = require("../integracoes/mlApiClient");

const mercadoLivreService = {
  async getSugestaoCategorias(integracaoId, titulo) {
    try {
      if (!titulo || titulo === "") {
        throw Error(
          "O título é obrigatório para buscar sugestões de categoria.",
        );
      }

      const endpoint = `https://api.mercadolibre.com/sites/MLB/domain_discovery/search?q=${titulo}&limit=8`;

      const response = await mlApiClient.chamarApiML(
        integracaoId,
        "get",
        endpoint,
      );

      if (response.length === 0) {
        throw Error("Nenhuma categoria encontrada para o título informado.");
      }

      return response;
    } catch (error) {
      console.error("getSugestaoCategoria - " + error.message);
      throw Error(error.message || "Erro ao buscar categorias");
    }
  },

  async getAtributosCategorias(integracaoId, ml_categoriaId) {
    try {
      if (!ml_categoriaId || ml_categoriaId === "") {
        throw Error("A categoria é obrigatória para buscar atributos.");
      }

      const endpoint = `https://api.mercadolibre.com/categories/${ml_categoriaId}/attributes`;

      const response = await mlApiClient.chamarApiML(
        integracaoId,
        "get",
        endpoint,
      );

      return response;
    } catch (error) {
      console.error("getAtributosCategorias - " + error.message);
      throw Error(error.message || "Erro ao buscar atributos");
    }
  },

  async publicarProduto(integracaoId, produto) {
    try {
      if (!produto || produto === "") {
        throw Error(
          "O produto é obrigatório para publicar no Mercado Livre.",
        );
      }

      const endpoint = `https://api.mercadolibre.com/items`;

      const response = await mlApiClient.chamarApiML(
        integracaoId,
        "post",
        endpoint,
        produto,
      );

      return response;
    } catch (error) {
      const detalhe = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error("publicarProduto - " + detalhe);
      throw error;
    }
  },

  async editarProduto(integracaoId, ml_produtoId, produto){
    
    try{
      if(!ml_produtoId){
        throw Error("O id do produto é obrigatório para editar no Mercado Livre.");
      }
      
      const endpoint = `https://api.mercadolibre.com/items/${ml_produtoId}`;

      const response = await mlApiClient.chamarApiML(
        integracaoId,
        "put",
        endpoint,
        produto,
      );

      return response;

    } catch (error){
      console.error("editarProduto - " + error.message);
      throw Error(error.message || "Erro ao editar produto");
    }
  },

  async adicionarDescricao(integracaoId, mlProdutoId, descricao) {
    try {
      
      if (!mlProdutoId || mlProdutoId === "") {
        throw Error(
          "O id do produto é obrigatório para adicionar descrição no Mercado Livre.",
        );
      }

      if (!descricao || descricao === "") {
        throw Error(
          "A descrição é obrigatória para adicionar no Mercado Livre.",
        );
      }

      const payloadDescricao = {
        plain_text: descricao
      }

      const endpoint = `https://api.mercadolibre.com/items/${mlProdutoId}/description`;

      const response = await mlApiClient.chamarApiML(
        integracaoId,
        "post",
        endpoint,
        payloadDescricao,
      );

      return response;
    } catch (error) {
      const detalhe = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error("adicionarDescricao - " + detalhe);
      throw error;
    }
  },

  async editarDescricao (integracaoId, mlProdutoId, descricao) {

    try {
      debugger;
      if (!mlProdutoId || mlProdutoId === "") {
        throw Error(
          "O id do produto é obrigatório para editar descrição no Mercado Livre.",
        );
      }

      if (!descricao || descricao === "") {
        throw Error(
          "A descrição é obrigatória para editar no Mercado Livre.",
        );
      }

      const payloadDescricao = {
        plain_text: descricao
      }

      const endpoint = `https://api.mercadolibre.com/items/${mlProdutoId}/description`;

      const response = await mlApiClient.chamarApiML(
        integracaoId,
        "put",
        endpoint,
        payloadDescricao,
      );

      return response;
    } catch (error) {
      console.error("editarDescricao - " + error.message);
      throw Error(error.message || "Erro ao editar descrição");
    }
  },

  async alterarStatusProduto (integracaoId, mlProdutoId, status) {
    try {
      
      if(!mlProdutoId || mlProdutoId === ""){
        throw Error(
          "O id do produto é obrigatório para alterar o status no Mercado Livre."
        );
      }

      if(!status || status === ""){
        throw Error(
          "O status é obrigatório para alterar o status no Mercado Livre."
        );
      }

      const payloadStatus = {
        status: status
      }

      const endpoint = `https://api.mercadolibre.com/items/${mlProdutoId}`;

      const response = await mlApiClient.chamarApiML(
        integracaoId,
        "put",
        endpoint,
        payloadStatus,
      );

      return response;
    } catch (error) {
      console.error("alterarStatusProduto - " + error.message);
      throw Error(error.message || "Erro ao alterar status do produto");
    }
  }
};

module.exports = mercadoLivreService;
