import React, { useState, useEffect } from 'react';
import { X, FileText, Package, ShoppingCart, Loader2, Filter, Columns3, Save } from 'lucide-react';
import styles from './ModalRelatorioPersonalizado.module.css';
import { API_BASE_URL } from '../../api';
import { toast } from 'react-toastify';

const COLUNAS_DISPONIVEIS = {
    produtos: [
        { key: 'nome', label: 'Nome do Produto' },
        { key: 'sku', label: 'SKU' },
        { key: 'preco', label: 'Preço' },
        { key: 'qtd_disponivel', label: 'Qtd. Disponível' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'gtin', label: 'GTIN / EAN' },
        { key: 'condicao', label: 'Condição' },
        { key: 'categoria_nome', label: 'Categoria' },
    ],
    pedidos: [
        { key: 'id_pedido_ml', label: 'ID Pedido ML' },
        { key: 'data_pedido', label: 'Data do Pedido' },
        { key: 'status_pedido', label: 'Status' },
        { key: 'total', label: 'Valor Total' },
        { key: 'apelido_comprador', label: 'Comprador' },
        { key: 'nome_completo_comprador', label: 'Nome Completo' },
    ],
};

export function ModalRelatorioPersonalizado({ isOpen, onClose, onSaveSuccess, relatorioParaEditar = null, integracoes = [] }) {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tipo, setTipo] = useState('produtos');
    const [integracaoId, setIntegracaoId] = useState('');
    const [filtros, setFiltros] = useState({});
    const [colunasSelecionadas, setColunasSelecionadas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const isEdicao = !!relatorioParaEditar;

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setIsSubmitting(false);

            if (relatorioParaEditar) {
                setNome(relatorioParaEditar.nome || '');
                setDescricao(relatorioParaEditar.descricao || '');
                setTipo(relatorioParaEditar.tipo || 'produtos');
                setIntegracaoId(relatorioParaEditar.integracao_id ? String(relatorioParaEditar.integracao_id) : '');
                setFiltros(relatorioParaEditar.filtros || {});
                setColunasSelecionadas(relatorioParaEditar.colunas || []);
            } else {
                setNome('');
                setDescricao('');
                setTipo('produtos');
                setIntegracaoId('');
                setFiltros({});
                setColunasSelecionadas([]);
            }
        }
    }, [isOpen, relatorioParaEditar]);

    const handleTipoChange = (novoTipo) => {
        setTipo(novoTipo);
        setFiltros({});
        setColunasSelecionadas([]);
        setErrors(prev => ({ ...prev, colunas: false }));
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => {
            const novo = { ...prev };
            if (valor === '' || valor === undefined) {
                delete novo[campo];
            } else {
                novo[campo] = isNaN(Number(valor)) ? valor : Number(valor);
            }
            return novo;
        });
    };

    const handleColunaToggle = (colKey) => {
        setColunasSelecionadas(prev => {
            if (prev.includes(colKey)) {
                return prev.filter(c => c !== colKey);
            }
            return [...prev, colKey];
        });
        if (errors.colunas) {
            setErrors(prev => ({ ...prev, colunas: false }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!nome.trim()) newErrors.nome = true;
        if (!tipo) newErrors.tipo = true;
        if (colunasSelecionadas.length === 0) newErrors.colunas = true;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.warning('Preencha todos os campos obrigatórios.');
            return;
        }

        setIsSubmitting(true);

        const body = {
            nome: nome.trim(),
            descricao: descricao.trim(),
            tipo,
            filtros: Object.keys(filtros).length > 0 ? filtros : {},
            colunas: colunasSelecionadas,
        };

        if (integracaoId) {
            body.integracao_id = Number(integracaoId);
        }

        try {
            const token = localStorage.getItem('authToken');
            const url = isEdicao
                ? `${API_BASE_URL}/relatorios/personalizados/${relatorioParaEditar.id}`
                : `${API_BASE_URL}/relatorios/personalizados`;
            const method = isEdicao ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (data.sucesso) {
                toast.success(isEdicao ? 'Relatório atualizado com sucesso!' : 'Relatório criado com sucesso!');
                if (onSaveSuccess) onSaveSuccess();
                onClose();
            } else {
                toast.error(data.mensagem || data.message || 'Erro ao salvar relatório.');
            }
        } catch (error) {
            console.error('Erro ao salvar relatório personalizado:', error);
            toast.error('Falha na comunicação com o servidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const colunasDoTipo = COLUNAS_DISPONIVEIS[tipo] || [];

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderLeft}>
                        <div className={styles.headerIcon}>
                            <FileText size={22} />
                        </div>
                        <div>
                            <h2 className={styles.modalTitle}>
                                {isEdicao ? 'Editar Relatório' : 'Novo Relatório Personalizado'}
                            </h2>
                            <p className={styles.modalSubtitle}>
                                {isEdicao ? 'Atualize as configurações do relatório' : 'Configure filtros e colunas para seu relatório'}
                            </p>
                        </div>
                    </div>
                    <button className={styles.btnClose} onClick={onClose} title="Fechar">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.modalBody}>
                    {/* Nome e Integração */}
                    <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                            <label>
                                Nome do Relatório <span className={styles.requiredAsterisk}>*</span>
                            </label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => { setNome(e.target.value); if (errors.nome) setErrors(p => ({...p, nome: false})); }}
                                placeholder="Ex: Produtos de Alto Custo"
                                className={errors.nome ? styles.errorBorder : ''}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Integração</label>
                            <select
                                value={integracaoId}
                                onChange={(e) => setIntegracaoId(e.target.value)}
                            >
                                <option value="">Todas as integrações</option>
                                {integracoes.map(integ => (
                                    <option key={integ.id} value={String(integ.id)}>{integ.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className={styles.inputGroup}>
                        <label>Descrição</label>
                        <textarea
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Descreva o propósito deste relatório..."
                            rows={3}
                        />
                    </div>

                    {/* Tipo */}
                    <div className={styles.inputGroup}>
                        <label>
                            Tipo do Relatório <span className={styles.requiredAsterisk}>*</span>
                        </label>
                        <div className={styles.tipoSelector}>
                            <button
                                type="button"
                                className={`${styles.tipoPill} ${tipo === 'produtos' ? styles.tipoPillActive : ''}`}
                                onClick={() => handleTipoChange('produtos')}
                            >
                                <Package size={18} />
                                Produtos
                            </button>
                            <button
                                type="button"
                                className={`${styles.tipoPill} ${tipo === 'pedidos' ? styles.tipoPillActive : ''}`}
                                onClick={() => handleTipoChange('pedidos')}
                            >
                                <ShoppingCart size={18} />
                                Pedidos
                            </button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className={styles.filtrosSection}>
                        <h4 className={styles.filtrosTitle}>
                            <Filter size={14} /> Filtros
                        </h4>
                        <div className={styles.filtrosGrid}>
                            {tipo === 'produtos' && (
                                <>
                                    <div className={styles.inputGroup}>
                                        <label>Preço Mínimo (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={filtros.precoMin || ''}
                                            onChange={(e) => handleFiltroChange('precoMin', e.target.value)}
                                            placeholder="0,00"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Preço Máximo (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={filtros.precoMax || ''}
                                            onChange={(e) => handleFiltroChange('precoMax', e.target.value)}
                                            placeholder="0,00"
                                        />
                                    </div>
                                </>
                            )}
                            {tipo === 'pedidos' && (
                                <>
                                    <div className={styles.inputGroup}>
                                        <label>Data Início</label>
                                        <input
                                            type="date"
                                            value={filtros.data_inicio || ''}
                                            onChange={(e) => handleFiltroChange('data_inicio', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Data Fim</label>
                                        <input
                                            type="date"
                                            value={filtros.data_fim || ''}
                                            onChange={(e) => handleFiltroChange('data_fim', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Colunas */}
                    <div className={styles.colunasSection}>
                        <h4 className={styles.colunasTitle}>
                            <Columns3 size={14} /> 
                            Colunas a Exibir <span className={styles.requiredAsterisk}>*</span>
                        </h4>
                        {errors.colunas && (
                            <p className={styles.errorText}>Selecione ao menos uma coluna.</p>
                        )}
                        <div className={styles.colunasGrid}>
                            {colunasDoTipo.map(col => {
                                const isChecked = colunasSelecionadas.includes(col.key);
                                return (
                                    <label
                                        key={col.key}
                                        className={`${styles.colunaCheckbox} ${isChecked ? styles.colunaCheckboxChecked : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleColunaToggle(col.key)}
                                        />
                                        {col.label}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </button>
                    <button className={styles.btnSave} onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className={styles.spin} />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                {isEdicao ? 'Atualizar Relatório' : 'Salvar Relatório'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
