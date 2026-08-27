const { pool } = require("../../config/db");

const pedidoModel = {
  /**
   * Busca um pedido existente pelo ID do Mercado Livre.
   * @param {string} idPedidoMeli 
   */
  async obterPedidoPorMeliId(idPedidoMeli) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("idPedidoMeli", idPedidoMeli)
        .query(`
          SELECT * FROM pedido 
          WHERE id_pedido_ml = @idPedidoMeli
        `);
      return result.recordset[0] || null;
    } catch (error) {
      console.error("Erro ao obter pedido por ID do ML:", error);
      throw new Error("Erro ao obter pedido: " + error.message);
    }
  },

  /**
   * Insere um novo pedido no banco de dados.
   * @param {Object} dadosPedido 
   */
  async inserirPedido(dadosPedido) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("id_pedido_ml", dadosPedido.id_pedido_ml)
        .input("data_pedido", dadosPedido.data_pedido)
        .input("total", dadosPedido.total)
        .input("status_pedido", dadosPedido.status_pedido)
        .input("data_atualizacao_status", dadosPedido.data_atualizacao_status)
        .input("usuario_id", dadosPedido.usuario_id)
        .input("integracao_id", dadosPedido.integracao_id)
        .input("id_comprador_ml", dadosPedido.id_comprador_ml)
        .input("apelido_comprador", dadosPedido.apelido_comprador)
        .input("nome_completo_comprador", dadosPedido.nome_completo_comprador)
        .input("id_envio_ml", dadosPedido.id_envio_ml)
        .input("forma_pagamento", dadosPedido.forma_pagamento)
        .input("metodo_pagamento", dadosPedido.metodo_pagamento)
        .query(`
          INSERT INTO pedido (
            id_pedido_ml, data_pedido, total, status_pedido, data_atualizacao_status,
            usuario_id, integracao_id, id_comprador_ml, apelido_comprador,
            nome_completo_comprador, id_envio_ml, forma_pagamento, metodo_pagamento
          )
          OUTPUT INSERTED.id
          VALUES (
            @id_pedido_ml, @data_pedido, @total, @status_pedido, @data_atualizacao_status,
            @usuario_id, @integracao_id, @id_comprador_ml, @apelido_comprador,
            @nome_completo_comprador, @id_envio_ml, @forma_pagamento, @metodo_pagamento
          );
        `);
      return result.recordset[0].id;
    } catch (error) {
      console.error("Erro ao inserir pedido:", error);
      throw new Error("Erro ao inserir pedido: " + error.message);
    }
  },

  /**
   * Atualiza o status e a data de modificação de um pedido.
   * @param {number} id 
   * @param {string} status 
   * @param {Date} dataAtualizacao 
   */
  async atualizarStatusPedido(id, status, dataAtualizacao) {
    try {
      const dbPool = await pool;
      await dbPool.request()
        .input("id", id)
        .input("status", status)
        .input("data_atualizacao_status", dataAtualizacao)
        .query(`
          UPDATE pedido 
          SET status_pedido = @status,
              data_atualizacao_status = @data_atualizacao_status
          WHERE id = @id
        `);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      throw new Error("Erro ao atualizar status do pedido: " + error.message);
    }
  },

  /**
   * Insere um item vinculado a um pedido.
   * @param {Object} dadosItem 
   */
  async inserirItemPedido(dadosItem) {
    try {
      const dbPool = await pool;
      await dbPool.request()
        .input("pedido_id", dadosItem.pedido_id)
        .input("produto_id", dadosItem.produto_id) // pode ser null
        .input("quantidade", dadosItem.quantidade)
        .input("preco_unitario", dadosItem.preco_unitario)
        .input("valor_desconto_item", dadosItem.valor_desconto_item || 0.00)
        .input("id_item_ml", dadosItem.id_item_ml)
        .input("titulo_item", dadosItem.titulo_item)
        .input("tarifa_venda", dadosItem.tarifa_venda || null)
        .query(`
          INSERT INTO item_pedido (
            pedido_id, produto_id, quantidade, preco_unitario,
            valor_desconto_item, id_item_ml, titulo_item, tarifa_venda
          )
          VALUES (
            @pedido_id, @produto_id, @quantidade, @preco_unitario,
            @valor_desconto_item, @id_item_ml, @titulo_item, @tarifa_venda
          );
        `);
      return true;
    } catch (error) {
      console.error("Erro ao inserir item do pedido:", error);
      throw new Error("Erro ao inserir item do pedido: " + error.message);
    }
  },

  /**
   * Lista todos os pedidos vinculados a um usuário, suportando paginação e filtros.
   * @param {number} usuarioId 
   * @param {Object} filtros - { status, busca, limite, pagina }
   */
  async listarPedidos(usuarioId, filtros = {}) {
    try {
      const dbPool = await pool;
      const { status, busca, limite = 10, pagina = 1 } = filtros;
      const offset = (pagina - 1) * limite;

      let queryText = `
        SELECT p.*, 
               (SELECT COUNT(*) FROM item_pedido ip WHERE ip.pedido_id = p.id) as quantidade_itens
        FROM pedido p
        WHERE p.usuario_id = @usuarioId
      `;

      let queryCountText = `
        SELECT COUNT(*) as total
        FROM pedido p
        WHERE p.usuario_id = @usuarioId
      `;

      const request = dbPool.request().input("usuarioId", usuarioId);
      const countRequest = dbPool.request().input("usuarioId", usuarioId);

      if (status) {
        queryText += ` AND p.status_pedido = @status`;
        queryCountText += ` AND p.status_pedido = @status`;
        request.input("status", status);
        countRequest.input("status", status);
      }

      if (busca) {
        queryText += ` AND (p.id_pedido_ml LIKE @busca OR p.apelido_comprador LIKE @busca OR p.nome_completo_comprador LIKE @busca)`;
        queryCountText += ` AND (p.id_pedido_ml LIKE @busca OR p.apelido_comprador LIKE @busca OR p.nome_completo_comprador LIKE @busca)`;
        request.input("busca", `%${busca}%`);
        countRequest.input("busca", `%${busca}%`);
      }

      // Adiciona ordenação e paginação
      queryText += `
        ORDER BY p.data_pedido DESC
        OFFSET @offset ROWS
        FETCH NEXT @limite ROWS ONLY
      `;
      
      request.input("offset", offset);
      request.input("limite", limite);

      const [countResult, listResult] = await Promise.all([
        countRequest.query(queryCountText),
        request.query(queryText)
      ]);

      return {
        pedidos: listResult.recordset,
        total: countResult.recordset[0].total
      };
    } catch (error) {
      console.error("Erro ao listar pedidos no banco:", error);
      throw new Error("Erro ao listar pedidos: " + error.message);
    }
  },

  /**
   * Obtém os detalhes de um pedido específico incluindo seus itens.
   * @param {number} usuarioId 
   * @param {number} pedidoId 
   */
  async obterDetalhesPedido(usuarioId, pedidoId) {
    try {
      const dbPool = await pool;
      
      // Busca o cabeçalho do pedido
      const pedidoResult = await dbPool.request()
        .input("usuarioId", usuarioId)
        .input("pedidoId", pedidoId)
        .query(`
          SELECT * FROM pedido 
          WHERE id = @pedidoId AND usuario_id = @usuarioId
        `);

      const pedido = pedidoResult.recordset[0];
      if (!pedido) {
        return null;
      }

      // Busca os itens do pedido associados e faz join opcional com produto local
      const itensResult = await dbPool.request()
        .input("pedidoId", pedido.id)
        .query(`
          SELECT ip.*, 
                 prod.sku as produto_sku,
                 prod.nome as produto_nome
          FROM item_pedido ip
          LEFT JOIN produto prod ON ip.produto_id = prod.id
          WHERE ip.pedido_id = @pedidoId
        `);

      pedido.itens = itensResult.recordset.map(item => {
        const itemFormatado = {
          id: item.id,
          id_item_ml: item.id_item_ml,
          titulo_item: item.titulo_item,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          valor_desconto_item: item.valor_desconto_item,
          tarifa_venda: item.tarifa_venda,
          produto_id: item.produto_id
        };

        if (item.produto_id) {
          itemFormatado.produto_local = {
            id: item.produto_id,
            sku: item.produto_sku,
            nome: item.produto_nome
          };
        } else {
          itemFormatado.produto_local = null;
        }

        return itemFormatado;
      });

      return pedido;
    } catch (error) {
      console.error("Erro ao obter detalhes do pedido:", error);
      throw new Error("Erro ao obter detalhes do pedido: " + error.message);
    }
  }
};

module.exports = pedidoModel;
