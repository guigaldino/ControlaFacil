const axios = require("axios");
const integracaoModel = require("./integracaoModel");

/**
 * Retorna um access_token válido para a integração informada.
 * Se o token estiver expirado (ou próximo de expirar), realiza o refresh automaticamente.
 *
 * @param {number} integracaoId - ID da integração no banco de dados
 * @returns {Promise<string>} access_token válido
 * @throws {Error} Se a integração não for encontrada ou o refresh falhar
 */
async function obterAccessTokenValido(integracaoId) {
  const config = await integracaoModel.buscarConfiguracaoIntegracao(integracaoId);

  if (!config) {
    throw new Error(
      `Configuração de integração não encontrada para ID ${integracaoId}. Reconexão com o Mercado Livre necessária.`
    );
  }

  if (!config.token_expirado) {
    return config.access_token;
  }

  console.log(`[mlApiClient] Token da integração ${integracaoId} expirado. Renovando...`);
  return await _renovarToken(integracaoId, config.refresh_token);
}

/**
 * Chama a API do Mercado Livre para renovar o access_token usando o refresh_token salvo.
 * Salva automaticamente os novos tokens no banco após o refresh bem-sucedido.
 *
 * @param {number} integracaoId
 * @param {string} refreshToken
 * @returns {Promise<string>} Novo access_token
 * @throws {Error} Se o refresh falhar (ex: refresh_token revogado)
 */
async function _renovarToken(integracaoId, refreshToken) {
  try {
    const response = await axios.post(
      "https://api.mercadolibre.com/oauth/token",
      {
        grant_type: "refresh_token",
        client_id: process.env.ML_CLIENT_ID,
        client_secret: process.env.ML_CLIENT_SECRET,
        refresh_token: refreshToken,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // O ML pode retornar um novo refresh_token — sempre salvamos o mais recente
    await integracaoModel.atualizarTokensIntegracao(
      integracaoId,
      access_token,
      refresh_token,
      expires_in
    );

    console.log(`[mlApiClient] Token da integração ${integracaoId} renovado com sucesso.`);
    return access_token;
  } catch (error) {
    const detalhe = error.response?.data?.message || error.message;
    console.error(
      `[mlApiClient] Falha ao renovar token da integração ${integracaoId}:`,
      detalhe
    );
    throw new Error(
      `Não foi possível renovar o token do Mercado Livre (integração ${integracaoId}). ` +
        `Motivo: ${detalhe}. Reconexão com o Mercado Livre necessária.`
    );
  }
}

/**
 * Realiza uma requisição autenticada à API do Mercado Livre.
 * Gerencia o token automaticamente — não é necessário se preocupar com expiração ao usar esta função.
 *
 * @param {number} integracaoId - ID da integração no banco de dados
 * @param {'get'|'post'|'put'|'delete'} method - Método HTTP
 * @param {string} url - URL completa do endpoint da API do ML
 * @param {object|null} [data=null] - Corpo da requisição (para POST/PUT)
 * @returns {Promise<object>} Dados retornados pela API do ML (response.data)
 *
 * @example
 * // Buscar dados de um item no ML
 * const item = await chamarApiML(integracaoId, 'get', 'https://api.mercadolibre.com/items/MLB123456');
 *
 * @example
 * // Publicar um produto no ML
 * const resultado = await chamarApiML(integracaoId, 'post', 'https://api.mercadolibre.com/items', produtoData);
 */
async function chamarApiML(integracaoId, method, url, data = null) {
  const accessToken = await obterAccessTokenValido(integracaoId);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method,
    url,
    headers,
  };

  if (data) {
    config.data = data;
  }

  const response = await axios(config);

  return response.data;
}

module.exports = { chamarApiML, obterAccessTokenValido };
