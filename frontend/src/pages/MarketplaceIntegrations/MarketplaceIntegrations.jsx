import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, RefreshCw, X, Store, Tag } from 'lucide-react';
import styles from './MarketplaceIntegrations.module.css';
import { API_BASE_URL } from '../../api';
import { Loading } from '../../components/Loading';
import { toast } from 'react-toastify';
import { StatusIntegracao, Marketplace } from '../../utils/enums';


export function MarketplaceIntegrations() {

    const [integrations, setIntegrations] = useState([]);
    const [syncedIds, setSyncedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ marketplace: 'MERCADO_LIVRE', nome: '' });

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/integracoes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.sucesso) {
                setIntegrations(data.integracoes);
            } else {
                setIntegrations([]);
            }
        } catch (error) {
            console.error('Erro ao buscar integrações:', error);
            toast.error("Erro ao carregar integrações");
        } finally {
            setLoading(false);
        }
    };


    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ marketplace: 'MERCADO_LIVRE', nome: '' });
    };

    const openEditModal = (item) => {
        setFormData({ marketplace: item.marketplace, nome: item.nome });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleSync = (marketplace, id) => {
        if (marketplace == Marketplace.MERCADO_LIVRE) {
            localStorage.setItem('currentIntegrationId', id);
            const url = import.meta.env.VITE_ML_URL_AUTH;
            const width = 600;
            const height = 750;
            const left = (window.screen.width / 2) - (width / 2);
            const top = (window.screen.height / 2) - (height / 2);

            window.open(
                url, 
                'MLAuth', 
                `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,resizable=yes`
            );
            
        } else {
            toast.info("Sincronização não disponível para este marketplace no momento.");
        }
    };

    const salvarIntegracao = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const isEditing = !!editingId;
            const method = isEditing ? 'PUT' : 'POST';
            const bodyData = isEditing ? { ...formData, id: editingId } : formData;

            const response = await fetch(`${API_BASE_URL}/integracoes`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();
            
            if(!data.sucesso) {
                closeModal();
                toast.error(data.message || "Erro na operação");
                return;
            }

            closeModal();
            toast.success(isEditing ? "Integração atualizada com sucesso!" : "Integração cadastrada com sucesso!");
            fetchIntegrations();

        } catch (error) {
            console.error('Erro:', error);  
            toast.error("Erro ao salvar integração");
        }
    };

    const excluirIntegracao = async (id) => {
        if (!window.confirm("Tem certeza que deseja remover esta integração?")) return;
        
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/integracoes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if(!data.sucesso) {
                toast.error(data.message || "Erro ao remover integração");
                return;
            }

            toast.success("Integração removida com sucesso!");
            fetchIntegrations();
        } catch (error) {
            console.error('Erro:', error);  
            toast.error("Erro ao remover integração");
        }
    };

    const getStatus = (status, isSynced) => {
        if (isSynced) {
            return { statusClass: styles.statusAtivo, statusText: 'Ativo' };
        }

        switch (status) {
            case StatusIntegracao.ATIVO: 
                return { statusClass: styles.statusAtivo, statusText: 'Ativo' };
            case StatusIntegracao.INATIVO: 
                return { statusClass: styles.statusErro, statusText: 'Inativo' };
            case StatusIntegracao.PENDENTE: 
                return { statusClass: styles.statusPendente, statusText: 'Pendente' };
            case StatusIntegracao.EXCLUIDO: 
                return { statusClass: styles.statusExcluido || styles.statusErro, statusText: 'Excluído' };
            default:
                return { statusClass: styles.statusPendente, statusText: 'Pendente' };
        }
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.mainTitle}>Integração com Marketplaces</h1>
                    <p className={styles.subtitle}>Conecte e gerencie suas vendas em múltiplos canais de forma centralizada.</p>
                </div>
                <button className={styles.btnAdd} onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    <span>Adicionar Nova Integração</span>
                </button>
            </header>

            {loading ? (
                <Loading message="Carregando integrações..." />
            ) : integrations.length > 0 ? (
                <div className={styles.grid}>
                    {integrations.map((item) => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.cardTop}>
                                <div className={styles.brandInfo}>
                                    <div className={styles.logoBox}>
                                        {item.marketplace == Marketplace.MERCADO_LIVRE ? <img src={import.meta.env.VITE_BASE_URL_IMAGES + "/logo_ml.png"} alt="Mercado Livre" /> : '📦'}
                                    </div>
                                    <div>
                                        <h3>{item.nome}</h3>
                                        <span className={styles.typeTag}>
                                            {item.marketplace == Marketplace.MERCADO_LIVRE ? 'Mercado Livre' : item.marketplace}
                                        </span>
                                    </div>
                                </div>
                                {(() => {
                                    const { statusClass, statusText } = getStatus(item.ativo, syncedIds.includes(item.id));
                                    return (
                                        <span className={`${styles.statusBadge} ${statusClass}`}>
                                            <div className={styles.dot} /> {statusText}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div className={styles.cardActions}>
                                <button className={styles.actionBtn} onClick={() => openEditModal(item)}><Edit3 size={18} /><span>Editar</span></button>
                                <button className={styles.actionBtn} onClick={() => handleSync(item.marketplace, item.id)}><RefreshCw size={18} /><span>Sincronizar</span></button>
                                <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={() => excluirIntegracao(item.id)}><Trash2 size={18} /><span>Remover</span></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (

                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><RefreshCw size={48} /></div>
                    <h2>Nenhuma integração cadastrada</h2>
                    <p>Conecte seu primeiro marketplace para começar a sincronizar seu estoque e pedidos automaticamente.</p>
                    <button className={styles.btnAdd} onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Adicionar Integração
                    </button>
                </div>
            )}

            {/* Modal de Configuração */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h2>{editingId ? "Editar Integração" : "Nova Integração"}</h2>
                            <button className={styles.closeBtn} onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.inputGroup}>
                                <label><Store size={16} /> Marketplace</label>
                                <select 
                                    value={formData.marketplace}
                                    onChange={(e) => setFormData({...formData, marketplace: e.target.value})}
                                    disabled={!!editingId}
                                >
                                    <option value="MERCADO_LIVRE">Mercado Livre</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label><Tag size={16} /> Nome da Integração</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Loja Principal, Filial..."
                                    value={formData.nome}
                                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
                            <button className={styles.btnSubmit} onClick={salvarIntegracao} disabled={!formData.nome.trim()} >Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
