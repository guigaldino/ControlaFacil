import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './Relatorios.module.css';
import {
    DollarSign, TrendingUp, Package, Users, ShoppingCart, Store,
    ChevronDown, BarChart3, PieChart, Table2, Loader2, Plus,
    Play, Pencil, Trash2, ArrowLeft, FileText, AlertTriangle,
    Calendar, LayoutDashboard, FileBarChart
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Loading } from '../../components/Loading';
import { ModalRelatorioPersonalizado } from '../../components/ModalRelatorioPersonalizado';
import { ModalConfirmacao } from '../../components/ModalConfirmacao';
import { API_BASE_URL } from '../../api';
import { toast } from 'react-toastify';

// ========== Paleta de cores para gráficos ==========
const CHART_COLORS = ['#5FC16C', '#4f46e5', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatNumber = (value) => {
    return Number(value || 0).toLocaleString('pt-BR');
};

// ========== Custom Tooltip ==========
function CustomTooltip({ active, payload, label, isCurrency = false }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
            padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0C3447', fontSize: '0.88rem' }}>{label}</p>
            {payload.map((entry, index) => (
                <p key={index} style={{ margin: '2px 0', color: entry.color, fontSize: '0.84rem', fontWeight: 600 }}>
                    {entry.name}: {isCurrency ? formatCurrency(entry.value) : formatNumber(entry.value)}
                </p>
            ))}
        </div>
    );
}

