import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import styles from "./LoginU.module.css";
import { API_BASE_URL } from "../../api"

export function LoginU() {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, setLogin] = useState(location.state?.adminEmail || "");
  const [senha, setSenha] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (location.state?.provisioned) {
      setMessage({
        type: 'success',
        text: `Instância '${location.state.subdomain}.controlafacil.com.br' implantada com sucesso! Faça o primeiro acesso com a senha temporária: CF-@Admin2026`
      });
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();

    
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: login, senha: senha }),
      });
      
      let data;
      
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: "Erro de servidor. Resposta inválida." };
      }

      if (!response.ok) {
        const errorText = data.error || data.message || "Erro ao fazer login. Verifique suas credenciais.";
        setMessage({ 
          type: 'error', 
          text: errorText 
        });
        setIsLoading(false); 
        return;
      }

      localStorage.setItem("authToken", data.token || "DEBUG_TOKEN_PLACEHOLDER");
      
      setMessage({ type: 'success', text: "Login realizado com sucesso! Redirecionando..." });
      setTimeout(() => {
        navigate("/home"); 
      }, 800);

    } catch (error) {
      setMessage({ type: 'error', text: "Erro de conexão. Verifique sua rede e tente novamente." });
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.body}> 
      <div className={styles.loginContainer}>
        
        <div className={styles.loginBranding}>
          <i className={`fas fa-truck-moving ${styles.brandingIcon}`} aria-hidden="true"></i> 
          <h1>Controla Fácil</h1>
          <p>Gerenciamento de Logística Simplificado</p>
        </div>

        <div className={styles.loginFormArea}>
          <div className={styles.formHeader}>
            <h2>Bem-Vindo de Volta!</h2>
            <p>Faça seu login para acessar o painel.</p>
          </div>

          {message && (
            <div 
              className={`${styles.feedbackMessage} ${styles[message.type]}`}
              role={message.type === 'error' ? "alert" : "status"}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.loginForm}>

            <div className={styles.inputGroup}>
              <label htmlFor="username">E-mail ou Usuário</label>
              <div className={styles.inputFieldWrapper}>
                <i className="fas fa-user icon" aria-hidden="true"></i> 
                <input
                  type="email"
                  id="username"
                  name="username"
                  placeholder="Seu e-mail ou nome de usuário"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Senha</label>
              <div className={styles.inputFieldWrapper}>
                <i className="fas fa-lock icon" aria-hidden="true"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input 
                    type="checkbox" 
                    name="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                /> 
                Lembrar-me
              </label>
              <Link to="/recuperar-senha" className={styles.forgotPassword}>
                Esqueceu a senha?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className={styles.btnLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                    <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> 
                    {' Entrando...'}
                </>
              ) : (
                <>
                    {'Entrar '}
                    <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </>
              )}
            </button>
            
            <div className={styles.signupLink}>
              <p>Não tem uma conta? <Link to="/cadastro">Crie aqui</Link></p>
            </div>
          </form>
          <p className={styles.appVersion}>v1.0.0</p>
        </div>
      </div>
    </main>
  );
}