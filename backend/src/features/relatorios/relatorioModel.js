const { pool } = require("../../config/db");
const { produtoStatus } = require("../../utils/enums");

// Whitelist de colunas para relatórios personalizados (evita SQL Injection no SELECT)
const COLUNAS_PRODUTOS = {
  id: 'p.id',
  nome: 'p.nome',
  sku: 'p.sku',
  preco: 'p.preco',
  condicao: 'p.condicao',
  gtin: 'p.gtin',
  data_criacao: 'p.data_criacao',
  status: "CASE p.excluido WHEN 0 THEN 'Ativo' WHEN 1 THEN 'Inativo' ELSE 'Excluido' END AS status",
  qtd_disponivel: 'e.qtd_disponivel',
  qtd_minima: 'e.qtd_minima',
  categoria_nome: 'c.nome AS categoria_nome'
};

const COLUNAS_PEDIDOS = {
  id: 'p.id',
  id_pedido_ml: 'p.id_pedido_ml',
  data_pedido: 'p.data_pedido',
  total: 'p.total',
  status_pedido: 'p.status_pedido',
  apelido_comprador: 'p.apelido_comprador',
  nome_completo_comprador: 'p.nome_completo_comprador',
  forma_pagamento: 'p.forma_pagamento',
  metodo_pagamento: 'p.metodo_pagamento',
  integracao_nome: 'i.nome AS integracao_nome'
};

