const pedidoService = require("./pedidoService");

const pedidoController = {
  /**
   * GET /pedidos
   * Retorna os pedidos vinculados ao usuário autenticado, com suporte a filtros e paginação.
   */
  async listarPedidos(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { status, busca, limite, pagina } = req.query;

      // Conversão dos parâmetros de paginação
      const limiteNum = limite ? parseInt(limite, 10) : 10;
      const paginaNum = pagina ? parseInt(pagina, 10) : 1;

      if (isNaN(limiteNum) || limiteNum <= 0) {
        return res.status(400).json({ error: "Parâmetro 'limite' inválido", sucesso: false });
      }
      if (isNaN(paginaNum) || paginaNum <= 0) {
        return res.status(400).json({ error: "Parâmetro 'pagina' inválido", sucesso: false });
      }

      const { pedidos, total } = await pedidoService.listarPedidos(usuarioId, {
        status,
        busca,
        limite: limiteNum,
        pagina: paginaNum
      });

      return res.status(200).json({
        sucesso: true,
        pagina: paginaNum,
        limite: limiteNum,
        total,
        pedidos
      });
    } catch (error) {
      console.error("[pedidoController] Erro ao listar pedidos:", error.message);
      return res.status(500).json({
        error: "Erro ao listar pedidos",
        message: error.message,
        sucesso: false
      });
    }
  },

  /**
   * GET /pedidos/:id
   * Retorna os detalhes de um pedido específico com seus respectivos itens comprados.
   */
  async obterDetalhesPedido(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { id } = req.params;

      const pedidoId = parseInt(id, 10);
      if (isNaN(pedidoId) || pedidoId <= 0) {
        return res.status(400).json({ error: "ID de pedido inválido", sucesso: false });
      }

      const pedido = await pedidoService.obterDetalhesPedido(usuarioId, pedidoId);

      return res.status(200).json({
        sucesso: true,
        pedido
      });
    } catch (error) {
      console.error("[pedidoController] Erro ao obter detalhes do pedido:", error.message);
      
      const statusHttp = error.message.includes("não encontrado") ? 404 : 500;
      return res.status(statusHttp).json({
        error: "Erro ao obter detalhes do pedido",
        message: error.message,
        sucesso: false
      });
    }
  }
};

module.exports = pedidoController;
