# Guia de Implementação: Verificação de Email no Cadastro

Para implementar a funcionalidade de verificação de email garantindo que a sua base seja respeitada e o código se mantenha na estrutura que você já possui (`Model` -> `Controller` -> `Route`), preparei um passo a passo conceitual.

Esse fluxo exigirá que você gere um **token único** no momento do cadastro, envie esse token via email contendo um link e, ao ser acessado, valide esse token em uma nova rota.

---

## Passo 1: Atualização no Banco de Dados

Primeiramente, sua tabela de usuários precisa saber se um usuário já verificou o email ou não, e precisa guardar o token até ele ser usado.

1. Adicione uma coluna `verificado` (booleano) à tabela `usuarios`, com o valor padrão `false`.
2. Adicione uma coluna `token_verificacao` (varchar, permissão nula) à tabela `usuarios`.

**Dica de SQL:**
```sql
ALTER TABLE usuarios ADD COLUMN verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN token_verificacao VARCHAR(255) DEFAULT NULL;
```

---

## Passo 2: Configuração de um Serviço de Email (Nodemailer)

Para enviar emails no Node.js, a biblioteca mais comum é o `nodemailer`.

1. Instale o pacote executando no terminal: 
   ```bash
   npm install nodemailer
   ```
2. Crie um arquivo em `src/utils/` chamado `email.js`.
3. Configure o transporter do Nodemailer. Se estiver em ambiente de teste, serviços como o **Mailtrap** (mailtrap.io) são perfeitos para capturar esses emails sem enviá-los de verdade.

**Exemplo conceitual do `src/utils/email.js`**:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Insira aqui as configurações do seu provedor (host, port, auth)
});

async function enviarEmailVerificacao(emailDestino, token) {
    const linkVerificacao = `http://localhost:<SUA_PORTA_AQUI>/api/usuarios/verificar-email?token=${token}`;
    
    await transporter.sendMail({
        from: '"Seu App" <nao-responda@seuapp.com>',
        to: emailDestino,
        subject: 'Confirme seu Email',
        html: `<p>Olá, por favor confirme seu email clicando no link abaixo:</p>
               <a href="${linkVerificacao}">Verificar Email</a>`
    });
}

module.exports = { enviarEmailVerificacao };
```

---

## Passo 3: Atualizar o `usuarioModel.js`

Atualize os métodos do Model para lidar com essas novas colunas.

1. **`inserir`**: Atualize o SQL de `INSERT` e os `params` para também receber e salvar a variável do `token_verificacao`.
2. **Nova função `buscarPorToken`**: Crie um método que faça um `SELECT` no banco de dados buscando o usuário que possui aquele `token_verificacao`.
3. **Nova função `ativarConta`**: Crie um método que dê um `UPDATE usuarios SET verificado = true, token_verificacao = NULL WHERE id = ?`. Isso limpa o token e ativa a conta.

---

## Passo 4: Atualizar o `usuarioController.js` (Inserção e Login)

Aqui está o coração da regra de negócio.

1. **No método `inserirUsuario`**:
   - Gere um token de verificação (você pode usar o módulo nativo do Node `crypto.randomBytes(20).toString('hex')`).
   - Salve esse token no banco junto com os dados do usuário, chamando o model que você atualizou no passo anterior.
   - Logo após o usuário ser inserido com sucesso, invoque a função `enviarEmailVerificacao` criada no Passo 2 passando o email do usuário e o token.

2. **No método `login`**:
   - Antes de prosseguir com o login e verificar a senha, adicione uma checagem: se `usuario.verificado` for falso (`false` ou `0`), retorne um erro (como status `403 Forbidden`) dizendo `"Seu email ainda não foi verificado"`.

---

## Passo 5: Criar a Rota e o Controller de Verificação

Seu sistema precisa de uma nova rota pública para receber o clique do usuário do email.

1. **No `usuarioController.js`**:
   - Crie o método `verificarEmail(req, res)`.
   - Obtenha o token extraído de `req.query.token`.
   - Consulte no `usuarioModel` se este token existe.
   - Se não existir, retorne erro (`Token inválido ou expirado`).
   - Se existir, chame a função de `ativarConta(usuario.id)`. Retorne sucesso (`Email verificado com sucesso!`).

2. **No `usuarioRoutes.js`**:
   - Adicione algo como `router.get('/verificar-email', usuarioController.verificarEmail);`. 
   - *Nota:* Garanta que essa rota não exija o middleware de autenticação (`checkToken`), pois o usuário ainda não logou no sistema!

---

## Resumo do Fluxo do Sistema

1. **Usuário -> /inserir**: Preenche os dados.
2. **Controller**: Gera o token único, salva no BD como não verificado, e dispara email via SMTP. Responde: "Verifique sua caixa de entrada".
3. **Usuário -> Login**: Se tentar logar agora, o Controller vai barrar ("Email não verificado!").
4. **Email -> Caixa de Entrada**: Usuário clica no link: `/verificar-email?token=...`
5. **Controller (verificarEmail)**: Acha o usuário pelo token e marca `verificado = true`.
6. **Usuário -> Login**: Acesso liberado!
