const nodemailer = require("nodemailer");
require("dotenv").config();
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const email = {
  gerarHtmlVerificacao(userName = "Usuário", verificationUrl = "#") {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verificação de E-mail - Controla Fácil</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f0;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f0;padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Card container -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1B3D4F 0%,#1e5263 100%);padding:40px 40px 30px;text-align:center;">
              <!-- Icon badge -->
              <div style="display:inline-block;background-color:#42C771;border-radius:16px;padding:16px 20px;margin-bottom:20px;">
                <span style="font-size:36px;">📦</span>
              </div>
              <br/>
              <span style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Controla Fácil</span>
              <br/>
              <span style="font-size:11px;font-weight:600;color:#42C771;letter-spacing:3px;text-transform:uppercase;">Gerenciamento de Logística</span>
            </td>
          </tr>

          <!-- Green accent bar -->
          <tr>
            <td style="height:5px;background:linear-gradient(90deg,#42C771,#2eaa58);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 48px 36px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1B3D4F;">
                Olá, ${userName}! 👋
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#5a6a72;line-height:1.6;">
                Obrigado por se cadastrar no <strong style="color:#1B3D4F;">Controla Fácil</strong>. 
                Para ativar sua conta e começar a gerenciar sua logística, confirme seu endereço de e-mail clicando no botão abaixo.
              </p>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5fbf7;border:1.5px solid #c6ecd4;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:14px;vertical-align:middle;">
                          <span style="font-size:28px;">✉️</span>
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:13px;color:#1B3D4F;font-weight:600;">Confirmação necessária</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#5a6a72;line-height:1.5;">
                            Este link de verificação é válido por <strong>24 horas</strong>. Se você não criou uma conta, pode ignorar este e-mail com segurança.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}"
                      style="display:inline-block;background:linear-gradient(135deg,#42C771 0%,#2eaa58 100%);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 48px;border-radius:50px;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(66,199,113,0.4);">
                      ✅ &nbsp; Verificar Meu E-mail
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:28px 0 0;font-size:12px;color:#8a9aa2;text-align:center;line-height:1.6;">
                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br/>
                <a href="${verificationUrl}" style="color:#42C771;word-break:break-all;">${verificationUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <hr style="border:none;border-top:1px solid #e8eef0;margin:0;"/>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 36px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#a0b0b8;">
                © ${new Date().getFullYear()} Controla Fácil · Gerenciamento de Logística
              </p>
              <p style="margin:0;font-size:11px;color:#b8c8d0;">
                Este é um e-mail automático, por favor não responda.
              </p>
            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `;
  },

  async enviarEmailVerificacao(to = 'guilherme.galdino@uscsonline.com.br', userName = 'Usuário', verificationUrl = '#') {
    await transporter.sendMail({
      from: `"Controla Fácil" <${process.env.EMAIL_USER}>`,
      to,
      subject: "✅ Verifique seu e-mail - Controla Fácil",
      html: this.gerarHtmlVerificacao(userName, verificationUrl)
    });
  },

  tokenVerificacao() { 
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const dataExpiracao = new Date(Date.now() + 24 * 60 * 60 * 1000);

      return { token, tokenExpira: dataExpiracao };
    } catch (error) {
      throw error;
    }
  }
}


module.exports = email;