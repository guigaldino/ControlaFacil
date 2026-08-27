import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import styles from './CadastroProduto.module.css';

// --- Função Auxiliar para Toasts ---
const notify = {
    success: (message) => toast.success(message, { 
        position: "top-right", 
        autoClose: 5000, 
        hideProgressBar: false, 
        closeOnClick: true, 
        pauseOnHover: true, 
        draggable: true, 
        progress: undefined 
    }),
    error: (message) => toast.error(message, { 
        position: "top-right", 
        autoClose: 5000, 
        hideProgressBar: false, 
        closeOnClick: true, 
        pauseOnHover: true, 
        draggable: true, 
        progress: undefined 
    }),
};

// Componente para card de opção (Mantido)
const OptionCard = ({ title, icon, onClick }) => (
    <div className={styles.card} onClick={onClick}>
        <span className={styles.cardIcon}>{icon}</span>
        <h3 className={styles.cardTitle}>{title}</h3>
    </div>
);

// --- Componente de formulário para cadastrar CATEGORIAS (Corrigido para usar Toasts) ---
const CadastroCategoriaFormulario = ({ setMode }) => {
    const [nomeCategoria, setNomeCategoria] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleCategoriaSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        console.log("-----------------------------------------");
        console.log("🚀 INÍCIO: Tentativa de Cadastro de Categoria");

        if (!nomeCategoria) {
            notify.error("Erro: Preencha o nome da categoria.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            nome: nomeCategoria,
        };
        
        console.log("➡️ Enviando POST para: /api/categoria-produto"); 
        
        try {
            const response = await fetch("/api/categoria-produto", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            console.log(`📡 Resposta recebida. Status: ${response.status}`);
            
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            console.log("📦 Dados da Resposta:", data);

            if (!response.ok) {
                const errorText = data.message || data.error || `Falha com status ${response.status}.`;
                notify.error(`Falha no Cadastro: ${errorText}`);
                return;
            }

            notify.success(`Categoria "${nomeCategoria}" cadastrada com sucesso!`);
            setNomeCategoria(''); 
            setMode('selector'); 

        } catch (error) {
            console.error("🔥 ERRO FATAL (Rede/Inesperado):", error);
            notify.error("Erro de conexão. Não foi possível cadastrar a categoria.");
        } finally {
            setIsSubmitting(false);
            console.log("-----------------------------------------");
        }
    };
    
    return (
        <div className={styles.formSection}>
            <button className={styles.backButton} onClick={() => setMode('selector')} disabled={isSubmitting}>
                &larr; Voltar para Opções
            </button>
            <h1 className={styles.pageTitle}>Cadastrar Categoria</h1>
            <form onSubmit={handleCategoriaSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="nomeCategoria">Nome da Categoria*</label>
                    <input
                        type="text"
                        id="nomeCategoria"
                        name="nomeCategoria"
                        value={nomeCategoria}
                        onChange={(e) => setNomeCategoria(e.target.value)}
                        required
                        placeholder="Ex: Escolar, Alimentício, Eletrônico"
                        disabled={isSubmitting}
                    />
                </div>

                <button type="submit" className={styles.actionBtn} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Cadastrando...
                        </>
                    ) : (
                        'Cadastrar Categoria'
                    )}
                </button>
            </form>
        </div>
    );
};
// --- FIM Componente Categoria ---


