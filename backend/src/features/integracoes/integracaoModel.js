// // O modelo integracaoModel é responsável por interagir com o banco de dados para operações relacionadas as integrações.

const { pool, query } = require("../../config/db");
const {integracaoStatus, marketplaces} = require("../../utils/enums");

const integracaoModel = {
  
  async inserirIntegracao(nome, usuarioId) {
     try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('nome', nome)
        .input('marketplace', marketplaces.MERCADO_LIVRE)
        .input('usuarioId', usuarioId)
        .input('integracaoStatus', integracaoStatus.PENDENTE)
        .query(`
          INSERT INTO integracoes (nome, marketplace, usuario_id, ativo)
          OUTPUT INSERTED.id
          VALUES (@nome, @marketplace, @usuarioId, @integracaoStatus);
        `);

      return {
        id: result.recordset[0].id
      };
    } catch (error) {
      console.error("Erro ao inserir integração:", error);
      throw new Error("Erro ao inserir integração: " + error);
    }
  },

  async listarTodasIntegracoes() {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
      .input('integracaoStatus', integracaoStatus.EXCLUIDO)  
      .query(`
          SELECT * FROM integracoes where ativo != @integracaoStatus;
        `);

      return result.recordset;
    } catch (error) {
      throw new Error("Erro ao listar integrações: " + error);
    }
  },

  async editarIntegracao(id, nome) { 
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('id', id)
        .input('nome', nome)
        .query(`
          UPDATE integracoes
          SET nome = @nome
          WHERE id = @id;
        `);

      const integracao = await dbPool.request()
        .input('id', id)
        .query("SELECT * FROM integracoes WHERE id = @id");

      return {
        id: integracao.recordset[0].id
      };
    } catch (error) {
      console.error("Erro ao editar integração:", error);
      throw new Error("Erro ao editar integração: " + error);
    }
  },

  async editarStatusIntegracao(id, status) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('id', id)
        .input('status', status)
        .query(`
          UPDATE integracoes
          SET ativo = @status
          WHERE id = @id;
        `);
    } catch (error) {
      console.error("Erro ao editar integração:", error);
      throw new Error("Erro ao editar integração: " + error);
    }
  },

  async inativarIntegracao(id) { 
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('id', id)
        .input('integracaoStatus', integracaoStatus.INATIVO)
        .query(`
          UPDATE integracoes
          SET ativo = @integracaoStatus
          WHERE id = @id;
        `);

      const integracao = await dbPool.request()
        .input('id', id)
        .query("SELECT * FROM integracoes WHERE id = @id");

      return {
        id: integracao.recordset[0].id
      };
    } catch (error) {
      console.error("Erro ao editar integração:", error);
      throw new Error("Erro ao editar integração: " + error);
    }
  },

  async inserirIntegracaoConfiguracao(usuarioId, integracaoId, access_token, expires_in, mercado_livre_user_id, refresh_token) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('usuarioId', usuarioId)
        .input('integracaoId', integracaoId)
        .input('access_token', access_token)
        .input('expires_in', expires_in)
        .input('mercado_livre_user_id', mercado_livre_user_id)
        .input('refresh_token', refresh_token)
        .query(`
          INSERT INTO integracao_configuracao (usuario_id, integracao_id, access_token, expires_at, mercado_livre_user_id, refresh_token)
          OUTPUT INSERTED.id
          VALUES (@usuarioId, @integracaoId, @access_token, DATEADD(second, @expires_in, GETDATE()), @mercado_livre_user_id, @refresh_token);
        `);

      return {
        id: result.recordset[0].id
      };
    } catch (error) {
      console.error("Erro ao inserir configuração de integração:", error);
      throw new Error("Erro ao inserir configuração de integração: " + error);
    }
  },

  /**
   * Busca a configuração mais recente de uma integração (tokens, expiração).
   * @param {number} integracaoId
   */
  async buscarConfiguracaoIntegracao(integracaoId) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('integracaoId', integracaoId)
        .query(`
          SELECT TOP 1 *,
            -- 1 se o token já expirou ou expira nos próximos 5 minutos
            CASE
              WHEN expires_at <= DATEADD(minute, 5, GETDATE()) THEN 1
              ELSE 0
            END AS token_expirado
          FROM integracao_configuracao
          WHERE integracao_id = @integracaoId
          ORDER BY data_atualizacao DESC;
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error("Erro ao buscar configuração de integração:", error);
      throw new Error("Erro ao buscar configuração de integração: " + error);
    }
  },

  /**
   * Busca a configuração de integração pelo ID de usuário do Mercado Livre.
   * @param {number|string} mlUserId
   */
  async buscarPorMeliUserId(mlUserId) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('mlUserId', mlUserId)
        .query(`
          SELECT TOP 1 integracao_id, usuario_id 
          FROM integracao_configuracao 
          WHERE mercado_livre_user_id = @mlUserId
          ORDER BY data_atualizacao DESC;
        `);
      return result.recordset[0] || null;
    } catch (error) {
      console.error("Erro ao buscar integracao por ML User ID:", error);
      throw new Error("Erro ao buscar integracao por ML User ID: " + error.message);
    }
  },

  /**
   * Atualiza os tokens após um refresh bem-sucedido com o Mercado Livre.
   * @param {number} integracaoId
   * @param {string} accessToken
   * @param {string} refreshToken
   * @param {number} expiresIn - tempo em segundos retornado pelo ML
   */
  async atualizarTokensIntegracao(integracaoId, accessToken, refreshToken, expiresIn) {
    try {
      const dbPool = await pool;
      await dbPool.request()
        .input('integracaoId', integracaoId)
        .input('access_token', accessToken)
        .input('refresh_token', refreshToken)
        .input('expires_in', expiresIn)
        .query(`
          UPDATE integracao_configuracao
          SET access_token     = @access_token,
              refresh_token    = @refresh_token,
              expires_at       = DATEADD(second, @expires_in, GETDATE()),
              data_atualizacao = GETDATE()
          WHERE integracao_id  = @integracaoId;
        `);
    } catch (error) {
      console.error("Erro ao atualizar tokens da integração:", error);
      throw new Error("Erro ao atualizar tokens da integração: " + error);
    }
  },

  /**
   * [SOMENTE PARA TESTES] Marca o token como expirado no banco, permitindo
   * testar o fluxo de refresh sem aguardar as 6 horas reais.
   * @param {number} integracaoId
   */
  async _expirarTokenParaTeste(integracaoId) {
    try {
      const dbPool = await pool;
      await dbPool.request()
        .input('integracaoId', integracaoId)
        .query(`
          UPDATE integracao_configuracao
          SET expires_at       = DATEADD(hour, -1, GETDATE()),
              data_atualizacao = GETDATE()
          WHERE integracao_id  = @integracaoId;
        `);
    } catch (error) {
      console.error("Erro ao expirar token para teste:", error);
      throw new Error("Erro ao expirar token para teste: " + error);
    }
  }
};

module.exports = integracaoModel;
