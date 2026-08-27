const { pool, query } = require("./config/db");

async function testarConexao() {
  try {
    const result = await query("SELECT * FROM usuarios");
    console.log(
      "Conexão bem-sucedida. Primeiro usuário:",
      result[0]
    );
  } catch (err) {
    console.error("Erro na conexão com o banco:", err);
  }
}

testarConexao();