// --- Componente de formulário para cadastrar TIPOS DE PRODUTO (Corrigido para usar 'nome' e Toasts) ---
const CadastroTipoFormulario = ({ setMode, categorias, fetchCategorias }) => {
    const [nomeTipo, setNomeTipo] = useState('');
    const [categoriaSelecionada, setCategoriaSelecionada] = useState(''); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (categorias.length === 0) {
            fetchCategorias();
        }
    }, [categorias, fetchCategorias]);

    const handleTipoSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!categoriaSelecionada) {
            notify.error("Selecione uma categoria.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            // CORREÇÃO AQUI: Troca 'name' por 'nome'
            nome: nomeTipo, 
            categoriaProdutoId: [parseInt(categoriaSelecionada, 10)], 
        };
        
        console.log("-----------------------------------------");
        console.log("🚀 INÍCIO: Tentativa de Cadastro de Tipo");
        console.log("📦 Payload:", payload);
        console.log("➡️ Enviando POST para: /api/tipo-produto");
        
        try {
            const response = await fetch("/api/tipo-produto", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            console.log(`📡 Resposta recebida. Status: ${response.status}`);
            
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            console.log("📦 Dados da Resposta:", data);

            if (!response.ok) {
                const errorText = data.message || data.error || `Falha com status ${response.status}.`;
                console.error("❌ ERRO NO CADASTRO DE TIPO:", errorText);
                notify.error(`Falha no Cadastro de Tipo: ${errorText}`);
                return;
            }

            notify.success(`Tipo "${nomeTipo}" cadastrado e vinculado com sucesso!`);
            setNomeTipo(''); 
            setCategoriaSelecionada(''); 
            setMode('selector'); 

        } catch (error) {
            console.error("🔥 ERRO FATAL (Rede/Inesperado):", error);
            notify.error("Erro de conexão. Não foi possível cadastrar o tipo.");
        } finally {
            setIsSubmitting(false);
            console.log("-----------------------------------------");
        }
    };
    
    return (
        <div className={styles.formSection}>
            <button className={styles.backButton} onClick={() => setMode('selector')} disabled={isSubmitting}>
                &larr; Voltar para Opções
            </button>
            <h1 className={styles.pageTitle}>Cadastrar Tipo de Produto</h1>
            <form onSubmit={handleTipoSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="nomeTipo">Nome do Tipo*</label>
                    <input
                        type="text"
                        id="nomeTipo"
                        name="nomeTipo"
                        value={nomeTipo}
                        onChange={(e) => setNomeTipo(e.target.value)}
                        required
                        placeholder="Ex: Caderno, Caneta, Borracha"
                        disabled={isSubmitting}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="categoriaSelect">Vincular à Categoria*</label>
                    <select
                        id="categoriaSelect"
                        className={`${styles.input} ${styles.selectCustom}`} // Adiciona classe customizada
                        value={categoriaSelecionada}
                        onChange={(e) => setCategoriaSelecionada(e.target.value)}
                        disabled={isSubmitting || categorias.length === 0}
                        required
                    >
                        <option value="" disabled>
                            {categorias.length === 0 ? 'Carregando categorias...' : 'Selecione uma categoria'}
                        </option>
                        {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className={styles.actionBtn} disabled={isSubmitting || !categoriaSelecionada}>
                    {isSubmitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Cadastrando Tipo...
                        </>
                    ) : (
                        'Cadastrar Tipo'
                    )}
                </button>
            </form>
        </div>
    );
};
// --- FIM Componente Tipo ---


// --- Componente de formulário para cadastrar MODELOS DE PRODUTO (Corrigido para usar 'nome' e Toasts) ---
const CadastroModeloFormulario = ({ setMode, tipos, fetchTipos }) => {
    const [nomeModelo, setNomeModelo] = useState('');
    const [tipoSelecionado, setTipoSelecionado] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Efeito para carregar os tipos na montagem, se ainda não estiverem lá
    useEffect(() => {
        if (tipos.length === 0) {
            fetchTipos();
        }
    }, [tipos, fetchTipos]);

    // Função de submissão do Modelo
    const handleModeloSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!tipoSelecionado) {
            notify.error("Selecione um tipo de produto.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            nome: nomeModelo,
            tipo_produto_id: parseInt(tipoSelecionado, 10), // Envia o ID numérico
        };
        
        console.log("-----------------------------------------");
        console.log("🚀 INÍCIO: Tentativa de Cadastro de Modelo");
        console.log("📦 Payload:", payload);
        console.log("➡️ Enviando POST para: /api/modelo-produto");
        
        try {
            const response = await fetch("/api/modelo-produto", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            console.log(`📡 Resposta recebida. Status: ${response.status}`);
            
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            console.log("📦 Dados da Resposta:", data);

            if (!response.ok) {
                const errorText = data.message || data.error || `Falha com status ${response.status}.`;
                console.error("❌ ERRO NO CADASTRO DE MODELO:", errorText);
                notify.error(`Falha no Cadastro de Modelo: ${errorText}`);
                return;
            }

            notify.success(`Modelo "${nomeModelo}" cadastrado e vinculado com sucesso!`);
            setNomeModelo(''); 
            setTipoSelecionado(''); 
            setMode('selector'); 

        } catch (error) {
            console.error("🔥 ERRO FATAL (Rede/Inesperado):", error);
            notify.error("Erro de conexão. Não foi possível cadastrar o modelo.");
        } finally {
            setIsSubmitting(false);
            console.log("-----------------------------------------");
        }
    };
    
    return (
        <div className={styles.formSection}>
            <button className={styles.backButton} onClick={() => setMode('selector')} disabled={isSubmitting}>
                &larr; Voltar para Opções
            </button>
            <h1 className={styles.pageTitle}>Cadastrar Modelo de Produto</h1>
            <form onSubmit={handleModeloSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="nomeModelo">Nome do Modelo*</label>
                    <input
                        type="text"
                        id="nomeModelo"
                        name="nomeModelo"
                        value={nomeModelo}
                        onChange={(e) => setNomeModelo(e.target.value)}
                        required
                        placeholder="Ex: A5, P30, Esporte"
                        disabled={isSubmitting}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="tipoSelect">Vincular ao Tipo de Produto*</label>
                    <select
                        id="tipoSelect"
                        className={`${styles.input} ${styles.selectCustom}`} // Adiciona classe customizada
                        value={tipoSelecionado}
                        onChange={(e) => setTipoSelecionado(e.target.value)}
                        disabled={isSubmitting || tipos.length === 0}
                        required
                    >
                        <option value="" disabled>
                            {tipos.length === 0 ? 'Carregando tipos...' : 'Selecione um tipo'}
                        </option>
                        {tipos.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                                {/* CORREÇÃO AQUI: Troca 'name' por 'nome' */}
                                {tipo.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className={styles.actionBtn} disabled={isSubmitting || !tipoSelecionado}>
                    {isSubmitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Cadastrando Modelo...
                        </>
                    ) : (
                        'Cadastrar Modelo'
                    )}
                </button>
            </form>
        </div>
    );
};
// --- FIM Componente Modelo ---


// Componente de formulário para cadastrar PRODUTOS (Mantido, Toasts adicionados na submissão)
const CadastroFormulario = ({ form, handleChange, handleSubmit, setMode }) => (
    <div className={styles.formSection}>
        <button className={styles.backButton} onClick={() => setMode('selector')}>
            &larr; Voltar para Opções
        </button>
        <h1 className={styles.pageTitle}>Cadastro de Novo Produto</h1>
        <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label htmlFor="codigoProduto">Código do Produto*</label>
                <input
                    type="text"
                    id="codigoProduto"
                    name="codigoProduto"
                    value={form.codigoProduto}
                    onChange={handleChange}
                    required
                    placeholder="Ex: SKU001"
                />
            </div>
            {/* Outros campos de produto (Mantidos) */}
            <div className={styles.formGroup}>
                <label htmlFor="nomeProduto">Nome do Produto*</label>
                <input
                    type="text"
                    id="nomeProduto"
                    name="nomeProduto"
                    value={form.nomeProduto}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Caneta Azul Esferográfica"
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="quantidadeProduto">Quantidade em Estoque*</label>
                <input
                    type="number"
                    id="quantidadeProduto"
                    name="quantidadeProduto"
                    value={form.quantidadeProduto}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="Ex: 100"
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="precoProduto">Preço Unitário (R$)*</label>
                <input
                    type="number"
                    id="precoProduto"
                    name="precoProduto"
                    value={form.precoProduto}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="Ex: 2.50"
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="descricao">Descrição*</label>
                <textarea
                    id="descricao"
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Categoria, tipo e modelo"
                    rows="4"
                />
            </div>

            <button type="submit" className={styles.actionBtn}>
                Cadastrar Produto
            </button>
        </form>
    </div>
);


// Componente Seletor de Opções (Mantido)
const CadastroSelector = ({ setMode }) => (
    <div className={styles.selectorSection}>
        <h1 className={styles.selectorTitle}>O que deseja cadastrar?</h1>
        <p className={styles.selectorSubtitle}>Escolha uma das opções abaixo para iniciar o processo de cadastro.</p>
        <div className={styles.cardGrid}>
            <OptionCard 
                title="Cadastrar Produto" 
                icon="📦" 
                onClick={() => setMode('produto')} 
            />
            <OptionCard 
                title="Cadastrar Categoria" 
                icon="🏷️" 
                onClick={() => setMode('categoria')} 
            />
            <OptionCard 
                title="Cadastrar Tipo" 
                icon="🔖" 
                onClick={() => setMode('tipo')} 
            />
            <OptionCard 
                title="Cadastrar Modelo" 
                icon="📐" 
                onClick={() => setMode('modelo')} 
            />
        </div>
    </div>
);


export function CadastroProduto() {
    const [mode, setMode] = useState('selector'); 
    
    // ESTADOS: Categorias e Tipos
    const [categorias, setCategorias] = useState([]);
    const [categoriasLoading, setCategoriasLoading] = useState(false);
    // ESTADO: Tipos usa 'nome'
    const [tipos, setTipos] = useState([]);
    const [tiposLoading, setTiposLoading] = useState(false); 

    // Estado do formulário de produto
    const [form, setForm] = useState({
        codigoProduto: '',
        nomeProduto: '',
        quantidadeProduto: '',
        precoProduto: '',
        descricao: ''
    });

    // Função para buscar a lista de categorias (Mantida, já estava correta)
    const fetchCategorias = useCallback(async () => {
        if (categoriasLoading) return; 
        setCategoriasLoading(true);
        console.log("-----------------------------------------");
        console.log("🔄 BUSCA: Carregando categorias...");
        
        try {
            // Endpoint /categoria-produto
            const response = await fetch("/api/categoria-produto", { method: "GET" });
            
            console.log(`📡 GET /api/categoria-produto. Status: ${response.status}`); // LOG
            
            const data = await response.json();
            console.log("📦 Dados recebidos (Categorias):", data); // LOG
            
            if (response.ok && Array.isArray(data.data)) {
                const categoriasMapeadas = data.data.map(cat => ({ 
                    id: parseInt(cat.id, 10), 
                    // CHAVE DE DADOS: usa 'nome'
                    nome: cat.nome 
                }));
                setCategorias(categoriasMapeadas);
                console.log("✅ Categorias mapeadas:", categoriasMapeadas.length);
            } else {
                console.error("❌ Erro ao carregar categorias:", data.message || "Estrutura de dados inválida.");
            }
        } catch (error) {
            console.error("🔥 ERRO DE REDE/PARSING ao buscar categorias:", error); // LOG DE ERRO
        } finally {
            setCategoriasLoading(false);
            console.log("-----------------------------------------");
        }
    }, [categoriasLoading]); 

    // Função para buscar a lista de tipos (CORRIGIDA para usar 'nome')
    const fetchTipos = useCallback(async () => {
        if (tiposLoading) return;
        setTiposLoading(true);
        console.log("-----------------------------------------");
        console.log("🔄 BUSCA: Carregando tipos...");
        
        try {
            // Endpoint /tipo-produto
            const response = await fetch("/api/tipo-produto", { method: "GET" });
            
            console.log(`📡 GET /api/tipo-produto. Status: ${response.status}`); // LOG
            
            const data = await response.json();
            console.log("📦 Dados recebidos (Tipos):", data); // LOG
            
            if (response.ok && Array.isArray(data.data)) {
                const tiposMapeados = data.data.map(tipo => ({ 
                    id: parseInt(tipo.id, 10), 
                    // CORREÇÃO AQUI: Usando 'nome'
                    nome: tipo.nome
                }));
                setTipos(tiposMapeados);
                console.log("✅ Tipos mapeados:", tiposMapeados.length);
            } else {
                console.error("❌ Erro ao carregar tipos:", data.message || "Estrutura de dados inválida.");
            }
        } catch (error) {
            console.error("🔥 ERRO DE REDE/PARSING ao buscar tipos:", error); // LOG DE ERRO
        } finally {
            setTiposLoading(false);
            console.log("-----------------------------------------");
        }
    }, [tiposLoading]); 

    // Efeito para carregar categorias e tipos na montagem inicial (Mantido)
    useEffect(() => {
        if (categorias.length === 0 && !categoriasLoading) {
             fetchCategorias();
        }
        if (tipos.length === 0 && !tiposLoading) {
             fetchTipos();
        }
    }, [fetchCategorias, fetchTipos, categorias.length, categoriasLoading, tipos.length, tiposLoading]);

    // Funções de manipulação do formulário de Produto (Mantidas)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Produto cadastrado (Simulação):", form);
        
        notify.success(`Produto "${form.nomeProduto}" cadastrado (simulação).`);

        setForm({ 
            codigoProduto: '',
            nomeProduto: '',
            quantidadeProduto: '',
            precoProduto: '',
            descricao: ''
        });
        
        console.log("Sucesso! Redirecionando para /produtos...");
    };

    const renderContent = () => {
        switch (mode) {
            case 'produto':
                return (
                    <div className={styles.formWrapper}> 
                        <CadastroFormulario 
                            form={form} 
                            handleChange={handleChange} 
                            handleSubmit={handleSubmit}
                            setMode={setMode} 
                        />
                    </div>
                );
            case 'categoria':
                return (
                    <div className={styles.formWrapper}>
                        <CadastroCategoriaFormulario setMode={setMode} />
                    </div>
                );
            case 'tipo':
                return (
                    <div className={styles.formWrapper}>
                        <CadastroTipoFormulario 
                            setMode={setMode} 
                            categorias={categorias} 
                            fetchCategorias={fetchCategorias} 
                        />
                    </div>
                );
            case 'modelo':
                // Integração do formulário de Modelo
                return (
                    <div className={styles.formWrapper}>
                        <CadastroModeloFormulario 
                            setMode={setMode} 
                            tipos={tipos} 
                            fetchTipos={fetchTipos} 
                        />
                    </div>
                );
            case 'selector':
            default:
                return <CadastroSelector setMode={setMode} />;
        }
    };

    return (
        <main className={styles.container}>
            <ToastContainer />
            <div className={styles.containerSection}>
                {renderContent()}
            </div>
        </main>
    );
}