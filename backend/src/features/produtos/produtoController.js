// O produtoController é responsável por gerenciar as operações relacionadas aos produtos, como inserção, atualização e exclusão de dados.

const { pool, sql } = require("../../config/db");
const produtoModel = require("./produtoModel");
const estoqueModel = require("../estoque/estoqueModel");
const movimentacaoEstoqueModel = require("../estoque/movimentacaoEstoqueModel");
const produtoImagemModel = require("./produtoImagemModel");
const { tipoMovimentacaoEstoque, mapStatusProdutoML } = require("../../utils/enums");
const mercadoLivreService = require("../integracoes/mercadoLivreServices");

const produtoController = {
  async inserirProduto(req, res) {
    let transaction;
    try {
      const {
        nome,
        sku,
        preco,
        descricao,
        condicao,
        categoria_id,
        caracteristicas,
        gtin,
        integracao_id,
        categoria_ml,
        quantidade_inicial = 0,
        quantidade_minima = 0,
        imagens = [],
      } = req.body;

      const usuario_id = req.usuario?.id || req.body.usuario_criador_id || 5;

      if (
        !nome ||
        !sku ||
        !preco ||
        !categoria_id ||
        !integracao_id ||
        !categoria_ml
      ) {
        return res.status(400).json({
          error:
            "Campos obrigatórios ausentes (nome, sku, preco, categoria_id, integracao_id, categoria_ml)",
          sucesso: false,
        });
      }

      const dbPool = await pool;
      transaction = new sql.Transaction(dbPool);
      await transaction.begin();

      // 1. Criar Produto
      const produto = await produtoModel.inserir(
        {
          nome,
          sku,
          preco,
          descricao,
          condicao,
          categoria_id,
          caracteristicas,
          gtin,
          integracao_id,
          categoria_ml,
          usuario_criador_id: usuario_id,
        },
        transaction,
      );

      // 2. Criar Saldo Inicial de Estoque
      await estoqueModel.criarSaldoInicial(
        produto.id,
        quantidade_inicial,
        quantidade_minima,
        transaction,
      );

      // 3. Registrar Movimentação se saldo > 0
      if (quantidade_inicial > 0) {
        await movimentacaoEstoqueModel.registrar(
          produto.id,
          usuario_id,
          quantidade_inicial,
          tipoMovimentacaoEstoque.ENTRADA,
          "Saldo Inicial de Cadastro",
          transaction,
        );
      }

      // 4. Inserir Imagens
      if (imagens && imagens.length > 0) {
        for (const imagem of imagens) {
          await produtoImagemModel.inserir(
            produto.id,
            imagem.url,
            imagem.ordem,
            imagem.ehDestaque,
            transaction,
          );
        }
      }

      await transaction.commit();

      res.status(201).json({
        produto: {
          ...produto,
          quantidadeInicial: quantidade_inicial,
          totalImagens: imagens.length,
        },
        sucesso: true,
      });
    } catch (error) {
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error("Erro no rollback:", rollbackError);
        }
      }
      console.error("Erro ao inserir produto:", error);
      res
        .status(500)
        .json({ error: "Erro ao inserir produto: " + error.message });
    }
  },

  async listarProdutos(req, res) {
    try {
      const produtos = await produtoModel.listarTodasComImagemDestaque();
      res.status(200).json({ produtos, sucesso: true });
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      res
        .status(500)
        .json({ error: "Erro ao listar produtos: " + error.message });
    }
  },

  async listarProdutoPorId(req, res) {
    try {
      const { id } = req.params;
      const produto = await produtoModel.buscarPorId(id);

      if (!produto) {
        return res
          .status(404)
          .json({ error: "Produto não encontrado", sucesso: false });
      }

      const estoque = await estoqueModel.consultarSaldo(id);
      const imagens = await produtoImagemModel.listarPorProduto(id);

      const produtoDetalhado = {
        ...produto,
        estoque: estoque ? estoque.qtd_disponivel : 0,
        estoqueMinimo: estoque ? estoque.qtd_minima : 0,
        imagens: imagens,
      };

      res.status(200).json({ produto: produtoDetalhado, sucesso: true });
    } catch (error) {
      console.error("Erro ao buscar produto por ID:", error);
      res
        .status(500)
        .json({ error: "Erro ao buscar produto por ID: " + error.message });
    }
  },

  async atualizarProduto(req, res) {
    let transaction;
    try {
      const { id } = req.params;
      const {
        nome,
        sku,
        preco,
        descricao,
        condicao,
        categoria_id,
        caracteristicas,
        gtin,
        quantidade_minima,
        imagens = [],
      } = req.body;

      if (!nome || !sku || !preco || !categoria_id) {
        return res.status(400).json({
          error:
            "Campos obrigatórios ausentes (nome, sku, preco, categoria_id)",
          sucesso: false,
        });
      }

      const dbPool = await pool;
      transaction = new sql.Transaction(dbPool);
      await transaction.begin();

      // 1. Atualizar produto
      const produtoAtualizado = await produtoModel.atualizar(
        id,
        {
          nome,
          sku,
          preco,
          descricao,
          condicao,
          categoria_id,
          caracteristicas,
          gtin,
        },
        transaction,
      );

      // 2. Atualizar estoque mínimo
      if (quantidade_minima !== undefined && quantidade_minima !== null) {
        await estoqueModel.atualizarEstoqueMinimo(
          id,
          parseInt(quantidade_minima, 10),
          transaction,
        );
      }

      // 3. Atualizar imagens (limpa as anteriores e insere as novas)
      if (imagens) {
        await produtoImagemModel.excluirPorProduto(id, transaction);
        for (const imagem of imagens) {
          await produtoImagemModel.inserir(
            id,
            imagem.url,
            imagem.ordem,
            imagem.ehDestaque,
            transaction,
          );
        }
      }

      await transaction.commit();

      res.status(200).json({ produto: produtoAtualizado, sucesso: true });
    } catch (error) {
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error("Erro no rollback:", rollbackError);
        }
      }
      console.error("Erro ao atualizar produto:", error);
      res
        .status(500)
        .json({
          error: "Erro ao atualizar produto: " + error.message,
          sucesso: false,
        });
    }
  },

  async excluirProduto(req, res) {
    try {
      const { id } = req.params;
      await produtoModel.excluir(id);
      res
        .status(200)
        .json({ mensagem: "Produto excluído com sucesso", sucesso: true });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      res
        .status(500)
        .json({ error: "Erro ao excluir produto: " + error.message });
    }
  },

  async uploadImagem(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Nenhum arquivo enviado",
          sucesso: false,
        });
      }

      const caminho = `uploads/${req.file.filename}`;

      return res.status(200).json({
        sucesso: true,
        caminho: caminho,
        mensagem: "Imagem enviada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao realizar upload da imagem:", error);
      return res.status(500).json({
        error: "Erro ao realizar upload da imagem: " + error.message,
        sucesso: false,
      });
    }
  },

  async publicarProdutoML(req, res) {
    try {
      const { produtoId } = req.params;

      const produto = await produtoModel.buscarPorId(produtoId);
      const estoque = await estoqueModel.consultarSaldo(produtoId);
      const imagens = (
        await produtoImagemModel.listarPorProduto(produtoId)
      ).map((imagem) => {
        return {
          source: `${process.env.URL_API}/${imagem.url_imagem}`,
        };
      });

      if (!produto) {
        return res.status(404).json({
          error: "Produto não encontrado",
          sucesso: false,
        });
      }

      if (!estoque) {
        return res.status(404).json({
          error: "Estoque não encontrado",
          sucesso: false,
        });
      }

      if (imagens.length === 0) {
        return res.status(404).json({
          error: "Imagens não encontradas",
          sucesso: false,
        });
      }

      let parsedAttributes = [];
      if (produto.caracteristicas) {
        try {
          parsedAttributes = JSON.parse(produto.caracteristicas);
        } catch (parseError) {
          return res.status(400).json({
            sucesso: false,
            error: "Erro ao processar as características do produto: o campo possui um formato JSON inválido.",
            detalhes: { originalError: parseError.message }
          });
        }
      }

      const payloadMl = {
        title: produto.nome,
        category_id: produto.ml_categoria_id,
        price: produto.preco,
        currency_id: "BRL",
        available_quantity: estoque.qtd_disponivel,
        buying_mode: "buy_it_now",
        condition: produto.condicao,
        listing_type_id: "gold_special",
        sale_terms: [
          {
            id: "WARRANTY_TYPE",
            value_name: "Garantia do vendedor",
          },
          {
            id: "WARRANTY_TIME",
            value_name: "90 dias",
          },
        ],
        pictures: imagens,
        attributes: parsedAttributes,
      };

      const produtoML = await mercadoLivreService.publicarProduto(
        produto.integracao_id,
        payloadMl,
      );

      const descricaoML = await mercadoLivreService.adicionarDescricao(
        produto.integracao_id,
        produtoML.id,
        produto.descricao,
      );

      const produtoAtualizado = await produtoModel.inserirDadosML({
        produto_id: produtoId,
        ml_item_id: produtoML.id,
        ml_domain_id: produtoML.domain_id,
        ml_link_anuncio: produtoML.permalink,
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Produto publicado com sucesso",
        produtoML: produtoML,
        produtoAtualizado: produtoAtualizado,
      });
    } catch (error) {
      console.error("Erro completo ao publicar produto no Mercado Livre:", error);
      
      let mensagemErro = "Erro ao publicar produto no Mercado Livre";
      let detalhes = null;
      let statusHttp = 500;

      if (error.response) {
        // Erro retornado pela API do Mercado Livre (Axios)
        statusHttp = error.response.status || 500;
        const apiData = error.response.data;

        if (apiData) {
          mensagemErro = `Erro na API do Mercado Livre: ${apiData.message || apiData.error || error.message}`;
          detalhes = {
            status: apiData.status,
            error: apiData.error,
            message: apiData.message,
            cause: apiData.cause || apiData.error_values || null
          };
        } else {
          mensagemErro = `Erro na API do Mercado Livre (Status ${statusHttp}): ${error.message}`;
        }
      } else {
        // Erro de lógica, banco de dados ou rede local
        mensagemErro = `Erro interno ao publicar produto: ${error.message}`;
      }

      return res.status(statusHttp).json({
        sucesso: false,
        error: mensagemErro,
        detalhes: detalhes
      });
    }
  },

  async editarProdutoML(req, res) {
    try {
      const { produtoId } = req.params;

      const produto = await produtoModel.buscarPorId(produtoId);
      const estoque = await estoqueModel.consultarSaldo(produtoId);
      const imagens = (
        await produtoImagemModel.listarPorProduto(produtoId)
      ).map((imagem) => {
        return {
          source: `${process.env.URL_API}/${imagem.url_imagem}`,
        };
      });

      const payloadMl = {
        title: produto.nome,
        price: produto.preco,
        available_quantity: estoque.qtd_disponivel,
        condition: produto.condicao,
        pictures: imagens,
        attributes: produto.caracteristicas
          ? JSON.parse(produto.caracteristicas)
          : [],
      };

      const produtoAtualizadoML = await mercadoLivreService.editarProduto(
        produto.integracao_id,
        produto.ml_item_id,
        payloadMl,
      );

      const descricaoMl = await mercadoLivreService.editarDescricao(
        produto.integracao_id,
        produto.ml_item_id,
        produto.descricao,
      );

      return res.status(200).json({
        sucesso: true,
        mensagem: "Produto editado com sucesso",
        produtoAtualizadoML: produtoAtualizadoML,
        descricaoMl: descricaoMl,
      });
    } catch (error) {
      console.error(
        "Erro ao editar produto no Mercado Livre: " + error.message,
      );
      return res.status(500).json({
        error: "Erro ao editar produto no Mercado Livre: " + error.message,
        sucesso: false,
      });
    }
  },

  async alterarSatusProduto(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const produto = await produtoModel.buscarTodosPorId(id);
      if(!produto){
        return res.status(404).json({
          error: "Produto não encontrado",
          sucesso: false,
        });
      }

      const produtoAlteradoCF = await produtoModel.alterarStatus(id, status);
      if(!produtoAlteradoCF){
        return res.status(404).json({
          error: "Falha ao alterar status do produto internamente.",
          sucesso: false,
        });
      }

      const statusML = mapStatusProdutoML[status];
      if (!statusML) {
        return res.status(400).json({
          error: `Status fornecido (${status}) é inválido para integração com o Mercado Livre.`,
          sucesso: false,
        });
      }

      const produtoAlteradoML = await mercadoLivreService.alterarStatusProduto(
        produto.integracao_id,
        produto.ml_item_id,
        statusML,
      );

      return res.status(200).json({
        sucesso: true,
        mensagem: "Produto alterado com sucesso",
        produtoAlteradoML: produtoAlteradoML,
      });
    } catch (error) {
      console.error("Erro ao alterar status do produto: " + error.message);
      return res.status(500).json({
        error: "Erro ao alterar status do produto: " + error.message,
        sucesso: false,
      });
    }
  },
};

module.exports = produtoController;
