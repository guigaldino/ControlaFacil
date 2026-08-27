const { pool } = require("./config/db");
const relatorioModel = require("./features/relatorios/relatorioModel");

async function rodarTestes() {
  console.log("=== INICIANDO TESTES DO MÓDULO DE RELATÓRIOS ===\n");
  let usuarioId = 5; // fallback
  let integracaoId = null;

  try {
    const dbPool = await pool;

    // 1. Obter um usuário real do banco para o teste
    const resUsuarios = await dbPool.request().query("SELECT TOP 1 id FROM usuarios WHERE excluido = 0");
    if (resUsuarios.recordset.length > 0) {
      usuarioId = resUsuarios.recordset[0].id;
      console.log(`[OK] Usando ID de usuário para testes: ${usuarioId}`);
    } else {
      console.log(`[Aviso] Nenhum usuário ativo encontrado. Usando ID fallback: ${usuarioId}`);
    }

    // 2. Obter uma integração real do banco (se houver)
    const resIntegracoes = await dbPool.request()
      .input("usuarioId", usuarioId)
      .query("SELECT TOP 1 id FROM integracoes WHERE usuario_id = @usuarioId");
    if (resIntegracoes.recordset.length > 0) {
      integracaoId = resIntegracoes.recordset[0].id;
      console.log(`[OK] Usando ID de integração para testes: ${integracaoId}`);
    }

    // 3. Testar Metodos do Dashboard
    console.log("\n--- Testando obterDashboardGeral ---");
    const dashboardConsolidado = await relatorioModel.obterDashboardGeral(usuarioId);
    console.log("[OK] Dashboard Consolidado:", dashboardConsolidado);

    if (integracaoId) {
      const dashboardFiltrado = await relatorioModel.obterDashboardGeral(usuarioId, integracaoId);
      console.log("[OK] Dashboard Filtrado por Integração:", dashboardFiltrado);
    }

    // 4. Testar Relatórios Pré-definidos
    console.log("\n--- Testando obterRelatorioProdutos ---");
    const relProdutos = await relatorioModel.obterRelatorioProdutos(usuarioId, { integracaoId });
    console.log("[OK] Relatório de Produtos:", {
      totalItensEstoque: relProdutos.resumoEstoque.totalItensEstoque,
      valorTotalEstoque: relProdutos.resumoEstoque.valorTotalEstoque,
      qtdMaisVendidos: relProdutos.produtosMaisVendidos.length
    });

    console.log("\n--- Testando obterRelatorioPedidos ---");
    const relPedidos = await relatorioModel.obterRelatorioPedidos(usuarioId, { integracaoId });
    console.log("[OK] Relatório de Pedidos:", {
      diasComVendas: relPedidos.vendasPeriodo.length,
      marketplaces: relPedidos.vendasPorIntegracao.map(i => `${i.integracao_nome}: ${i.faturamento}`)
    });

    console.log("\n--- Testando obterRelatorioClientes ---");
    const relClientes = await relatorioModel.obterRelatorioClientes(usuarioId, integracaoId);
    console.log("[OK] Relatório de Clientes (compradores encontrados):", relClientes.length);

    // 5. Testar CRUD de Relatórios Personalizados
    console.log("\n--- Testando CRUD de Relatórios Personalizados ---");
    
    const configNovoRelatorio = {
      nome: "Relatório de Teste Automatizado",
      descricao: "Testando a persistência e geração dinâmica de consultas customizadas",
      tipo: "produtos",
      filtros: { precoMin: 10, precoMax: 1000 },
      colunas: ["nome", "sku", "preco", "qtd_disponivel"],
      usuario_id: usuarioId,
      integracao_id: integracaoId
    };

    // CREATE
    const novoId = await relatorioModel.inserirCustomizado(configNovoRelatorio);
    console.log(`[OK] Relatório inserido com sucesso. ID gerado: ${novoId}`);

    // READ (Listar)
    const lista = await relatorioModel.listarCustomizados(usuarioId);
    const relatorioSalvo = lista.find(r => r.id === novoId);
    if (relatorioSalvo) {
      console.log("[OK] Relatório listado corretamente no banco. Nome:", relatorioSalvo.nome);
    } else {
      throw new Error("Relatório inserido não foi encontrado na listagem.");
    }

    // UPDATE
    const dadosAtualizacao = {
      nome: "Relatório de Teste Automatizado - Editado",
      descricao: "Descrição atualizada no teste",
      tipo: "produtos",
      filtros: { precoMin: 50 },
      colunas: ["nome", "preco", "qtd_disponivel"],
      integracao_id: null
    };
    await relatorioModel.atualizarCustomizado(novoId, dadosAtualizacao, usuarioId);
    console.log("[OK] Relatório atualizado com sucesso.");

    // READ (Detalhado + Query Dinâmica)
    const relatorioCarregado = await relatorioModel.obterCustomizadoPorId(novoId, usuarioId);
    console.log("[OK] Relatório obtido detalhado por ID:", {
      id: relatorioCarregado.id,
      nome: relatorioCarregado.nome,
      colunas: relatorioCarregado.colunas
    });

    // Executar query dinâmica do relatório personalizado
    const resultadosDinamicos = await relatorioModel.executarQueryPersonalizada(usuarioId, relatorioCarregado);
    console.log(`[OK] Query dinâmica executada. Registros retornados: ${resultadosDinamicos.length}`);
    if (resultadosDinamicos.length > 0) {
      console.log("Exemplo de registro retornado:", resultadosDinamicos[0]);
    }

    // DELETE
    await relatorioModel.excluirCustomizado(novoId, usuarioId);
    console.log("[OK] Relatório excluído (soft-delete) com sucesso.");

    // Confirmar exclusão
    const aposExcluir = await relatorioModel.obterCustomizadoPorId(novoId, usuarioId);
    if (!aposExcluir) {
      console.log("[OK] Confirmado: Relatório excluído não está mais acessível via obterCustomizadoPorId.");
    } else {
      throw new Error("Falha: Relatório ainda está visível após exclusão.");
    }

    console.log("\n================================================");
    console.log("   TODOS OS TESTES FORAM CONCLUÍDOS COM SUCESSO!   ");
    console.log("================================================");
    process.exit(0);

  } catch (error) {
    console.error("\n[ERRO CRÍTICO NOS TESTES]:", error.message);
    process.exit(1);
  }
}

rodarTestes();