const relatorioModel = {
  // ─── 1. METRICAS DO DASHBOARD ─────────────────────────────────────────────
  async obterDashboardGeral(usuarioId, integracaoId = null) {
    try {
      const dbPool = await pool;
      
      // Query de faturamento e vendas
      let queryVendas = `
        SELECT 
          COALESCE(SUM(total), 0) AS faturamentoTotal,
          COUNT(id) AS totalPedidos,
          COALESCE(AVG(total), 0) AS ticketMedio
        FROM pedido
        WHERE usuario_id = @usuarioId AND status_pedido = 'paid'
      `;
      if (integracaoId) {
        queryVendas += ` AND integracao_id = @integracaoId`;
      }

      // Query de produtos cadastrados
      let queryProdutos = `
        SELECT COUNT(p.id) AS totalProdutosAtivos
        FROM produto p
        WHERE p.usuario_criador_id = @usuarioId AND p.excluido = @ativoStatus
      `;
      if (integracaoId) {
        queryProdutos += ` AND p.integracao_id = @integracaoId`;
      }

      // Query de estoque crítico (estoque atual <= estoque mínimo)
      let queryEstoqueCritico = `
        SELECT COUNT(p.id) AS estoqueCritico
        FROM produto p
        JOIN estoque e ON p.id = e.produto_id
        WHERE p.usuario_criador_id = @usuarioId 
          AND p.excluido = @ativoStatus 
          AND e.qtd_disponivel <= e.qtd_minima
      `;
      if (integracaoId) {
        queryEstoqueCritico += ` AND p.integracao_id = @integracaoId`;
      }

      // Criação das requests
      const reqVendas = dbPool.request().input("usuarioId", usuarioId);
      const reqProdutos = dbPool.request()
        .input("usuarioId", usuarioId)
        .input("ativoStatus", produtoStatus.ATIVO);
      const reqEstoque = dbPool.request()
        .input("usuarioId", usuarioId)
        .input("ativoStatus", produtoStatus.ATIVO);

      if (integracaoId) {
        reqVendas.input("integracaoId", integracaoId);
        reqProdutos.input("integracaoId", integracaoId);
        reqEstoque.input("integracaoId", integracaoId);
      }

      const [resVendas, resProdutos, resEstoque] = await Promise.all([
        reqVendas.query(queryVendas),
        reqProdutos.query(queryProdutos),
        reqEstoque.query(queryEstoqueCritico)
      ]);

      const faturamento = resVendas.recordset[0];
      const ativos = resProdutos.recordset[0].totalProdutosAtivos;
      const critico = resEstoque.recordset[0].estoqueCritico;

      return {
        faturamentoTotal: faturamento.faturamentoTotal,
        totalPedidosPaid: faturamento.totalPedidos,
        ticketMedio: faturamento.ticketMedio,
        totalProdutosAtivos: ativos,
        produtosEstoqueCritico: critico
      };
    } catch (error) {
      console.error("Erro ao obter dashboard geral:", error);
      throw new Error("Erro ao carregar dados do dashboard: " + error.message);
    }
  },

  // ─── 2. RELATORIOS PRE-DEFINIDOS ──────────────────────────────────────────
  async obterRelatorioProdutos(usuarioId, filtros = {}) {
    try {
      const dbPool = await pool;
      const { integracaoId, categoriaId } = filtros;

      // 1. Resumos de Estoque (Total de valor e itens)
      let queryEstoque = `
        SELECT 
          COALESCE(SUM(p.preco * e.qtd_disponivel), 0) AS valorTotalEstoque,
          COALESCE(SUM(e.qtd_disponivel), 0) AS totalItensEstoque
        FROM produto p
        JOIN estoque e ON p.id = e.produto_id
        WHERE p.usuario_criador_id = @usuarioId AND p.excluido != @excluidoStatus
      `;
      
      const reqEstoque = dbPool.request()
        .input("usuarioId", usuarioId)
        .input("excluidoStatus", produtoStatus.EXCLUIDO);

      if (integracaoId) {
        queryEstoque += ` AND p.integracao_id = @integracaoId`;
        reqEstoque.input("integracaoId", integracaoId);
      }
      if (categoriaId) {
        queryEstoque += ` AND p.categoria_id = @categoriaId`;
        reqEstoque.input("categoriaId", categoriaId);
      }

      // 2. Top mais vendidos
      let queryMaisVendidos = `
        SELECT TOP 10
          ip.produto_id,
          ip.titulo_item AS nome,
          SUM(ip.quantidade) AS totalVendido,
          SUM(ip.quantidade * ip.preco_unitario) AS faturamentoProduto
        FROM item_pedido ip
        JOIN pedido p ON ip.pedido_id = p.id
        WHERE p.usuario_id = @usuarioId AND p.status_pedido = 'paid'
      `;

      const reqVendas = dbPool.request().input("usuarioId", usuarioId);

      if (integracaoId) {
        queryMaisVendidos += ` AND p.integracao_id = @integracaoId`;
        reqVendas.input("integracaoId", integracaoId);
      }

      queryMaisVendidos += `
        GROUP BY ip.produto_id, ip.titulo_item
        ORDER BY totalVendido DESC
      `;

      const [resEstoque, resVendas] = await Promise.all([
        reqEstoque.query(queryEstoque),
        reqVendas.query(queryMaisVendidos)
      ]);

      return {
        resumoEstoque: resEstoque.recordset[0],
        produtosMaisVendidos: resVendas.recordset
      };
    } catch (error) {
      console.error("Erro ao obter relatorio de produtos:", error);
      throw new Error("Erro ao gerar relatorio de produtos: " + error.message);
    }
  },

  async obterRelatorioPedidos(usuarioId, filtros = {}) {
    try {
      const dbPool = await pool;
      const { integracaoId, dataInicio, dataFim } = filtros;

      // 1. Faturamento diário
      let queryDiario = `
        SELECT 
          CONVERT(VARCHAR(10), p.data_pedido, 120) AS data,
          COALESCE(SUM(p.total), 0) AS faturamento,
          COUNT(p.id) AS totalPedidos
        FROM pedido p
        WHERE p.usuario_id = @usuarioId AND p.status_pedido = 'paid'
      `;
      const reqDiario = dbPool.request().input("usuarioId", usuarioId);

      if (integracaoId) {
        queryDiario += ` AND p.integracao_id = @integracaoId`;
        reqDiario.input("integracaoId", integracaoId);
      }
      if (dataInicio) {
        queryDiario += ` AND p.data_pedido >= @dataInicio`;
        reqDiario.input("dataInicio", dataInicio);
      }
      if (dataFim) {
        queryDiario += ` AND p.data_pedido <= @dataFim`;
        reqDiario.input("dataFim", dataFim);
      }

      queryDiario += `
        GROUP BY CONVERT(VARCHAR(10), p.data_pedido, 120)
        ORDER BY data ASC
      `;

      // 2. Vendas por marketplace
      let queryMarketplace = `
        SELECT 
          i.nome AS integracao_nome,
          COALESCE(SUM(p.total), 0) AS faturamento,
          COUNT(p.id) AS totalPedidos
        FROM pedido p
        JOIN integracoes i ON p.integracao_id = i.id
        WHERE p.usuario_id = @usuarioId AND p.status_pedido = 'paid'
      `;
      const reqMarketplace = dbPool.request().input("usuarioId", usuarioId);

      if (integracaoId) {
        queryMarketplace += ` AND p.integracao_id = @integracaoId`;
        reqMarketplace.input("integracaoId", integracaoId);
      }
      if (dataInicio) {
        queryMarketplace += ` AND p.data_pedido >= @dataInicio`;
        reqMarketplace.input("dataInicio", dataInicio);
      }
      if (dataFim) {
        queryMarketplace += ` AND p.data_pedido <= @dataFim`;
        reqMarketplace.input("dataFim", dataFim);
      }

      queryMarketplace += `
        GROUP BY i.nome
      `;

      const [resDiario, resMarketplace] = await Promise.all([
        reqDiario.query(queryDiario),
        reqMarketplace.query(queryMarketplace)
      ]);

      return {
        vendasPeriodo: resDiario.recordset,
        vendasPorIntegracao: resMarketplace.recordset
      };
    } catch (error) {
      console.error("Erro ao obter relatorio de pedidos:", error);
      throw new Error("Erro ao gerar relatorio de pedidos: " + error.message);
    }
  },

  async obterRelatorioClientes(usuarioId, integracaoId = null) {
    try {
      const dbPool = await pool;
      let query = `
        SELECT TOP 20
          p.id_comprador_ml,
          p.apelido_comprador,
          p.nome_completo_comprador,
          COUNT(p.id) AS totalPedidos,
          COALESCE(SUM(p.total), 0) AS totalGasto
        FROM pedido p
        WHERE p.usuario_id = @usuarioId AND p.status_pedido = 'paid'
      `;
      
      const req = dbPool.request().input("usuarioId", usuarioId);

      if (integracaoId) {
        query += ` AND p.integracao_id = @integracaoId`;
        req.input("integracaoId", integracaoId);
      }

      query += `
        GROUP BY p.id_comprador_ml, p.apelido_comprador, p.nome_completo_comprador
        ORDER BY totalGasto DESC
      `;

      const res = await req.query(query);
      return res.recordset;
    } catch (error) {
      console.error("Erro ao obter relatorio de clientes:", error);
      throw new Error("Erro ao gerar relatorio de clientes: " + error.message);
    }
  },

  // ─── 3. CRUD DE RELATORIOS PERSONALIZADOS ──────────────────────────────────
  async inserirCustomizado(dados) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("nome", dados.nome)
        .input("descricao", dados.descricao || null)
        .input("tipo", dados.tipo)
        .input("filtros", JSON.stringify(dados.filtros || {}))
        .input("colunas", JSON.stringify(dados.colunas || []))
        .input("usuarioId", dados.usuario_id)
        .input("integracaoId", dados.integracao_id || null)
        .query(`
          INSERT INTO relatorio_personalizado (
            nome, descricao, tipo, filtros, colunas, usuario_id, integracao_id
          )
          OUTPUT INSERTED.id
          VALUES (
            @nome, @descricao, @tipo, @filtros, @colunas, @usuarioId, @integracaoId
          );
        `);
      return result.recordset[0].id;
    } catch (error) {
      console.error("Erro ao inserir relatorio personalizado:", error);
      throw new Error("Erro ao salvar relatorio personalizado: " + error.message);
    }
  },

  async listarCustomizados(usuarioId) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("usuarioId", usuarioId)
        .query(`
          SELECT r.*, i.nome AS integracao_nome
          FROM relatorio_personalizado r
          LEFT JOIN integracoes i ON r.integracao_id = i.id
          WHERE r.usuario_id = @usuarioId AND r.excluido = 0
          ORDER BY r.data_criacao DESC
        `);
      return result.recordset.map(r => ({
        ...r,
        filtros: JSON.parse(r.filtros),
        colunas: JSON.parse(r.colunas)
      }));
    } catch (error) {
      console.error("Erro ao listar relatorios personalizados:", error);
      throw new Error("Erro ao buscar relatorios personalizados: " + error.message);
    }
  },

  async obterCustomizadoPorId(id, usuarioId) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input("id", id)
        .input("usuarioId", usuarioId)
        .query(`
          SELECT * FROM relatorio_personalizado 
          WHERE id = @id AND usuario_id = @usuarioId AND excluido = 0
        `);
      
      const relatorio = result.recordset[0];
      if (!relatorio) return null;

      return {
        ...relatorio,
        filtros: JSON.parse(relatorio.filtros),
        colunas: JSON.parse(relatorio.colunas)
      };
    } catch (error) {
      console.error("Erro ao obter relatorio personalizado:", error);
      throw new Error("Erro ao buscar relatorio personalizado: " + error.message);
    }
  },

  async atualizarCustomizado(id, dados, usuarioId) {
    try {
      const dbPool = await pool;
      await dbPool.request()
        .input("id", id)
        .input("usuarioId", usuarioId)
        .input("nome", dados.nome)
        .input("descricao", dados.descricao || null)
        .input("tipo", dados.tipo)
        .input("filtros", JSON.stringify(dados.filtros || {}))
        .input("colunas", JSON.stringify(dados.colunas || []))
        .input("integracaoId", dados.integracao_id || null)
        .query(`
          UPDATE relatorio_personalizado
          SET nome = @nome,
              descricao = @descricao,
              tipo = @tipo,
              filtros = @filtros,
              colunas = @colunas,
              integracao_id = @integracaoId,
              data_atualizacao = GETDATE()
          WHERE id = @id AND usuario_id = @usuarioId AND excluido = 0
        `);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar relatorio personalizado:", error);
      throw new Error("Erro ao atualizar relatorio personalizado: " + error.message);
    }
  },

  async excluirCustomizado(id, usuarioId) {
    try {
      const dbPool = await pool;
      await dbPool.request()
        .input("id", id)
        .input("usuarioId", usuarioId)
        .query(`
          UPDATE relatorio_personalizado
          SET excluido = 1,
              data_atualizacao = GETDATE()
          WHERE id = @id AND usuario_id = @usuarioId
        `);
      return true;
    } catch (error) {
      console.error("Erro ao excluir relatorio personalizado:", error);
      throw new Error("Erro ao excluir relatorio personalizado: " + error.message);
    }
  },

  // ─── 4. EXECUÇÃO DE QUERY DINÂMICA SEGURA ──────────────────────────────────
  async executarQueryPersonalizada(usuarioId, config) {
    try {
      const dbPool = await pool;
      const { tipo, filtros = {}, colunas = [], integracao_id } = config;
      
      const request = dbPool.request();
      request.input("usuarioId", usuarioId);

      let sql = "";
      let colunasSQL = "";
      
      if (tipo === "produtos") {
        // Selecionar colunas baseadas na whitelist
        const selectCols = [];
        if (Array.isArray(colunas) && colunas.length > 0) {
          colunas.forEach(col => {
            if (COLUNAS_PRODUTOS[col]) {
              selectCols.push(COLUNAS_PRODUTOS[col]);
            }
          });
        }
        
        // Se nenhuma coluna válida foi passada, seleciona todas
        if (selectCols.length === 0) {
          Object.keys(COLUNAS_PRODUTOS).forEach(key => {
            selectCols.push(COLUNAS_PRODUTOS[key]);
          });
        }

        colunasSQL = selectCols.join(", ");
        sql = `
          SELECT ${colunasSQL}
          FROM produto p
          LEFT JOIN estoque e ON p.id = e.produto_id
          LEFT JOIN categoria_produto c ON p.categoria_id = c.id
          WHERE p.usuario_criador_id = @usuarioId AND p.excluido != @excluidoStatus
        `;
        request.input("excluidoStatus", produtoStatus.EXCLUIDO);

        // Aplicação de filtros dinâmicos de produtos
        const canal = integracao_id || filtros.integracaoId;
        if (canal) {
          sql += ` AND p.integracao_id = @canalId`;
          request.input("canalId", canal);
        }
        if (filtros.categoriaId) {
          sql += ` AND p.categoria_id = @catId`;
          request.input("catId", filtros.categoriaId);
        }
        if (filtros.precoMin) {
          sql += ` AND p.preco >= @precoMin`;
          request.input("precoMin", Number(filtros.precoMin));
        }
        if (filtros.precoMax) {
          sql += ` AND p.preco <= @precoMax`;
          request.input("precoMax", Number(filtros.precoMax));
        }
        if (filtros.data_inicio) {
          sql += ` AND p.data_criacao >= @dataInicio`;
          request.input("dataInicio", filtros.data_inicio);
        }
        if (filtros.data_fim) {
          sql += ` AND p.data_criacao <= @dataFim`;
          request.input("dataFim", filtros.data_fim);
        }

        sql += " ORDER BY p.data_criacao DESC";

      } else if (tipo === "pedidos") {
        const selectCols = [];
        if (Array.isArray(colunas) && colunas.length > 0) {
          colunas.forEach(col => {
            if (COLUNAS_PEDIDOS[col]) {
              selectCols.push(COLUNAS_PEDIDOS[col]);
            }
          });
        }
        
        if (selectCols.length === 0) {
          Object.keys(COLUNAS_PEDIDOS).forEach(key => {
            selectCols.push(COLUNAS_PEDIDOS[key]);
          });
        }

        colunasSQL = selectCols.join(", ");
        sql = `
          SELECT ${colunasSQL}
          FROM pedido p
          LEFT JOIN integracoes i ON p.integracao_id = i.id
          WHERE p.usuario_id = @usuarioId
        `;

        // Aplicação de filtros dinâmicos de pedidos
        const canal = integracao_id || filtros.integracaoId;
        if (canal) {
          sql += ` AND p.integracao_id = @canalId`;
          request.input("canalId", canal);
        }
        if (filtros.status_pedido) {
          sql += ` AND p.status_pedido = @statusPedido`;
          request.input("statusPedido", filtros.status_pedido);
        }
        if (filtros.data_inicio) {
          sql += ` AND p.data_pedido >= @dataInicio`;
          request.input("dataInicio", filtros.data_inicio);
        }
        if (filtros.data_fim) {
          sql += ` AND p.data_pedido <= @dataFim`;
          request.input("dataFim", filtros.data_fim);
        }
        if (filtros.totalMin) {
          sql += ` AND p.total >= @totalMin`;
          request.input("totalMin", Number(filtros.totalMin));
        }

        sql += " ORDER BY p.data_pedido DESC";
      } else {
        throw new Error("Tipo de relatório não suportado para geração dinâmica.");
      }

      const res = await request.query(sql);
      return res.recordset;
    } catch (error) {
      console.error("Erro ao executar query dinâmica personalizada:", error);
      throw new Error("Erro ao gerar dados do relatório personalizado: " + error.message);
    }
  }
};

module.exports = relatorioModel;
