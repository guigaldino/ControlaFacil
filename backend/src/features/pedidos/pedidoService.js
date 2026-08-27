const fs = require('fs');
const path = require('path');
const pedidoModel = require('./pedidoModel');
const produtoModel = require('../produtos/produtoModel');
const estoqueModel = require('../estoque/estoqueModel');
const movimentacaoEstoqueModel = require('../estoque/movimentacaoEstoqueModel');
const integracaoModel = require('../integracoes/integracaoModel');
const { chamarApiML } = require('../integracoes/mlApiClient');
const { tipoMovimentacaoEstoque } = require('../../utils/enums');

const pedidoService = {
  /**
   * Processa a notificação de webhook recebida do Mercado Livre de forma assíncrona.
   * Valida o token, busca os dados da ordem na API do ML, verifica duplicidade,
   * salva no banco e realiza a movimentação de estoque se necessário.
   * 
   * @param {Object} payload - O corpo da notificação recebida do Mercado Livre
   */
  async processarWebhookPedido(payload) {
    try {
      // 1. Identificar o ID do recurso (ID do Pedido Mercado Livre)
      if (!payload.resource || !payload.user_id) {
        throw new Error("Payload do webhook inválido (sem resource ou user_id)");
      }

      const idPedidoMeli = payload.resource.split('/').pop();
      console.log(`[Webhook Pedidos] Iniciando processamento do pedido Mercado Livre ID: ${idPedidoMeli}`);

      // Grava no arquivo txt para fins de log de teste (mantendo a funcionalidade inicial pedida)
      await this.gravarLogTeste(payload);

      // 2. Buscar o Tenant Context (usuario_id e integracao_id) com base no user_id do ML
      const integracaoConfig = await integracaoModel.buscarPorMeliUserId(payload.user_id);
      if (!integracaoConfig) {
        throw new Error(`Nenhuma integração ativa configurada para o Mercado Livre user_id: ${payload.user_id}`);
      }

      const { integracao_id, usuario_id } = integracaoConfig;

      // 3. Buscar os detalhes completos do pedido na API do Mercado Livre
      const endpoint = `https://api.mercadolibre.com/orders/${idPedidoMeli}`;
      const dadosMeli = await chamarApiML(integracao_id, 'get', endpoint);
      
      if (!dadosMeli || !dadosMeli.id) {
        throw new Error(`Não foi possível recuperar os detalhes do pedido ${idPedidoMeli} na API do Mercado Livre.`);
      }

      // 4. Verificar se o pedido já existe no nosso banco de dados
      const pedidoExistente = await pedidoModel.obterPedidoPorMeliId(String(dadosMeli.id));

      if (pedidoExistente) {
        console.log(`[Webhook Pedidos] Pedido ${idPedidoMeli} já cadastrado no banco local.`);

        // Se o status mudou, atualiza
        if (pedidoExistente.status_pedido !== dadosMeli.status) {
          console.log(`[Webhook Pedidos] Atualizando status do pedido ${idPedidoMeli} de '${pedidoExistente.status_pedido}' para '${dadosMeli.status}'`);
          
          await pedidoModel.atualizarStatusPedido(
            pedidoExistente.id,
            dadosMeli.status,
            new Date(dadosMeli.last_updated)
          );

          // Lógica de estoque para transição de status pago
          if (pedidoExistente.status_pedido !== 'paid' && dadosMeli.status === 'paid') {
            await this.reduzirEstoquePedido(pedidoExistente.id, integracao_id, usuario_id, dadosMeli.order_items);
          }
          // Lógica de estoque para transição de estorno / cancelamento
          else if (pedidoExistente.status_pedido === 'paid' && dadosMeli.status === 'cancelled') {
            await this.restaurarEstoquePedido(pedidoExistente.id, integracao_id, usuario_id, dadosMeli.order_items);
          }
        } else {
          console.log(`[Webhook Pedidos] Status do pedido ${idPedidoMeli} não sofreu alterações ('${dadosMeli.status}'). Nenhuma ação realizada.`);
        }

        return { sucesso: true, atualizado: true, id: pedidoExistente.id };
      }

      // 5. O pedido não existe - Mapear e Inserir no Banco de Dados
      console.log(`[Webhook Pedidos] Criando novo pedido local para o ID Meli: ${idPedidoMeli}`);

      // Monta os nomes completos e dados adicionais
      let nomeCompletoComprador = null;
      if (dadosMeli.buyer) {
        nomeCompletoComprador = `${dadosMeli.buyer.first_name || ''} ${dadosMeli.buyer.last_name || ''}`.trim();
        if (!nomeCompletoComprador) {
          nomeCompletoComprador = dadosMeli.buyer.nickname || null;
        }
      }

      // Pega dados do primeiro pagamento (se houver)
      const primeiroPagamento = dadosMeli.payments && dadosMeli.payments[0] ? dadosMeli.payments[0] : null;

      const dadosPedidoInsert = {
        id_pedido_ml: String(dadosMeli.id),
        data_pedido: new Date(dadosMeli.date_created),
        total: dadosMeli.total_amount,
        status_pedido: dadosMeli.status,
        data_atualizacao_status: new Date(dadosMeli.last_updated),
        usuario_id: usuario_id,
        integracao_id: integracao_id,
        id_comprador_ml: dadosMeli.buyer?.id ? String(dadosMeli.buyer.id) : null,
        apelido_comprador: dadosMeli.buyer?.nickname || null,
        nome_completo_comprador: nomeCompletoComprador,
        id_envio_ml: dadosMeli.shipping?.id ? String(dadosMeli.shipping.id) : null,
        forma_pagamento: primeiroPagamento?.payment_type || null,
        metodo_pagamento: primeiroPagamento?.payment_method_id || null
      };

      const pedidoIdInserido = await pedidoModel.inserirPedido(dadosPedidoInsert);

      // 6. Inserir itens do pedido
      for (const orderItem of dadosMeli.order_items) {
        const itemMeliId = orderItem.item.id;
        
        // Tenta encontrar o produto local correspondente cadastrado no sistema
        const produtoLocal = await produtoModel.buscarPorMeliItemId(itemMeliId, integracao_id);
        const produtoId = produtoLocal ? produtoLocal.id : null;

        if (!produtoId) {
          console.warn(`[Webhook Pedidos] Produto correspondente ao id_item_ml: ${itemMeliId} não foi encontrado localmente.`);
        }

        const dadosItemInsert = {
          pedido_id: pedidoIdInserido,
          produto_id: produtoId,
          quantidade: orderItem.quantity,
          preco_unitario: orderItem.unit_price,
          valor_desconto_item: 0.00, // campo para descontos específicos, caso aplicável futuramente
          id_item_ml: itemMeliId,
          titulo_item: orderItem.item.title,
          tarifa_venda: orderItem.sale_fee || null
        };

        await pedidoModel.inserirItemPedido(dadosItemInsert);
      }

      // 7. Se o pedido já for criado com status "paid", realiza a redução de estoque
      if (dadosMeli.status === 'paid') {
        await this.reduzirEstoquePedido(pedidoIdInserido, integracao_id, usuario_id, dadosMeli.order_items);
      }

      console.log(`[Webhook Pedidos] Pedido ${idPedidoMeli} cadastrado e processado localmente com sucesso. ID Local: ${pedidoIdInserido}`);
      return { sucesso: true, inserido: true, id: pedidoIdInserido };

    } catch (error) {
      console.error("[Webhook Pedidos] Erro durante o processamento do webhook:", error);
      throw error;
    }
  },

  /**
   * Reduz o estoque físico/local dos itens vinculados ao pedido.
   */
  async reduzirEstoquePedido(pedidoDbId, integracaoId, usuarioId, orderItems) {
    console.log(`[Webhook Pedidos] Processando baixa de estoque para o pedido local ID: ${pedidoDbId}`);
    
    for (const orderItem of orderItems) {
      const itemMeliId = orderItem.item.id;
      const produtoLocal = await produtoModel.buscarPorMeliItemId(itemMeliId, integracaoId);

      if (produtoLocal) {
        const produtoId = produtoLocal.id;
        const saldo = await estoqueModel.consultarSaldo(produtoId);
        
        if (saldo) {
          const novaQtd = Math.max(0, saldo.qtd_disponivel - orderItem.quantity);
          await estoqueModel.atualizarSaldo(produtoId, novaQtd);
          
          await movimentacaoEstoqueModel.registrar(
            produtoId,
            usuarioId,
            orderItem.quantity,
            tipoMovimentacaoEstoque.SAIDA,
            `Saída automática via venda Mercado Livre. Pedido Local #${pedidoDbId} (Item ML: ${itemMeliId})`
          );
          console.log(`[Webhook Pedidos] Estoque do produto ID ${produtoId} reduzido em ${orderItem.quantity}. Novo saldo: ${novaQtd}`);
        }
      }
    }
  },

  /**
   * Restaura o estoque físico/local dos itens vinculados em caso de cancelamento.
   */
  async restaurarEstoquePedido(pedidoDbId, integracaoId, usuarioId, orderItems) {
    console.log(`[Webhook Pedidos] Processando estorno/devolução de estoque para o pedido cancelado ID: ${pedidoDbId}`);
    
    for (const orderItem of orderItems) {
      const itemMeliId = orderItem.item.id;
      const produtoLocal = await produtoModel.buscarPorMeliItemId(itemMeliId, integracaoId);

      if (produtoLocal) {
        const produtoId = produtoLocal.id;
        const saldo = await estoqueModel.consultarSaldo(produtoId);
        
        if (saldo) {
          const novaQtd = saldo.qtd_disponivel + orderItem.quantity;
          await estoqueModel.atualizarSaldo(produtoId, novaQtd);
          
          await movimentacaoEstoqueModel.registrar(
            produtoId,
            usuarioId,
            orderItem.quantity,
            tipoMovimentacaoEstoque.ENTRADA,
            `Entrada automática por cancelamento de pedido Mercado Livre. Pedido Local #${pedidoDbId} (Item ML: ${itemMeliId})`
          );
          console.log(`[Webhook Pedidos] Estoque do produto ID ${produtoId} acrescido de ${orderItem.quantity}. Novo saldo: ${novaQtd}`);
        }
      }
    }
  },

  /**
   * Lista os pedidos do usuário autenticado.
   */
  async listarPedidos(usuarioId, filtros) {
    return await pedidoModel.listarPedidos(usuarioId, filtros);
  },

  /**
   * Obtém detalhes de um pedido.
   */
  async obterDetalhesPedido(usuarioId, pedidoId) {
    const pedido = await pedidoModel.obterDetalhesPedido(usuarioId, pedidoId);
    if (!pedido) {
      throw new Error("Pedido não encontrado ou não pertence a este usuário.");
    }
    return pedido;
  },

  /**
   * Mantém o registro original do webhook em TXT para fins de log de teste rápido.
   */
  async gravarLogTeste(payload) {
    try {
      const logDir = path.resolve(__dirname, '../../..');
      const logFilePath = path.join(logDir, 'webhook_pedido_teste.txt');
      
      const timestamp = new Date().toISOString();
      const logContent = `
=========================================
RECEBIDO EM: ${timestamp}
TOPIC: ${payload.topic || 'Não especificado'}
RESOURCE: ${payload.resource || 'Não especificado'}
PAYLOAD COMPLETO:
${JSON.stringify(payload, null, 2)}
=========================================\n`;

      fs.appendFileSync(logFilePath, logContent, 'utf8');
    } catch (err) {
      console.error("[Webhook Pedidos] Erro ao gravar log de teste:", err);
    }
  }
};

module.exports = pedidoService;
