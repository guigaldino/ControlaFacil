import { useEffect, useState, useCallback } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { Edit, Save, XCircle, User, Briefcase, Mail, Phone, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../../api';
import styles from "./MeusDados.module.css";
import 'react-toastify/dist/ReactToastify.css';
import { Loading } from '../../components/Loading';

const maskCpfCnpj = (v) => {
    const c = String(v).replace(/\D/g, "");
    if (c.length <= 11) return c.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    if (c.length === 14) return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    return c;
};

const maskCelular = (v) => {
    const c = String(v).replace(/\D/g, "");
    return c.length <= 10 
        ? c.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3")
        : c.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
};

export function MeusDados() {
    const [usuario, setUsuario] = useState({
        id: null, nome: "", cpf: "", celular: "", email: "", cargo: "", senha: "", confirmarSenha: ""
    });
    const [originalUsuario, setOriginalUsuario] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchDados = useCallback(async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return toast.error("Sessão expirada. Faça login novamente.");

        try {
            const res = await fetch(`${API_BASE_URL}/usuarios/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok && data.usuario) {
                const mapped = {
                    id: data.usuario.id,
                    nome: data.usuario.nome || "",
                    cpf: data.usuario.cpf_cnpj || "",
                    celular: data.usuario.celular || "",
                    email: data.usuario.email || "",
                    cargo: data.usuario.cargo || "",
                    senha: "", confirmarSenha: ""
                };
                setUsuario(mapped);
                setOriginalUsuario(mapped);
            }
        } catch (err) {
            toast.error("Erro ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchDados(); }, [fetchDados]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = (name === "cpf" || name === "celular") ? value.replace(/\D/g, "") : value;
        setUsuario(prev => ({ ...prev, [name]: val }));
    };

    const toggleEdit = (cancel = false) => {
        if (cancel) setUsuario({ ...originalUsuario, senha: "", confirmarSenha: "" });
        setIsEditing(!isEditing);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (usuario.senha && usuario.senha !== usuario.confirmarSenha) return toast.error("As senhas não coincidem.");
        
        setIsSaving(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${API_BASE_URL}/usuarios/${usuario.id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    cpf_cnpj: usuario.cpf,
                    celular: usuario.celular,
                    cargo: usuario.cargo,
                    ...(usuario.senha && { senha: usuario.senha })
                })
            });

            if (res.ok) {
                toast.success("Dados atualizados!");
                setOriginalUsuario(usuario);
                setIsEditing(false);
            } else {
                const data = await res.json();
                toast.error(data.message || "Erro ao salvar.");
            }
        } catch (err) {
            toast.error("Erro de conexão.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <Loading message="Carregando perfil..." />
    );

    return (
        <div className={styles.pageContainer}>
            <ToastContainer autoClose={3000} theme="colored" />
            
            <form className={styles.profileCard} onSubmit={handleSave}>
                <header className={styles.cardHeader}>
                    <div className={styles.titleWrapper}>
                        <h2 className={styles.mainTitle}>Meu Perfil</h2>
                        <p className={styles.infoText}>Gerencie suas informações pessoais e funcionais</p>
                    </div>
                    
                    <div className={styles.actions}>
                        {!isEditing ? (
                            <button type="button" className={styles.btnEdit} onClick={() => toggleEdit()}>
                                <Edit size={18} /> Editar Perfil
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => toggleEdit(true)}>
                                    <XCircle size={18} /> Cancelar
                                </button>
                                <button type="submit" className={styles.btnSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className={styles.spinnerSmall} /> : <Save size={18} />}
                                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className={styles.contentGrid}>
                    <section className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                            <User size={20} className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>Dados Gerais</h3>
                        </div>
                        <div className={styles.inputsGrid}>
                            <div className={styles.field}>
                                <label>Nome Completo</label>
                                <input name="nome" value={usuario.nome} onChange={handleChange} disabled={!isEditing} required />
                            </div>
                            <div className={styles.field}>
                                <label>CPF/CNPJ</label>
                                <input name="cpf" value={maskCpfCnpj(usuario.cpf)} onChange={handleChange} disabled={!isEditing} maxLength={18} required />
                            </div>
                            <div className={styles.field}>
                                <label>E-mail</label>
                                <input name="email" type="email" value={usuario.email} onChange={handleChange} disabled={!isEditing} required />
                            </div>
                            <div className={styles.field}>
                                <label>Celular</label>
                                <input name="celular" value={maskCelular(usuario.celular)} onChange={handleChange} disabled={!isEditing} maxLength={15} required />
                            </div>
                            <div className={styles.field}>
                                <label>Cargo / Função</label>
                                <input name="cargo" placeholder="Não definido" value={usuario.cargo} onChange={handleChange} disabled={!isEditing} />
                            </div>
                        </div>
                    </section>

                    {isEditing && (
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <ShieldCheck size={20} className={styles.sectionIcon} />
                                <h3 className={styles.sectionTitle}>Segurança</h3>
                            </div>
                            <div className={styles.inputsGrid}>
                                <div className={styles.field}>
                                    <label>Nova Senha</label>
                                    <input name="senha" type="password" value={usuario.senha} onChange={handleChange} placeholder="Deixar em branco para manter" />
                                </div>
                                <div className={styles.field}>
                                    <label>Confirmar Senha</label>
                                    <input name="confirmarSenha" type="password" value={usuario.confirmarSenha} onChange={handleChange} />
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </form>
        </div>
    );
}