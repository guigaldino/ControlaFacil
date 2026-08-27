import React, { useState, useEffect, useMemo } from 'react';
import styles from './Pedidos.module.css';
import { ShoppingCart, Clock, CheckCircle, Truck, Eye, Store, ChevronDown, Search, X } from 'lucide-react';
import { Loading } from '../../components/Loading';
import { ModalDetalhePedido } from '../../components/ModalDetalhePedido';
import { API_BASE_URL } from '../../api';
import { toast } from 'react-toastify';

const mapStatus = (status) => {
  if (!status) return '';
  const s = status.toLowerCase();
  if (['pending', 'confirmed', 'payment_required', 'payment_in_process', 'partially_paid', 'pendente'].includes(s)) {
    return 'Pendente';
  }
  if (['paid', 'pago', 'em separação', 'em separacao'].includes(s)) {
    return 'Em Separação';
  }
  if (['shipped', 'enviado', 'sent'].includes(s)) {
    return 'Enviado';
  }
  if (['delivered', 'entregue'].includes(s)) {
    return 'Entregue';
  }
  if (['cancelled', 'cancelado'].includes(s)) {
    return 'Cancelado';
  }
  return status;
};

function getStatusStyle(status) {
  const mapped = mapStatus(status);
  switch (mapped) {
    case 'Pendente': return styles.statusPendente;
    case 'Em Separação': return styles.statusSeparacao;
    case 'Enviado': return styles.statusEnviado;
    case 'Entregue': return styles.statusEntregue;
    case 'Cancelado': return styles.statusCancelado;
    default: return '';
  }
}

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [integracoes, setIntegracoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [integracaoSelecionada, setIntegracaoSelecionada] = useState('todas');
  const [statusFiltro, setStatusFiltro] = useState(null);
  const [busca, setBusca] = useState('');

  // Dropdown de Exportação
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Modal de Detalhes
  const [pedidoIdSelecionado, setPedidoIdSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carregar Integrações
  useEffect(() => {
    const fetchIntegracoes = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/integracoes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.sucesso) {
          setIntegracoes(data.integracoes || []);
        }
      } catch (error) {
        console.error('Erro ao buscar integrações:', error);
      }
    };

    fetchIntegracoes();
  }, []);

  // Carregar Pedidos
  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/pedidos?limite=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.sucesso) {
        setPedidos(data.pedidos || []);
      } else {
        setPedidos([]);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos do sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    if (!isExportDropdownOpen) return;
    const handleOutsideClick = () => setIsExportDropdownOpen(false);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isExportDropdownOpen]);

  // Filtrar pedidos por integração para calcular as estatísticas contextuais
  const pedidosPorIntegracao = useMemo(() => {
    if (integracaoSelecionada === 'todas') {
      return pedidos;
    }
    return pedidos.filter(p => String(p.integracao_id) === String(integracaoSelecionada));
  }, [pedidos, integracaoSelecionada]);

  // Estatísticas Dinâmicas baseadas na integração selecionada
  const stats = useMemo(() => {
    let pendentes = 0;
    let separacao = 0;
    let enviados = 0;
    let entregues = 0;

    pedidosPorIntegracao.forEach((p) => {
      const statusMapped = mapStatus(p.status_pedido);
      if (statusMapped === 'Pendente') pendentes++;
      else if (statusMapped === 'Em Separação') separacao++;
      else if (statusMapped === 'Enviado') enviados++;
      else if (statusMapped === 'Entregue') entregues++;
    });

    return { pendentes, separacao, enviados, entregues };
  }, [pedidosPorIntegracao]);

  // Pedidos finais exibidos na tabela após aplicar busca e status dos cards
  const pedidosExibidos = useMemo(() => {
    let lista = [...pedidosPorIntegracao];

    // Filtro do card de status
    if (statusFiltro) {
      lista = lista.filter(p => mapStatus(p.status_pedido) === statusFiltro);
    }

    // Busca textual
    if (busca.trim()) {
      const query = busca.toLowerCase().trim();
      lista = lista.filter((p) => {
        const idText = String(p.id);
        const meliIdText = p.id_pedido_ml ? String(p.id_pedido_ml).toLowerCase() : '';
        const compradorText = p.nome_completo_comprador ? p.nome_completo_comprador.toLowerCase() : '';
        const compradorApelido = p.apelido_comprador ? p.apelido_comprador.toLowerCase() : '';
        return (
          idText.includes(query) ||
          meliIdText.includes(query) ||
          compradorText.includes(query) ||
          compradorApelido.includes(query)
        );
      });
    }

    return lista;
  }, [pedidosPorIntegracao, statusFiltro, busca]);

  const handleToggleStatusFilter = (status) => {
    if (statusFiltro === status) {
      setStatusFiltro(null); // remove filtro se clicar de novo
    } else {
      setStatusFiltro(status); // ativa filtro
    }
  };

  const handleAbrirDetalhes = (pedidoId) => {
    setPedidoIdSelecionado(pedidoId);
    setIsModalOpen(true);
  };

  const handleLimparFiltroStatus = () => {
    setStatusFiltro(null);
  };

  const toggleExportDropdown = (e) => {
    e.stopPropagation();
    setIsExportDropdownOpen(!isExportDropdownOpen);
  };

  // Exportar dados filtrados para CSV
  const handleExportCSV = () => {
    if (pedidosExibidos.length === 0) {
      toast.warning("Nenhum pedido para exportar.");
      return;
    }

    const headers = ["ID Pedido", "ID Mercado Livre", "Comprador", "Data", "Valor Total", "Status"];
    const rows = pedidosExibidos.map(p => [
      p.id,
      p.id_pedido_ml || "—",
      p.nome_completo_comprador || p.apelido_comprador || "—",
      new Date(p.data_pedido).toLocaleDateString('pt-BR'),
      p.total.toFixed(2).replace('.', ','),
      mapStatus(p.status_pedido)
    ]);

    const csvString = [headers.join(";"), ...rows.map(e => e.join(";"))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_pedidos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  };

  // Exportar/Imprimir dados filtrados em PDF
  const handleExportPDF = () => {
    if (pedidosExibidos.length === 0) {
      toast.warning("Nenhum pedido para imprimir.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Por favor, permita pop-ups para imprimir o relatório.");
      return;
    }

    const integracaoNome = integracaoSelecionada === 'todas' 
      ? 'Todas as Integrações' 
      : integracoes.find(i => String(i.id) === String(integracaoSelecionada))?.nome || '';

    const htmlContent = `
      <html>
        <head>
          <title>Relatório de Pedidos - Controla Fácil</title>
          <style>
            body { font-family: sans-serif; color: #333; padding: 20px; }
            h1 { color: #0C3447; font-size: 24px; margin-bottom: 5px; }
            p { font-size: 14px; color: #64748b; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 13px; }
            th { background-color: #f8fafc; color: #0C3447; font-weight: bold; }
            .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; display: inline-block; }
            .pendente { background: #fffbeb; color: #d97706; }
            .pago { background: #e8f5e9; color: #2ecc71; }
            .cancelado { background: #fef2f2; color: #ef4444; }
            .enviado { background: #e0f2fe; color: #0284c7; }
            .entregue { background: #ecfdf5; color: #10b981; }
            .header-info { display: flex; justify-content: space-between; border-bottom: 2px solid #0C3447; padding-bottom: 15px; }
            .total-box { margin-top: 30px; text-align: right; font-size: 16px; font-weight: bold; color: #0C3447; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <div>
              <h1>Relatório de Pedidos</h1>
              <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            <div style="text-align: right;">
              <h3 style="color: #5FC16C; margin: 0;">Controla Fácil</h3>
              <span style="font-size: 12px; color: #64748b;">Integração: ${integracaoNome}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>ID Mercado Livre</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${pedidosExibidos.map(p => `
                <tr>
                  <td><strong>#${p.id}</strong></td>
                  <td>${p.id_pedido_ml || '—'}</td>
                  <td>${p.nome_completo_comprador || p.apelido_comprador || '—'}</td>
                  <td>${new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                  <td>R$ ${p.total.toFixed(2).replace('.', ',')}</td>
                  <td>
                    <span class="badge ${mapStatus(p.status_pedido).toLowerCase().replace('em separação', 'pago').replace('separacao', 'pago')}">
                      ${mapStatus(p.status_pedido)}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-box">
            <span>Total dos Pedidos Filtrados: R$ ${pedidosExibidos.reduce((acc, p) => acc + p.total, 0).toFixed(2).replace('.', ',')}</span>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Controle de Pedidos</h1>
          <p className={styles.subtitle}>Acompanhe o status e fluxo dos seus pedidos integrados.</p>
        </div>
      </header>

      {/* Cards de Estatísticas Interactivos */}
      <div className={styles.statsGrid}>
        <div 
          className={`${styles.statCard} ${statusFiltro === 'Pendente' ? styles.statCardActive : ''}`}
          onClick={() => handleToggleStatusFilter('Pendente')}
          title="Filtrar por Pedidos Pendentes"
        >
          <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={24} /></div>
          <div className={styles.statInfo}>
            <h3>Pendentes</h3>
            <p>{stats.pendentes}</p>
          </div>
        </div>
        <div 
          className={`${styles.statCard} ${statusFiltro === 'Em Separação' ? styles.statCardActive : ''}`}
          onClick={() => handleToggleStatusFilter('Em Separação')}
          title="Filtrar por Pedidos Em Separação"
        >
          <div className={styles.statIcon} style={{ background: '#e0e7ff', color: '#4f46e5' }}><ShoppingCart size={24} /></div>
          <div className={styles.statInfo}>
            <h3>Em Separação</h3>
            <p>{stats.separacao}</p>
          </div>
        </div>
        <div 
          className={`${styles.statCard} ${statusFiltro === 'Enviado' ? styles.statCardActive : ''}`}
          onClick={() => handleToggleStatusFilter('Enviado')}
          title="Filtrar por Pedidos Enviados"
        >
          <div className={styles.statIcon} style={{ background: '#dbeafe', color: '#2563eb' }}><Truck size={24} /></div>
          <div className={styles.statInfo}>
            <h3>Enviados</h3>
            <p>{stats.enviados}</p>
          </div>
        </div>
        <div 
          className={`${styles.statCard} ${statusFiltro === 'Entregue' ? styles.statCardActive : ''}`}
          onClick={() => handleToggleStatusFilter('Entregue')}
          title="Filtrar por Pedidos Entregues"
        >
          <div className={styles.statIcon} style={{ background: '#d1fae5', color: '#059669' }}><CheckCircle size={24} /></div>
          <div className={styles.statInfo}>
            <h3>Entregues</h3>
            <p>{stats.entregues}</p>
          </div>
        </div>
      </div>

      {/* Controles de Filtros e Busca */}
      <div className={styles.topControls}>
        {/* Filtro de Integração */}
        <div className={styles.integracaoSelectWrapper}>
          <Store size={18} className={styles.integracaoIcon} />
          <select
            id="select-integracao-pedidos"
            className={styles.integracaoSelect}
            value={integracaoSelecionada}
            onChange={(e) => {
              setIntegracaoSelecionada(e.target.value);
              setStatusFiltro(null); // reseta filtro de status ao trocar integracao
            }}
          >
            <option value="todas">Todas as Integrações</option>
            {integracoes.map((integracao) => (
              <option key={integracao.id} value={String(integracao.id)}>
                {integracao.nome}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className={styles.selectArrow} />
        </div>

        {/* Campo de Busca */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', height: '46px', padding: '0 14px', flex: 1, minWidth: '280px', boxShadow: '0 2px 8px rgba(12, 52, 71, 0.05)' }}>
          <Search size={16} style={{ color: '#94a3b8', marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Buscar por ID, ID do ML ou comprador..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.92rem', color: '#334155' }}
          />
          {busca && (
            <X 
              size={16} 
              style={{ color: '#94a3b8', cursor: 'pointer' }} 
              onClick={() => setBusca('')}
            />
          )}
        </div>

        {/* Botão de Exportação */}
        <div className={styles.exportWrapper}>
          <button 
            className={styles.btnExport}
            onClick={toggleExportDropdown}
            title="Exportar dados filtrados"
          >
            <span>Exportar Relatório</span>
            <ChevronDown size={16} />
          </button>
          
          {isExportDropdownOpen && (
            <div className={styles.exportDropdown}>
              <button onClick={() => { handleExportCSV(); setIsExportDropdownOpen(false); }}>
                Exportar para CSV (Excel)
              </button>
              <button onClick={() => { handleExportPDF(); setIsExportDropdownOpen(false); }}>
                Imprimir / Salvar PDF
              </button>
            </div>
          )}
        </div>

        {statusFiltro && (
          <button 
            onClick={handleLimparFiltroStatus}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '12px', color: '#64748b', fontWeight: '700', cursor: 'pointer', height: '46px' }}
          >
            Filtrado por: {statusFiltro} <X size={14} />
          </button>
        )}
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Pedidos Recentes</h3>
          <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>
            {pedidosExibidos.length} {pedidosExibidos.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '80px 40px' }}>
            <Loading message="Carregando pedidos do banco de dados..." />
          </div>
        ) : pedidosExibidos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ShoppingCart size={48} />
            </div>
            <h2>Nenhum pedido encontrado</h2>
            <p>
              {busca 
                ? `Nenhum pedido atende à sua busca por "${busca}".` 
                : statusFiltro 
                ? `Nenhum pedido com status "${statusFiltro}" nesta seleção.`
                : integracaoSelecionada !== 'todas'
                ? 'Esta integração não possui nenhum pedido registrado.'
                : 'Não foram encontrados pedidos registrados no sistema.'}
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Valor Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidosExibidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <div className={styles.orderHeaderCell}>
                        <strong>#{pedido.id}</strong>
                        {pedido.id_pedido_ml && (
                          <span className={styles.badgeMeli} title={`ID Mercado Livre: ${pedido.id_pedido_ml}`}>
                            ML
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{pedido.nome_completo_comprador || pedido.apelido_comprador || '—'}</td>
                    <td>{new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</td>
                    <td>{formatCurrency(pedido.total)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusStyle(pedido.status_pedido)}`}>
                        <div className={styles.dot} /> {mapStatus(pedido.status_pedido)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          className={styles.btnVisualizar}
                          onClick={() => handleAbrirDetalhes(pedido.id)}
                          title="Visualizar detalhes do pedido"
                        >
                          <Eye size={15} />
                          <span>Detalhes</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Detalhe do Pedido */}
      <ModalDetalhePedido
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPedidoIdSelecionado(null);
        }}
        pedidoId={pedidoIdSelecionado}
      />
    </div>
  );
}
