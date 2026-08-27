const { verificarToken } = require("../utils/token");

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ error: "Token não fornecido", sucesso: false });
  }

  const token = authHeader.split(" ")[1];
  const payload = verificarToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Token inválido", sucesso: false });
  }

  req.usuario = payload;
  next();
}

module.exports = autenticar;