// ========== Chart Render Component ==========
function ChartRenderer({ data, type, dataKeys, nameKey = 'name', isCurrency = false }) {
    if (!data || data.length === 0) {
        return (
            <div className={styles.noDataChart}>
                <BarChart3 size={48} />
                <span>Sem dados para exibir</span>
            </div>
        );
    }

    const tickStyle = { fontSize: 12, fontWeight: 600, fill: '#94a3b8' };

    if (type === 'table') {
        const allKeys = dataKeys.length > 0 ? [nameKey, ...dataKeys.map(dk => dk.key)] : Object.keys(data[0]);
        return (
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            {allKeys.map(key => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx}>
                                {allKeys.map(key => (
                                    <td key={key}>
                                        {typeof row[key] === 'number'
                                            ? (isCurrency && key !== nameKey ? formatCurrency(row[key]) : formatNumber(row[key]))
                                            : (row[key] ?? '—')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (type === 'pie') {
        const pieKey = dataKeys[0]?.key || 'value';
        return (
            <ResponsiveContainer width="100%" height={340}>
                <RechartsPie>
                    <Pie
                        data={data}
                        dataKey={pieKey}
                        nameKey={nameKey}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        paddingAngle={3}
                        stroke="none"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={true}
                    >
                        {data.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: '0.82rem', fontWeight: 600, paddingTop: 10 }}
                    />
                </RechartsPie>
            </ResponsiveContainer>
        );
    }

    if (type === 'line') {
        return (
            <ResponsiveContainer width="100%" height={340}>
                <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey={nameKey} tick={tickStyle} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '0.82rem', fontWeight: 600 }} />
                    {dataKeys.map((dk, i) => (
                        <Line
                            key={dk.key}
                            type="monotone"
                            dataKey={dk.key}
                            name={dk.label}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={3}
                            dot={{ r: 5, fill: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 0 }}
                            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        );
    }

    // Default: bar chart
    return (
        <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={nameKey} tick={tickStyle} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.82rem', fontWeight: 600 }} />
                {dataKeys.map((dk, i) => (
                    <Bar
                        key={dk.key}
                        dataKey={dk.key}
                        name={dk.label}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}

// ========== Visualization Toolbar ==========
function VizToolbar({ current, onChange }) {
    const options = [
        { key: 'bar', icon: BarChart3, label: 'Gráfico de Barras' },
        { key: 'line', icon: TrendingUp, label: 'Gráfico de Linhas' },
        { key: 'pie', icon: PieChart, label: 'Gráfico de Pizza' },
        { key: 'table', icon: Table2, label: 'Tabela' },
    ];
    return (
        <div className={styles.vizToolbar}>
            {options.map(opt => {
                const Icon = opt.icon;
                return (
                    <button
                        key={opt.key}
                        className={`${styles.vizBtn} ${current === opt.key ? styles.vizBtnActive : ''}`}
                        onClick={() => onChange(opt.key)}
                        title={opt.label}
                    >
                        <Icon size={16} />
                    </button>
                );
            })}
        </div>
    );
}

// ========== MAIN COMPONENT ==========
export function Relatorios() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [integracoes, setIntegracoes] = useState([]);
    const [integracaoSelecionada, setIntegracaoSelecionada] = useState('');

    // Dashboard state
    const [dashboardData, setDashboardData] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    // Pre-defined reports state
    const [produtosData, setProdutosData] = useState(null);
    const [pedidosData, setPedidosData] = useState(null);
    const [clientesData, setClientesData] = useState(null);
    const [loadingPredefinidos, setLoadingPredefinidos] = useState({});

    // Date filters for pedidos pre-defined
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    // Viz types for each predefined report
    const [vizProdutosVendidos, setVizProdutosVendidos] = useState('bar');
    const [vizVendasPeriodo, setVizVendasPeriodo] = useState('line');
    const [vizVendasIntegracao, setVizVendasIntegracao] = useState('pie');
    const [vizClientes, setVizClientes] = useState('bar');

    // Custom reports state
    const [relatoriosPersonalizados, setRelatoriosPersonalizados] = useState([]);
    const [loadingPersonalizados, setLoadingPersonalizados] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [relatorioParaEditar, setRelatorioParaEditar] = useState(null);

    // Delete confirmation modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [relatorioParaExcluir, setRelatorioParaExcluir] = useState(null);

    // Executed report
    const [executedReport, setExecutedReport] = useState(null);
    const [loadingExecucao, setLoadingExecucao] = useState(false);
    const [vizExecutado, setVizExecutado] = useState('table');

    // ===== Auth Header helper =====
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('authToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }, []);

    // ===== Fetch Integrations =====
    useEffect(() => {
        const fetchIntegracoes = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${API_BASE_URL}/integracoes`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (data.sucesso) {
                    setIntegracoes(data.integracoes || []);
                }
            } catch (error) {
                console.error('Erro ao buscar integrações:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchIntegracoes();
    }, []);

    // ===== Fetch Dashboard =====
    const fetchDashboard = useCallback(async () => {
        setLoadingDashboard(true);
        try {
            const token = localStorage.getItem('authToken');
            let url = `${API_BASE_URL}/relatorios/dashboard`;
            if (integracaoSelecionada) url += `?integracao_id=${integracaoSelecionada}`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.sucesso) {
                setDashboardData(data.data);
            } else {
                setDashboardData(null);
            }
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            toast.error('Erro ao carregar métricas do dashboard.');
        } finally {
            setLoadingDashboard(false);
        }
    }, [integracaoSelecionada]);

    // ===== Fetch Pre-defined Report =====
    const fetchPredefinido = useCallback(async (tipo) => {
        setLoadingPredefinidos(prev => ({ ...prev, [tipo]: true }));
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams();
            if (integracaoSelecionada) params.append('integracao_id', integracaoSelecionada);
            if (tipo === 'pedidos') {
                if (dataInicio) params.append('data_inicio', dataInicio);
                if (dataFim) params.append('data_fim', dataFim);
            }
            const query = params.toString() ? `?${params.toString()}` : '';
            const response = await fetch(`${API_BASE_URL}/relatorios/predefinido/${tipo}${query}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.sucesso) {
                if (tipo === 'produtos') setProdutosData(data.data);
                else if (tipo === 'pedidos') setPedidosData(data.data);
                else if (tipo === 'clientes') setClientesData(data.data);
            }
        } catch (error) {
            console.error(`Erro ao carregar relatório ${tipo}:`, error);
        } finally {
            setLoadingPredefinidos(prev => ({ ...prev, [tipo]: false }));
        }
    }, [integracaoSelecionada, dataInicio, dataFim]);

    // ===== Load dashboard tab data =====
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboard();
            fetchPredefinido('produtos');
            fetchPredefinido('pedidos');
            fetchPredefinido('clientes');
        }
    }, [activeTab, fetchDashboard, fetchPredefinido]);

    // ===== Fetch Custom Reports =====
    const fetchPersonalizados = useCallback(async () => {
        setLoadingPersonalizados(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/relatorios/personalizados`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.sucesso) {
                setRelatoriosPersonalizados(data.data || []);
            }
        } catch (error) {
            console.error('Erro ao buscar relatórios personalizados:', error);
            toast.error('Erro ao carregar relatórios personalizados.');
        } finally {
            setLoadingPersonalizados(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'personalizados') {
            fetchPersonalizados();
        }
    }, [activeTab, fetchPersonalizados]);

    // ===== Execute Custom Report =====
    const handleExecutar = async (id) => {
        setLoadingExecucao(true);
        setExecutedReport(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/relatorios/personalizados/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.sucesso !== false) {
                setExecutedReport({
                    relatorio: data.relatorio,
                    data: data.data || [],
                });
                setVizExecutado('table');
            } else {
                toast.error(data.mensagem || 'Erro ao executar relatório.');
            }
        } catch (error) {
            console.error('Erro ao executar relatório:', error);
            toast.error('Falha ao executar relatório personalizado.');
        } finally {
            setLoadingExecucao(false);
        }
    };

    // ===== Delete Custom Report =====
    const handleConfirmDelete = async () => {
        if (!relatorioParaExcluir) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/relatorios/personalizados/${relatorioParaExcluir.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.sucesso) {
                toast.success('Relatório excluído com sucesso!');
                fetchPersonalizados();
            } else {
                toast.error(data.mensagem || 'Erro ao excluir relatório.');
            }
        } catch (error) {
            console.error('Erro ao excluir relatório:', error);
            toast.error('Falha na comunicação com o servidor.');
        } finally {
            setDeleteModalOpen(false);
            setRelatorioParaExcluir(null);
        }
    };

    // ===== Computed chart data =====
    const produtosVendidosChart = useMemo(() => {
        if (!produtosData?.produtosMaisVendidos) return [];
        return produtosData.produtosMaisVendidos.map(p => ({
            name: p.nome?.length > 20 ? p.nome.substring(0, 20) + '...' : p.nome,
            totalVendido: p.totalVendido,
            faturamento: p.faturamentoProduto,
        }));
    }, [produtosData]);

    const vendasPeriodoChart = useMemo(() => {
        if (!pedidosData?.vendasPeriodo) return [];
        return pedidosData.vendasPeriodo.map(v => ({
            name: new Date(v.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            faturamento: v.faturamento,
            totalPedidos: v.totalPedidos,
        }));
    }, [pedidosData]);

    const vendasIntegracaoChart = useMemo(() => {
        if (!pedidosData?.vendasPorIntegracao) return [];
        return pedidosData.vendasPorIntegracao.map(v => ({
            name: v.integracao_nome,
            faturamento: v.faturamento,
            totalPedidos: v.totalPedidos,
        }));
    }, [pedidosData]);

    const clientesChart = useMemo(() => {
        if (!clientesData || !Array.isArray(clientesData)) return [];
        return clientesData.map(c => ({
            name: c.apelido_comprador || c.nome_completo_comprador || c.id_comprador_ml,
            totalPedidos: c.totalPedidos,
            totalGasto: c.totalGasto,
        }));
    }, [clientesData]);

    // ===== Executed report chart data =====
    const executedChartConfig = useMemo(() => {
        if (!executedReport || !executedReport.data || executedReport.data.length === 0) {
            return { data: [], dataKeys: [], nameKey: 'name', isCurrency: false };
        }
        const colunas = executedReport.relatorio?.colunas || [];
        const tipo = executedReport.relatorio?.tipo;
        const rows = executedReport.data;

        // Determine the name key (first string column) and data keys (numeric columns)
        const allKeys = colunas.length > 0 ? colunas : Object.keys(rows[0]);
        let nameKey = allKeys[0];
        const dataKeys = [];
        const hasCurrency = tipo === 'pedidos' || allKeys.includes('preco') || allKeys.includes('total');

        allKeys.forEach(key => {
            const sampleValue = rows[0]?.[key];
            if (typeof sampleValue === 'number' && key !== nameKey) {
                const isCurrencyKey = ['preco', 'total', 'faturamento', 'totalGasto', 'faturamentoProduto'].includes(key);
                dataKeys.push({
                    key,
                    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    isCurrency: isCurrencyKey,
                });
            }
        });

        const chartData = rows.map(row => {
            const item = { name: row[nameKey] ?? '—' };
            dataKeys.forEach(dk => {
                item[dk.key] = row[dk.key] ?? 0;
            });
            return item;
        });

        return { data: chartData, dataKeys, nameKey: 'name', isCurrency: hasCurrency };
    }, [executedReport]);

    // ========== RENDER ==========
    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.pageTitle}>Relatórios e Análises</h1>
                    <p className={styles.subtitle}>Visualize métricas de desempenho e crescimento do seu negócio.</p>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className={styles.tabNav}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'dashboard' ? styles.tabBtnActive : ''}`}
                    onClick={() => { setActiveTab('dashboard'); setExecutedReport(null); }}
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'personalizados' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('personalizados')}
                >
                    <FileBarChart size={18} />
                    Relatórios Personalizados
                </button>
            </div>

            {/* ==================== DASHBOARD TAB ==================== */}
            {activeTab === 'dashboard' && (
                <>
                    {/* Controls */}
                    <div className={styles.topControls}>
                        <div className={styles.integracaoSelectWrapper}>
                            <Store size={18} className={styles.integracaoIcon} />
                            <select
                                id="select-integracao-relatorios"
                                className={styles.integracaoSelect}
                                value={integracaoSelecionada}
                                onChange={(e) => setIntegracaoSelecionada(e.target.value)}
                            >
                                <option value="">Todas as Integrações</option>
                                {integracoes.map(integ => (
                                    <option key={integ.id} value={String(integ.id)}>{integ.nome}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className={styles.selectArrow} />
                        </div>

                        <div className={styles.dateFilterWrapper}>
                            <Calendar size={16} style={{ color: '#94a3b8' }} />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                title="Data início (Pedidos)"
                            />
                            <span className={styles.dateSeparator}>até</span>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                title="Data fim (Pedidos)"
                            />
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
                                <DollarSign size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>Faturamento Total</h3>
                                {loadingDashboard ? (
                                    <div className={styles.statSkeleton} />
                                ) : (
                                    <p>{formatCurrency(dashboardData?.faturamentoTotal)}</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                                <ShoppingCart size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>Total de Pedidos</h3>
                                {loadingDashboard ? (
                                    <div className={styles.statSkeleton} />
                                ) : (
                                    <p>{formatNumber(dashboardData?.totalPedidosPaid)}</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>Ticket Médio</h3>
                                {loadingDashboard ? (
                                    <div className={styles.statSkeleton} />
                                ) : (
                                    <p>{formatCurrency(dashboardData?.ticketMedio)}</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                <Package size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>Produtos Ativos</h3>
                                {loadingDashboard ? (
                                    <div className={styles.statSkeleton} />
                                ) : (
                                    <p>{formatNumber(dashboardData?.totalProdutosAtivos)}</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#dc2626' }}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>Estoque Crítico</h3>
                                {loadingDashboard ? (
                                    <div className={styles.statSkeleton} />
                                ) : (
                                    <p>{formatNumber(dashboardData?.produtosEstoqueCritico)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== Pre-defined: Produtos Mais Vendidos ===== */}
                    <div className={styles.reportSection}>
                        <div className={styles.reportSectionHeader}>
                            <h3 className={styles.reportSectionTitle}>
                                <span className={`${styles.reportTypeBadge} ${styles.badgeProdutos}`}>Produtos</span>
                                Produtos Mais Vendidos
                            </h3>
                            <VizToolbar current={vizProdutosVendidos} onChange={setVizProdutosVendidos} />
                        </div>
                        {produtosData?.resumoEstoque && (
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 20px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Valor Total em Estoque</span>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0C3447', margin: '4px 0 0' }}>
                                        {formatCurrency(produtosData.resumoEstoque.valorTotalEstoque)}
                                    </p>
                                </div>
                                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 20px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Itens em Estoque</span>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0C3447', margin: '4px 0 0' }}>
                                        {formatNumber(produtosData.resumoEstoque.totalItensEstoque)}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className={styles.chartContainer}>
                            {loadingPredefinidos.produtos ? (
                                <Loading message="Carregando dados de produtos..." />
                            ) : (
                                <ChartRenderer
                                    data={produtosVendidosChart}
                                    type={vizProdutosVendidos}
                                    dataKeys={[
                                        { key: 'totalVendido', label: 'Qtd. Vendida' },
                                        { key: 'faturamento', label: 'Faturamento' },
                                    ]}
                                    isCurrency={false}
                                />
                            )}
                        </div>
                    </div>

                    {/* ===== Pre-defined: Vendas por Período ===== */}
                    <div className={styles.reportSection}>
                        <div className={styles.reportSectionHeader}>
                            <h3 className={styles.reportSectionTitle}>
                                <span className={`${styles.reportTypeBadge} ${styles.badgePedidos}`}>Pedidos</span>
                                Vendas por Período
                            </h3>
                            <VizToolbar current={vizVendasPeriodo} onChange={setVizVendasPeriodo} />
                        </div>
                        <div className={styles.chartContainer}>
                            {loadingPredefinidos.pedidos ? (
                                <Loading message="Carregando dados de pedidos..." />
                            ) : (
                                <ChartRenderer
                                    data={vendasPeriodoChart}
                                    type={vizVendasPeriodo}
                                    dataKeys={[
                                        { key: 'faturamento', label: 'Faturamento' },
                                        { key: 'totalPedidos', label: 'Total Pedidos' },
                                    ]}
                                    isCurrency={true}
                                />
                            )}
                        </div>
                    </div>

                    {/* ===== Pre-defined: Vendas por Integração ===== */}
                    <div className={styles.reportSection}>
                        <div className={styles.reportSectionHeader}>
                            <h3 className={styles.reportSectionTitle}>
                                <span className={`${styles.reportTypeBadge} ${styles.badgePedidos}`}>Pedidos</span>
                                Vendas por Integração
                            </h3>
                            <VizToolbar current={vizVendasIntegracao} onChange={setVizVendasIntegracao} />
                        </div>
                        <div className={styles.chartContainer}>
                            {loadingPredefinidos.pedidos ? (
                                <Loading message="Carregando dados de vendas..." />
                            ) : (
                                <ChartRenderer
                                    data={vendasIntegracaoChart}
                                    type={vizVendasIntegracao}
                                    dataKeys={[
                                        { key: 'faturamento', label: 'Faturamento' },
                                        { key: 'totalPedidos', label: 'Total Pedidos' },
                                    ]}
                                    isCurrency={true}
                                />
                            )}
                        </div>
                    </div>

                    {/* ===== Pre-defined: Clientes ===== */}
                    <div className={styles.reportSection}>
                        <div className={styles.reportSectionHeader}>
                            <h3 className={styles.reportSectionTitle}>
                                <span className={`${styles.reportTypeBadge} ${styles.badgeClientes}`}>Clientes</span>
                                Principais Clientes
                            </h3>
                            <VizToolbar current={vizClientes} onChange={setVizClientes} />
                        </div>
                        <div className={styles.chartContainer}>
                            {loadingPredefinidos.clientes ? (
                                <Loading message="Carregando dados de clientes..." />
                            ) : (
                                <ChartRenderer
                                    data={clientesChart}
                                    type={vizClientes}
                                    dataKeys={[
                                        { key: 'totalPedidos', label: 'Total Pedidos' },
                                        { key: 'totalGasto', label: 'Total Gasto' },
                                    ]}
                                    isCurrency={false}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ==================== PERSONALIZADOS TAB ==================== */}
            {activeTab === 'personalizados' && (
                <div className={styles.personalSection}>
                    {/* Show executed report OR list */}
                    {loadingExecucao ? (
                        <div className={styles.loadingContainer}>
                            <Loader2 size={40} className={styles.spin} />
                            <p>Executando relatório...</p>
                        </div>
                    ) : executedReport ? (
                        <div className={styles.executedReport}>
                            <div className={styles.executedHeader}>
                                <div>
                                    <h3 className={styles.executedTitle}>
                                        <FileText size={20} />
                                        {executedReport.relatorio?.nome || 'Relatório Executado'}
                                        <span className={`${styles.reportTypeBadge} ${executedReport.relatorio?.tipo === 'produtos' ? styles.badgeProdutos : styles.badgePedidos}`}>
                                            {executedReport.relatorio?.tipo}
                                        </span>
                                    </h3>
                                    {executedReport.relatorio?.descricao && (
                                        <p className={styles.executedDesc}>{executedReport.relatorio.descricao}</p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <VizToolbar current={vizExecutado} onChange={setVizExecutado} />
                                    <button
                                        className={styles.btnVoltarLista}
                                        onClick={() => setExecutedReport(null)}
                                    >
                                        <ArrowLeft size={16} />
                                        Voltar
                                    </button>
                                </div>
                            </div>

                            <div className={styles.chartContainer}>
                                {vizExecutado === 'table' ? (
                                    <div style={{ width: '100%' }}>
                                        {executedReport.data.length === 0 ? (
                                            <div className={styles.noDataChart}>
                                                <FileText size={48} />
                                                <span>Nenhum registro encontrado para este relatório</span>
                                            </div>
                                        ) : (
                                            <div className={styles.tableWrapper}>
                                                <table className={styles.dataTable}>
                                                    <thead>
                                                        <tr>
                                                            {(executedReport.relatorio?.colunas || Object.keys(executedReport.data[0])).map(col => (
                                                                <th key={col}>{col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {executedReport.data.map((row, idx) => (
                                                            <tr key={idx}>
                                                                {(executedReport.relatorio?.colunas || Object.keys(row)).map(col => (
                                                                    <td key={col}>
                                                                        {typeof row[col] === 'number'
                                                                            ? (['preco', 'total', 'faturamento'].includes(col)
                                                                                ? formatCurrency(row[col])
                                                                                : formatNumber(row[col]))
                                                                            : (row[col] ?? '—')}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <ChartRenderer
                                        data={executedChartConfig.data}
                                        type={vizExecutado}
                                        dataKeys={executedChartConfig.dataKeys}
                                        isCurrency={executedChartConfig.isCurrency}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* List Header */}
                            <div className={styles.personalHeader}>
                                <h3 className={styles.personalTitle}>
                                    Seus Relatórios
                                    <span className={styles.personalCount}>
                                        {relatoriosPersonalizados.length} {relatoriosPersonalizados.length === 1 ? 'relatório' : 'relatórios'}
                                    </span>
                                </h3>
                                <button
                                    className={styles.btnNovo}
                                    onClick={() => { setRelatorioParaEditar(null); setIsModalOpen(true); }}
                                >
                                    <Plus size={18} />
                                    Novo Relatório
                                </button>
                            </div>

                            {loadingPersonalizados ? (
                                <div className={styles.loadingContainer}>
                                    <Loader2 size={40} className={styles.spin} />
                                    <p>Carregando relatórios...</p>
                                </div>
                            ) : relatoriosPersonalizados.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <FileBarChart size={44} />
                                    </div>
                                    <h2>Nenhum relatório salvo</h2>
                                    <p>Crie seu primeiro relatório personalizado para visualizar dados filtrados do seu negócio.</p>
                                    <button
                                        className={styles.btnNovo}
                                        onClick={() => { setRelatorioParaEditar(null); setIsModalOpen(true); }}
                                        style={{ marginTop: '8px' }}
                                    >
                                        <Plus size={18} />
                                        Criar Primeiro Relatório
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.relatoriosGrid}>
                                    {relatoriosPersonalizados.map(rel => (
                                        <div key={rel.id} className={styles.relatorioCard}>
                                            <div className={styles.relatorioCardHeader}>
                                                <div className={styles.relatorioCardIcon} style={{
                                                    background: rel.tipo === 'produtos' ? '#fef3c7' : '#e0e7ff',
                                                    color: rel.tipo === 'produtos' ? '#d97706' : '#4f46e5',
                                                }}>
                                                    {rel.tipo === 'produtos' ? <Package size={20} /> : <ShoppingCart size={20} />}
                                                </div>
                                                <div className={styles.relatorioCardInfo}>
                                                    <h4 className={styles.relatorioCardNome}>{rel.nome}</h4>
                                                    <p className={styles.relatorioCardDesc}>
                                                        {rel.descricao || 'Sem descrição'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={styles.relatorioCardMeta}>
                                                <span className={styles.metaTag} style={{
                                                    background: rel.tipo === 'produtos' ? '#fef3c7' : '#e0e7ff',
                                                    color: rel.tipo === 'produtos' ? '#92400e' : '#3730a3',
                                                }}>
                                                    {rel.tipo === 'produtos' ? <Package size={12} /> : <ShoppingCart size={12} />}
                                                    {rel.tipo}
                                                </span>
                                                {rel.integracao_nome && (
                                                    <span className={styles.metaTag} style={{ background: '#f0fdf4', color: '#166534' }}>
                                                        <Store size={12} />
                                                        {rel.integracao_nome}
                                                    </span>
                                                )}
                                                <span className={styles.metaTag} style={{ background: '#f8fafc', color: '#64748b' }}>
                                                    <Calendar size={12} />
                                                    {new Date(rel.data_criacao).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>

                                            <div className={styles.relatorioCardActions}>
                                                <button
                                                    className={`${styles.btnAction} ${styles.btnExecutar}`}
                                                    onClick={() => handleExecutar(rel.id)}
                                                >
                                                    <Play size={14} />
                                                    Executar
                                                </button>
                                                <button
                                                    className={`${styles.btnAction} ${styles.btnEditar}`}
                                                    onClick={() => { setRelatorioParaEditar(rel); setIsModalOpen(true); }}
                                                >
                                                    <Pencil size={14} />
                                                    Editar
                                                </button>
                                                <button
                                                    className={`${styles.btnAction} ${styles.btnExcluir}`}
                                                    onClick={() => { setRelatorioParaExcluir(rel); setDeleteModalOpen(true); }}
                                                >
                                                    <Trash2 size={14} />
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ===== Modal CRUD ===== */}
            <ModalRelatorioPersonalizado
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setRelatorioParaEditar(null); }}
                onSaveSuccess={fetchPersonalizados}
                relatorioParaEditar={relatorioParaEditar}
                integracoes={integracoes}
            />

            {/* ===== Modal Confirmação Exclusão ===== */}
            <ModalConfirmacao
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setRelatorioParaExcluir(null); }}
                onConfirm={handleConfirmDelete}
                title="Excluir Relatório?"
                message={`Tem certeza que deseja excluir o relatório "${relatorioParaExcluir?.nome}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                btnConfirmText="Sim, Excluir"
            />
        </div>
    );
}
