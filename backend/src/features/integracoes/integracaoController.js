// O integracaoController é responsável por gerenciar as operações relacionadas a integrações, como inserção, atualização e exclusão de dados.
const axios = require("axios");
const integracaoModel = require("./integracaoModel");
const { chamarApiML, obterAccessTokenValido } = require("./mlApiClient");
const {integracaoStatus} = require("../../utils/enums");
require("dotenv").config();

const integracaoController = {
  async cadastrarIntegracao(req, res) {
    const { nome} = req.body;
    const usuarioId = req.usuario.id;
    
    try {
      const integracao = await integracaoModel.inserirIntegracao(nome, usuarioId);

      if (!integracao.id) {
        return res.status(500).json({
          error: "Erro ao salvar a integração no banco de dados",
          sucesso: false,
        });
      }

      return res.status(201).json({
        message: "Integração cadastrada com sucesso",
        id: integracao.id,
        sucesso: true,
      });

    } catch (error) {
      console.error("Erro ao cadastrar integração:", error);
      return res.status(500).json({
        error: "Erro ao cadastrar integração",
        message: error.message,
        sucesso: false,
      });
    }
  },

  async listarIntegracoes(req, res) { 
    try {
      const integracoes = await integracaoModel.listarTodasIntegracoes();

      if (!integracoes || !integracoes.length) {
        return res.status(404).json({
          error: "Nenhuma integração encontrada",
          integracoes: [],
          sucesso: false,
        });
      }

      return res.status(200).json({
        message: "Integrações listadas com sucesso",
        integracoes,
        sucesso: true,
      });

    } catch (error) {
      console.error("Erro ao listar integrações:", error);
      return res.status(500).json({
        error: "Erro ao listar integrações",
        message: error.message,
        sucesso: false,
      });
    }
  },

  async editarIntegracao(req, res) { 
    const { id, nome} = req.body;

    try {
      if (!id || !nome) {
        return res.status(400).json({
          error: "Dados obrigatórios não informados",
          sucesso: false,
        });
      }

      const integracao = await integracaoModel.editarIntegracao(id, nome);

      if (!integracao.id) {
        return res.status(500).json({
          error: "Erro ao editar integração no banco de dados",
          sucesso: false,
        });
      }

      return res.status(200).json({
        message: "Integração editada com sucesso",
        sucesso: true
      });

    } catch (error) {
      console.error("Erro ao editar integração:", error);
      return res.status(500).json({
        error: "Erro ao editar integração",
        message: error.message,
        sucesso: false,
      });
    }
  },

  async inativarIntegracao(req, res) {
    const { id } = req.params;
    try {
      if (id === null || id === undefined) {
        return res.status(400).json({
          error: "Dados obrigatórios não informados",
          sucesso: false,
        });
      }

      const integracao = await integracaoModel.inativarIntegracao(id);

      if (!integracao) {
        return res.status(500).json({
          error: "Erro ao inativar integração no banco de dados",
          sucesso: false,
        });
      }

      return res.status(200).json({
        message: "Integração inativada com sucesso",
        sucesso: true
      });

    } catch (error) {
      console.error("Erro ao inativar integração:", error);
      return res.status(500).json({
        error: "Erro ao inativar integração",
        message: error.message,
        sucesso: false,
      });
    }
  },

  async authMercadoLivre(req, res) {
    const { code, integracaoId } = req.query;
    if (!code || !integracaoId) {
      return res.status(400).json({
        error: "Código de autorização ou ID da integração não fornecido",
        sucesso: false,
      });
    }

    try {
      const response = await axios.post(
        "https://api.mercadolibre.com/oauth/token",
        {
          grant_type: "authorization_code",
          client_id: process.env.ML_CLIENT_ID,
          client_secret: process.env.ML_CLIENT_SECRET,
          code,
          redirect_uri: process.env.ML_REDIRECT_URI,
        },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const dados = response.data;
      const usuarioId = req.usuario.id;

      // Passa expires_in (segundos) — o model converte para data absoluta
      const integrado = await integracaoModel.inserirIntegracaoConfiguracao(
        usuarioId,
        integracaoId,
        dados.access_token,
        dados.expires_in,
        dados.user_id,
        dados.refresh_token
      );

      integracaoModel.editarStatusIntegracao(integracaoId, integracaoStatus.ATIVO)

      if (!integrado.id) {
        return res.status(500).json({
          error: "Erro ao salvar a integração no banco de dados",
          sucesso: false,
        });
      }

      return res.status(200).json({
        message: "Integração com Mercado Livre realizada com sucesso",
        sucesso: true,
      });

    } catch (error) {
      console.error("Erro na autenticação Mercado Livre:", error.response?.data || error.message);
      return res.status(500).json({
        error: "Erro na autenticação com Mercado Livre",
        message: error.response?.data?.message || error.message,
        sucesso: false,
      });
    }
  },

  // ─── ENDPOINTS DE TESTE ────────────────────────────────────────────────────

  /**
   * [TESTE] Verifica o estado atual do token e faz uma chamada real à API do ML
   * para confirmar que o access_token é válido.
   * GET /integracoes/mercado-livre/testar-token/:integracaoId
   */
  async testarToken(req, res) {
    debugger;
    const { integracaoId } = req.params;

    try {
      // 1. Busca o estado atual do token no banco (antes do possível refresh)
      const configAntes = await integracaoModel.buscarConfiguracaoIntegracao(integracaoId);

      if (!configAntes) {
        return res.status(404).json({
          error: "Integração não encontrada ou ainda não autenticada com o ML",
          sucesso: false,
        });
      }

      const estadoAntes = {
        expires_at: configAntes.expires_at,
        token_expirado: !!configAntes.token_expirado,
      };

      // 2. Obtém um token válido (renova automaticamente se necessário)
      const accessToken = await obterAccessTokenValido(integracaoId);
      const refreshOcorreu = !!configAntes.token_expirado;

      // 3. Faz uma chamada real à API do ML para validar o token
      const dadosUsuarioML = await chamarApiML(
        integracaoId,
        "get",
        `https://api.mercadolibre.com/users/${configAntes.mercado_livre_user_id}`
      );

      // 4. Busca o estado atualizado do token após o possível refresh
      const configDepois = await integracaoModel.buscarConfiguracaoIntegracao(integracaoId);

      return res.status(200).json({
        sucesso: true,
        message: refreshOcorreu
          ? "Token estava expirado — refresh realizado com sucesso"
          : "Token estava válido — nenhum refresh necessário",
        refresh_ocorreu: refreshOcorreu,
        estado_antes: estadoAntes,
        estado_depois: {
          expires_at: configDepois.expires_at,
          token_expirado: !!configDepois.token_expirado,
        },
        validacao_ml: {
          chamada_bem_sucedida: true,
          usuario_ml_id: dadosUsuarioML.id,
          usuario_ml_nickname: dadosUsuarioML.nickname,
          accessToken: accessToken,
          refreshToken: configDepois.refresh_token,
        },
      });
    } catch (error) {
      console.error("[testarToken] Erro:", error.message);
      return res.status(500).json({
        sucesso: false,
        error: error.message,
      });
    }
  },

  /**
   * [TESTE] Marca o token como expirado no banco e em seguida dispara o fluxo
   * de refresh, simulando um token que expirou após as 6 horas.
   * POST /integracoes/mercado-livre/forcar-refresh/:integracaoId
   */
  async forcarRefresh(req, res) {
    const { integracaoId } = req.params;

    try {
      // 1. Força a expiração do token no banco (1 hora atrás)
      await integracaoModel._expirarTokenParaTeste(integracaoId);
      console.log(`[forcarRefresh] Token da integração ${integracaoId} marcado como expirado para teste.`);

      // 2. Confirma que o banco reflete a expiração
      const configExpirada = await integracaoModel.buscarConfiguracaoIntegracao(integracaoId);

      if (!configExpirada?.token_expirado) {
        return res.status(500).json({
          sucesso: false,
          error: "Falha ao expirar o token no banco. Verifique o integracaoId.",
        });
      }

      // 3. Dispara o fluxo completo de refresh via mlApiClient
      const novoToken = await obterAccessTokenValido(integracaoId);

      // 4. Busca o estado final para confirmar que os novos tokens foram salvos
      const configAtualizada = await integracaoModel.buscarConfiguracaoIntegracao(integracaoId);

      return res.status(200).json({
        sucesso: true,
        message: "Fluxo de refresh testado com sucesso",
        etapas: {
          "1_token_expirado_no_banco": true,
          "2_refresh_disparado": true,
          "3_novos_tokens_salvos": !configAtualizada.token_expirado,
        },
        novo_expires_at: configAtualizada.expires_at,
        token_expirado_apos_refresh: !!configAtualizada.token_expirado,
      });
    } catch (error) {
      console.error("[forcarRefresh] Erro:", error.message);
      return res.status(500).json({
        sucesso: false,
        error: error.message,
      });
    }
  },

};

module.exports = integracaoController;
