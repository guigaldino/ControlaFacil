// O modelo usuarioModel é responsável por interagir com o banco de dados para operações relacionadas aos usuários.

const { pool } = require("../../config/db");

const usuarioModel = {
  // Inserir Usuario
  async inserir({ nome, email, cpf_cnpj, celular, cargo, senha_hash, token_verificacao, token_expiracao }) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('nome', nome)
        .input('email', email)
        .input('cpf_cnpj', cpf_cnpj)
        .input('celular', celular)
        .input('cargo', cargo)
        .input('senha_hash', senha_hash)
        .input('token_verificacao', token_verificacao)
        .input('token_expiracao', token_expiracao)
        .query(`
          INSERT INTO usuarios (nome, email, cpf_cnpj, celular, cargo, senha_hash, token_verificacao, token_expiracao)
          OUTPUT INSERTED.id
          VALUES (@nome, @email, @cpf_cnpj, @celular, @cargo, @senha_hash, @token_verificacao, @token_expiracao);
        `);

      const insertId = result.recordset[0].id;

      const usuario = await dbPool.request()
        .input('id', insertId)
        .query("SELECT * FROM usuarios WHERE id = @id");
      
      return {id: usuario.recordset[0].id, tokenVerificacao: usuario.recordset[0].token_verificacao};
    } catch (error) {
      console.error("Erro ao inserir usuário:", error);
      throw new Error("Erro ao inserir usuário: " + error);
    }
  },

  async atualizar({ id, nome, email, cpf_cnpj, celular, cargo }) {
    try {
      const dbPool = await pool;
      await dbPool.request()
        .input('id', id)
        .input('nome', nome)
        .input('email', email)
        .input('cpf_cnpj', cpf_cnpj)
        .input('celular', celular)
        .input('cargo', cargo)
        .query(`
          UPDATE usuarios 
          SET nome = @nome, email = @email, cpf_cnpj = @cpf_cnpj, celular = @celular, cargo = @cargo
          WHERE id = @id;
        `);

      const usuario = await dbPool.request()
        .input('id', id)
        .query("SELECT * FROM usuarios WHERE id = @id");

      return usuario.recordset[0];
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw new Error("Erro ao atualizar usuário: " + error);
    }
  },

  async listarUsuarios() {
    try {
      const dbPool = await pool;
      const result = await dbPool.request().query(
        "SELECT id, nome, email, cpf_cnpj, celular, cargo FROM usuarios"
      );
      return result.recordset;
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      throw new Error("Erro ao listar usuários: " + error);
    }
  },

  async buscarPorId(id) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('id', id)
        .query("SELECT id, nome, email, cpf_cnpj, celular, cargo FROM usuarios WHERE id = @id");
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      throw new Error("Erro ao buscar usuário por ID: " + error);
    }
  },

  async buscarPorEmail(email) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('email', email)
        .query("SELECT * FROM usuarios WHERE email = @email");
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      throw new Error("Erro ao buscar usuário por email: " + error);
    }
  },

  async existeCpf(cpf_cnpj) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('cpf_cnpj', cpf_cnpj)
        .query("SELECT 1 AS existe FROM usuarios WHERE cpf_cnpj = @cpf_cnpj");
      return result.recordset.length > 0;
    } catch (error) {
      console.error("Erro ao verificar CPF:", error);
      throw new Error("Erro ao verificar CPF: " + error);
    }
  },

  async existeEmail(email) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('email', email)
        .query("SELECT 1 AS existe FROM usuarios WHERE email = @email");
      return result.recordset.length > 0;
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      throw new Error("Erro ao verificar email: " + error);
    }
  },

  async existeId(id) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('id', id)
        .query("SELECT 1 AS existe FROM usuarios WHERE id = @id");
      return result.recordset.length > 0;
    } catch (error) {
      console.error("Erro ao verificar ID de usuário:", error);
      throw new Error("Erro ao verificar ID de usuário: " + error);
    }
  },

  async buscarPorTokenVerificacao(token_verificacao) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('token_verificacao', token_verificacao)
        .query("SELECT * FROM usuarios WHERE token_verificacao = @token_verificacao");
      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por token:", error);
      throw new Error("Erro ao buscar usuário por token: " + error);
    }
  },

  async ativarConta(token_verificacao) {
    try {
      const dbPool = await pool;
      const result = await dbPool.request()
        .input('token_verificacao', token_verificacao)
        .query("UPDATE usuarios SET verificado = 1, token_verificacao = NULL, token_expiracao = NULL WHERE token_verificacao = @token_verificacao");
      return result;
    } catch (error) {
      console.error("Erro ao ativar conta:", error);
      throw new Error("Erro ao ativar conta: " + error);
    }
  },

};

module.exports = usuarioModel;
