import styles from './DashBoardEstoque.module.css';
import { Package, AlertTriangle, XCircle, DollarSign, ArrowRight } from 'lucide-react'; // Importando ícones Lucide

export function DashboardEstoque() {
    return (
        <main className={styles.main}>
            <h1>Dashboard de Estoque</h1>

            <section className={styles.kpiSection}>
                {/* KPI 1: Itens Totais */}
                <div className={`${styles.kpiCard} ${styles.info}`}> {/* Usando 'info' para neutro/sucesso */}
                    <div className={styles.kpiHeader}>
                        <Package size={24} className={styles.kpiIcon} />
                        <h2>Itens Totais</h2>
                    </div>
                    <p className={styles.kpiValue}>1.250</p>
                    <a href="/estoque" className={styles.kpiLink}>Ver Todos os Itens <ArrowRight size={14} /></a>
                </div>
                
                {/* KPI 2: Estoque Baixo */}
                <div className={`${styles.kpiCard} ${styles.warning}`}>
                    <div className={styles.kpiHeader}>
                        <AlertTriangle size={24} className={styles.kpiIcon} />
                        <h2>Estoque Baixo</h2>
                    </div>
                    <p className={styles.kpiValue}>35</p>
                    <a href="/estoque?status=baixo" className={styles.kpiLink}>Ver Detalhes <ArrowRight size={14} /></a>
                </div>
                
                {/* KPI 3: Esgotados */}
                <div className={`${styles.kpiCard} ${styles.danger}`}>
                    <div className={styles.kpiHeader}>
                        <XCircle size={24} className={styles.kpiIcon} />
                        <h2>Esgotados</h2>
                    </div>
                    <p className={styles.kpiValue}>12</p>
                    <a href="/estoque?status=esgotado" className={styles.kpiLink}>Ver Detalhes <ArrowRight size={14} /></a>
                </div>
                
                {/* KPI 4: Valor do Estoque */}
                <div className={`${styles.kpiCard} ${styles.success}`}>
                    <div className={styles.kpiHeader}>
                        <DollarSign size={24} className={styles.kpiIcon} />
                        <h2>Valor Total</h2>
                    </div>
                    <p className={styles.kpiValue}>R$ 75.820,00</p>
                    <a href="#" className={styles.kpiLink}>Detalhes Financeiros <ArrowRight size={14} /></a>
                </div>
            </section>

            <section className={styles.chartsSection}>
                <div className={styles.chartContainer}>
                    <h3>Distribuição do Estoque</h3>
                    <div className={styles.chartPlaceholder}>
                        <p>Em Estoque: 80%</p>
                        <p>Estoque Baixo: 15%</p>
                        <p>Esgotado: 5%</p>
                    </div>
                </div>
                <div className={styles.chartContainer}>
                    <h3>Top 5 Produtos Mais Estocados</h3>
                    <div className={styles.chartPlaceholder}>
                        <p>Caneta Azul: 250 un.</p>
                        <p>Caderno 10 Mat.: 180 un.</p>
                        <p>Lápis Preto: 150 un.</p>
                        <p>Borracha Branca: 120 un.</p>
                        <p>Régua 30cm: 100 un.</p>
                    </div>
                </div>
            </section>

            <section className={styles.alertsSection}>
                <h3>Alertas de Nível de Estoque</h3>
                <div className={styles.tableWrapper}> {/* Adiciona wrapper para melhor controle de overflow */}
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Código</th>
                                <th>Qtd. Atual</th>
                                <th>Nível Mínimo</th>
                                <th>Status</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Tinta Impressora XPTO</td>
                                <td>TN001</td>
                                <td>3</td>
                                <td>5</td>
                                <td><span className={`${styles.statusBadge} ${styles.badgeBaixo}`}>Baixo</span></td>
                                <td><button className={styles.actionBtn}>Repor</button></td>
                            </tr>
                            <tr>
                                <td>Mouse Sem Fio ABC</td>
                                <td>MS005</td>
                                <td>0</td>
                                <td>10</td>
                                <td><span className={`${styles.statusBadge} ${styles.badgeEsgotado}`}>Esgotado</span></td>
                                <td><button className={`${styles.actionBtn} ${styles.btnUrgent}`}>Repor Urgente</button></td>
                            </tr>
                            <tr>
                                <td>Teclado Gamer</td>
                                <td>TG002</td>
                                <td>8</td>
                                <td>7</td>
                                <td><span className={`${styles.statusBadge} ${styles.badgeOk}`}>OK</span></td>
                                <td><button className={styles.actionBtn}>Monitorar</button></td>
                            </tr>
                            <tr>
                                <td>Monitor LED 24"</td>
                                <td>MN007</td>
                                <td>25</td>
                                <td>5</td>
                                <td><span className={`${styles.statusBadge} ${styles.badgeOk}`}>OK</span></td>
                                <td><button className={styles.actionBtn}>Ver</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}