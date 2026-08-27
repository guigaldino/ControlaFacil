import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Cadastro.module.css";
import { CheckCircle, Shield, Headset } from 'lucide-react'; 
import { ToastContainer, toast } from 'react-toastify';
import { API_BASE_URL } from "../../api"

const maskCpf = (value) => {
    const cleanValue = value.replace(/\D/g, "");
    const limitedValue = cleanValue.substring(0, 11);

    return limitedValue.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        "$1.$2.$3-$4"
    );
};

const maskCelular = (value) => {
    const cleanValue = value.replace(/\D/g, "");
    const limitedValue = cleanValue.substring(0, 11);

    if (limitedValue.length <= 10) {
        return limitedValue.replace(
            /^(\d{2})(\d{4})(\d{4})$/,
            "($1) $2-$3"
        );
    } else {
        return limitedValue.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            "($1) $2-$3"
        );
    }
};

export function Cadastro() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); 

    const [usuario, setUsuario] = useState({
        nome: "", 
        cpf: "", 
        celular: "", 
        cargo: "", 
        email: "",
        senha: "",
        confirmarSenha: ""
    });

    const handleChange = (e, setter) => {
        const { name, value } = e.target;
        let newValue = value;

        switch (name) {
            case "cpf":
                newValue = maskCpf(value);
                break;
            case "celular": 
                newValue = maskCelular(value);
                break;
            default:
                break;
        }

        setter(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleNext = () => {
        if (step === 1) {
            console.log("--- Executando validação da Etapa 1 (Usuário) ---");
            if (!usuario.nome || !usuario.cpf || !usuario.celular) {
                toast.error("Preencha todos os campos obrigatórios da Etapa 1.");
                console.log("Validação falhou: Campos vazios na Etapa 1.");
                return;
            }
            if (usuario.cpf.replace(/\D/g, "").length !== 11) {
                toast.error("O CPF deve ter 11 dígitos.");
                console.log("Validação falhou: CPF incompleto.");
                return;
            }
            if (usuario.celular.replace(/\D/g, "").length < 10) {
                toast.error("O celular deve ter no mínimo 10 dígitos (DDD + 8 ou 9 dígitos).");
                console.log("Validação falhou: Celular incompleto.");
                return;
            }
        }
        
        if (step < 2) { 
            console.log(`Etapa ${step} validada. Avançando para a Etapa ${step + 1}.`);
            setStep(step + 1);
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            console.log(`Voltando para a Etapa ${step - 1}.`);
            setStep(step - 1);
        }
    };
    
    const stepSubtitle = useMemo(() => {
        switch (step) {
            case 1:
                return "Seus dados pessoais (CPF e contato)";
            case 2:
                return "Defina seu e-mail e senha de acesso";
            default:
                return "";
        }
    }, [step]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (usuario.senha !== usuario.confirmarSenha) {
            toast.error("As senhas não coincidem.");
            return;
        }

        if (!usuario.email || !usuario.senha) {
            toast.error("Preencha todos os campos obrigatórios de Acesso.");
            return;
        }

        const usuarioPayload = {
            nome: usuario.nome,
            email: usuario.email,
            cpf_cnpj: usuario.cpf.replace(/\D/g, ""), 
            celular: usuario.celular.replace(/\D/g, ""), 
            cargo: usuario.cargo, 
            senha: usuario.senha,
        };

        try {
            toast.info("Cadastrando usuário...");
            
            const usuarioRes = await fetch(`${API_BASE_URL}/usuarios`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(usuarioPayload)
            });

            let usuarioData = {};
            let rawUsuarioText = "";

            try {
                const cloneRes = usuarioRes.clone(); 
                rawUsuarioText = await cloneRes.text();
                usuarioData = JSON.parse(rawUsuarioText);
            } catch (err) {
            }
            
            console.log(`Resposta bruta (status ${usuarioRes.status}):`, rawUsuarioText);

            if (!usuarioRes.ok) {
                let erroUsuario = "Erro ao cadastrar usuário.";
                
                if (usuarioData.message) {
                    erroUsuario = usuarioData.message;
                    console.log("Erro de API (JSON):", usuarioData);
                } else if (usuarioRes.status === 400 && rawUsuarioText) {
                     erroUsuario = JSON.parse(rawUsuarioText).error || "Erro de validação.";
                     console.log("Erro de validação:", erroUsuario);
                } else {
                    erroUsuario = "Erro de conexão/servidor. Verifique os logs do backend.";
                    console.log("Erro de API (Texto/HTML). Status:", usuarioRes.status, "Texto:", rawUsuarioText.substring(0, 50) + "...");
                }
                
                toast.error(erroUsuario);
                return;
            }
            
            console.log("✅ Cadastro de usuário bem-sucedido. Dados retornados:", usuarioData);

            toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
            navigate("/email-confirmacao");

        } catch (err) {
            console.error("Erro inesperado durante o fetch:", err);
            toast.error("Erro inesperado. Verifique o console.");
        }
    };

    const isCompleted = (stepNumber) => step > stepNumber;
    const isActive = (stepNumber) => step === stepNumber;
    const isConnectorActive = (stepNumber) => step >= stepNumber + 1;


    return (
        <div className={styles['registration-container']}>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className={styles['registration-branding']}>
                <h1>Controla Fácil</h1>
                <p>Seu Gerenciamento de Logística Começa Aqui!</p>
                <div className={styles['branding-features']}>
                    <p>
                        <CheckCircle size={18} className={styles.iconFeature} /> Rápido e Intuitivo
                    </p>
                    <p>
                        <Shield size={18} className={styles.iconFeature} /> Seguro e Confiável
                    </p>
                    <p>
                        <Headset size={18} className={styles.iconFeature} /> Suporte Dedicado
                    </p>
                </div>
            </div>

            <div className={styles['registration-form-area']}>
                
                <div className={styles.stepper}>
                    <div className={`${styles.step} ${isActive(1) ? styles.active : ''} ${isCompleted(1) ? styles.completed : ''}`} data-step="1">
                        <span className={styles['step-number']}>
                            {isCompleted(1) ? <CheckCircle size={16} /> : 1} 
                        </span>
                        <span className={styles['step-label']}>Usuário</span> 
                    </div>
                    <div className={`${styles['step-connector']} ${isConnectorActive(1) ? styles.active : ''}`}></div> 

                    <div className={`${styles.step} ${isActive(2) ? styles.active : ''} ${isCompleted(2) ? styles.completed : ''}`} data-step="2">
                        <span className={styles['step-number']}>
                            {isCompleted(2) ? <CheckCircle size={16} /> : 2}
                        </span>
                        <span className={styles['step-label']}>Acesso</span> 
                    </div>
                </div>

                <form id="registrationForm" onSubmit={handleSubmit}>
                    <div className={styles['form-header']}>
                        <h2>Crie sua conta</h2>
                        <p className={styles['step-subtitle']}>{stepSubtitle}</p>
                    </div>

                    <div className={`${styles['form-step']} ${isActive(1) ? styles['current-step'] : ''}`} id="step1">
                        <div className={styles['input-group']}>
                            <label htmlFor="nome">Nome Completo:</label>
                            <input type="text" id="nome" name="nome" value={usuario.nome} onChange={(e) => handleChange(e, setUsuario)} required />
                        </div>

                        <div className={styles['input-group']}> 
                            <label htmlFor="cargo">Cargo:</label>
                            <input type='text' id="cargo" name="cargo" value={usuario.cargo} onChange={(e) => handleChange(e, setUsuario)} />
                        </div>

                        <div className={styles['input-group']}>
                            <label htmlFor="cpf">CPF:</label>
                            <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" value={usuario.cpf} onChange={(e) => handleChange(e, setUsuario)} required maxLength={14} inputMode="numeric" /> 
                        </div>
                        
                        <div className={styles['input-group']}>
                            <label htmlFor="celular">Celular:</label>
                            <input type="tel" id="celular" name="celular" placeholder="(00) 00000-0000" value={usuario.celular} onChange={(e) => handleChange(e, setUsuario)} required maxLength={15} inputMode="tel" />
                        </div>

                    </div>

                    <div className={`${styles['form-step']} ${isActive(2) ? styles['current-step'] : ''}`} id="step3">
                        <div className={styles['input-group']}>
                            <label htmlFor="email">E-mail:</label>
                            <input type="email" id="email" name="email" value={usuario.email} onChange={(e) => handleChange(e, setUsuario)} required />
                        </div>
                        <div className={styles['input-group']}>
                            <label htmlFor="senha">Senha:</label>
                            <input type="password" id="senha" name="senha" value={usuario.senha} onChange={(e) => handleChange(e, setUsuario)} required />
                        </div>
                        <div className={styles['input-group']}>
                            <label htmlFor="confirmarSenha">Confirmar senha:</label>
                            <input type="password" id="confirmarSenha" name="confirmarSenha" value={usuario.confirmarSenha} onChange={(e) => handleChange(e, setUsuario)} required />
                        </div>
                    </div>

                    <div className={styles['navigation-buttons']}>
                        {step > 1 && (
                            <button type="button" id="prevBtn" className={styles['btn-secondary']} onClick={handlePrev}>
                                Voltar
                            </button>
                        )}
                        {step < 2 && ( 
                            <button type="button" id="nextBtn" className={styles['btn-primary']} onClick={handleNext}>
                                Próximo
                            </button>
                        )}
                        {step === 2 && ( 
                            <button type="submit" id="submitBtn" className={styles['btn-primary']}>
                                Finalizar Cadastro
                            </button>
                        )}
                    </div>
                </form>

                <div className={styles['login-link']}>
                    <p>Já tem uma conta? <a href="/">Faça login aqui</a></p>
                </div>
                <p className={styles['app-version']}>v1.0.0</p>
            </div>
        </div>
    );
}