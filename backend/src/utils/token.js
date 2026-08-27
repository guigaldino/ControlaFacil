const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET || "sua_chave_secreta_aqui";

function gerarToken(payload, expiresIn = "12h") {
  return jwt.sign(payload, secretKey, { expiresIn });
}

function verificarToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
}

module.exports = {
  gerarToken,
  verificarToken,
};
