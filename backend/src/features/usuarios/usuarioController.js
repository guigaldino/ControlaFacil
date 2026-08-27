// O usuarioController é responsável por gerenciar as operações relacionadas a clientes, como inserção, atualização e exclusão de dados.

const Usuario = require("./usuarioModel");
const { gerarToken } = require("../../utils/token");
const { gerarHash } = require("../../utils/hash");
const { conferirHash } = require("../../utils/hash");
const emailVerificacao = require("../../utils/email")
require("dotenv").config();

const usuarioController = {
  // Inserir usuario
  async inserirUsuario(req, res) {
    const { nome, email, cpf_cnpj, celular, cargo, senha } = req.body;
    // Validação dos dados obrigatórios
    if (!nome || !email || !cpf_cnpj || !celular || !cargo || !senha) {
      return res.status(400).json({
        error: "Dados obrigatórios não foram preenchidos",
        sucesso: false,
      });
    }

    try {
      const cpfExiste = await Usuario.existeCpf(cpf_cnpj);
      if (cpfExiste) {
        return res.status(400).json({
          error: "CPF ou CNPJ já cadastrado",
          sucesso: false,
        });
      }

      const emailExiste = await Usuario.existeEmail(email);
      if (emailExiste) {
        return res.status(400).json({
          error: "Email já cadastrado",
          sucesso: false,
        });
      }

      const senhaHash = await gerarHash(senha);
      const emailToken = emailVerificacao.tokenVerificacao();

      const usuarioCadastrado = await Usuario.inserir({
        nome,
        email,
        cpf_cnpj,
        celular,
        cargo,
        senha_hash: senhaHash,
        token_verificacao: emailToken.token,
        token_expiracao: emailToken.tokenExpira,
      });

      const urlVerificacao = `${process.env.URL_API}/usuarios/verificar-email/${emailToken.token}`;
      await emailVerificacao.enviarEmailVerificacao(email, nome, urlVerificacao);

      return res.status(201).json({
        message: "Usuário inserido com sucesso",
        idUsuario: usuarioCadastrado,
        sucesso: true,
      });
    } catch (error) {
      console.error("Erro ao inserir usuário:", error);
      return res.status(500).json({
        error: "Erro ao inserir usuário",
        message: error.message,
        sucesso: false,
      });
    }
  },

  async atualizarUsuario(req, res) {
    const { id, nome, email, cpf_cnpj, celular, cargo } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "ID é obrigatório",
        sucesso: false,
      });
    }

    try {
      const usuarioExistente = await Usuario.buscarPorId(id);

      if (!usuarioExistente) {
        return res.status(404).json({
          error: `Usuário com ID ${id} não encontrado`,
          sucesso: false,
        });
      }

      const usuarioAtualizado = await Usuario.atualizar({
        id,
        nome: nome || usuarioExistente.nome,
        email: email || usuarioExistente.email,
        cpf_cnpj: cpf_cnpj || usuarioExistente.cpf_cnpj,
        celular: celular || usuarioExistente.celular,
        cargo: cargo || usuarioExistente.cargo,
      });

      return res.status(200).json({
        message: "Usuário atualizado com sucesso",
        data: usuarioAtualizado,
        sucesso: true,
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({
        error: "Erro ao atualizar usuário",
        message: error.message,
        sucesso: false,
      });
    }
  },

  async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res
        .status(400)
        .json({ error: "Email e senha são obrigatórios", sucesso: false });
    }

    try {
      const usuario = await Usuario.buscarPorEmail(email);

      if (!usuario) {
        return res
          .status(404)
          .json({ error: "Usuário não encontrado", sucesso: false });
      }

      const senhaCorreta = await conferirHash(senha, usuario.senha_hash);
      if (!senhaCorreta) {
        return res
          .status(401)
          .json({ error: "Senha incorreta", sucesso: false });
      }

      if (usuario.verificado != 1 || usuario.verificado == false) {
        return res
          .status(403)
          .json({ error: "Email não validado", sucesso: false });
      }

      const token = gerarToken({
        id: usuario.id,
        nome: usuario.nome,
        cargo: usuario.cargo,
      });

      return res.status(200).json({
        message: "Login realizado com sucesso",
        token: token,
        sucesso: true,
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({
        error: "Erro ao fazer login",
        message: error.message,
        sucesso: false,
      });
    }
  },

  async listarUsuarios() {
    try {
      const usuarios = await Usuario.listarUsuarios();

      return {
        quantidade: usuarios.length,
        data: usuarios,
        sucesso: true,
      };
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return {
        error: "Erro ao listar usuários",
        message: error.message,
        sucesso: false,
      };
    }
  },

  async buscarPorId(req, res) {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ error: "ID é obrigatório", sucesso: false });
    }

    try {
      const usuario = await Usuario.buscarPorId(id);

      if (!usuario) {
        return res.status(404).json({
          error: "Usuário não encontrado",
          sucesso: false,
        });
      }

      return res.status(200).json({
        message: "Usuário encontrado",
        data: usuario,
        sucesso: true,
      });
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return res.status(500).json({
        error: "Erro ao buscar usuário por ID",
        message: error.message,
        sucesso: false,
      });
    }
  },

  async dadosUsuarioLogado(req, res) {
    try {
      const usuarioId = req.usuario.id;

      const usuario = await Usuario.buscarPorId(usuarioId);

      if (!usuario) {
        return res.status(404).json({
          error: "Usuário não encontrado",
          sucesso: false,
        });
      }

      return res.status(200).json({
        message: "Dados do usuário logado obtidos com sucesso",
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cpf_cnpj: usuario.cpf_cnpj,
          celular: usuario.celular,
          cargo: usuario.cargo,
        },
        sucesso: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao obter dados do usuário logado",
        message: error.message,
        sucesso: false,
      });
    }
  },

  async verificarEmail(req, res) {
    const frontendUrl = process.env.URL_FRONTEND || "http://localhost:5173";
    try {
      const { token } = req.params;

      if (!token) {
        return res.redirect(`${frontendUrl}/email-falha-validacao`);
      }

      const usuario = await Usuario.buscarPorTokenVerificacao(token);

      if (!usuario) {
        return res.redirect(`${frontendUrl}/email-falha-validacao`);
      }

      const tempoAtual = new Date();
      const tempoExpiracao = new Date(usuario.token_expiracao);

      if (tempoAtual > tempoExpiracao) {
        return res.redirect(`${frontendUrl}/email-falha-validacao`);
      }

      await Usuario.ativarConta(token);

      return res.redirect(`${frontendUrl}/email-validado`);

    } catch (error) {
      console.error("Erro ao verificar email:", error);
      return res.redirect(`${frontendUrl}/email-falha-validacao`);
    }
  }
};

module.exports = usuarioController;
