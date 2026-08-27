import React, { useState, useEffect } from "react";
import { Search, ArrowUpRight, ArrowDownLeft, CalendarDays } from "lucide-react";
import styles from "./HistoricoMovimentacao.module.css";
import { API_BASE_URL } from "../../api";
import { Loading } from "../Loading";

export function HistoricoMovimentacao() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");

  useEffect(() => {
    const fetchMovimentacoes = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/estoque/movimentacoes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.sucesso) {
          setMovimentacoes(data.movimentacoes || []);
        } else {
          setError(data.error || "Erro ao carregar o histórico de movimentações.");
        }
      } catch (err) {
        console.error("Erro ao carregar movimentações:", err);
        setError("Erro ao conectar ao servidor. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovimentacoes();
  }, []);

  const formatarData = (dataIso) => {
    if (!dataIso) return "—";
    try {
      const data = new Date(dataIso);
      if (isNaN(data.getTime())) return dataIso;
      const dia = String(data.getDate()).padStart(2, "0");
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const ano = data.getFullYear();
      const hora = String(data.getHours()).padStart(2, "0");
      const minuto = String(data.getMinutes()).padStart(2, "0");
      return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    } catch (e) {
      return dataIso;
    }
  };

  const filteredMovimentacoes = movimentacoes.filter((item) => {
    const isEntrada = item.tipo === 1 || String(item.tipo).toUpperCase() === "ENTRADA";
    const movimentoLabel = isEntrada ? "Entrada" : "Saída";

    const matchesSearch =
      (item.produto_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.produto_sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.usuario_nome || "Sistema").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.motivo || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo =
      filterTipo === "Todos" || movimentoLabel === filterTipo;

    return matchesSearch && matchesTipo;
  });

  if (loading) {
    return <Loading message="Carregando histórico..." />;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState} style={{ borderColor: "#fca5a5" }}>
          <div className={styles.emptyIcon} style={{ background: "#fee2e2", color: "#ef4444" }}>
            <CalendarDays size={40} />
          </div>
          <h4>Erro ao carregar movimentações</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Buscar por produto, SKU, usuário ou motivo..."
            className={styles.inputSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterSelectWrapper}>
          <label className={styles.filterLabel} htmlFor="tipo-movimento">
            Tipo:
          </label>
          <select
            id="tipo-movimento"
            className={styles.selectFilter}
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
        </div>
      </div>

      <section className={styles.tableSection}>
        <h3>Registro de Movimentações</h3>
        {filteredMovimentacoes.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Movimento</th>
                  <th>Produto</th>
                  <th>SKU</th>
                  <th className={styles.centered}>Quantidade</th>
                  <th>Usuário</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovimentacoes.map((item) => {
                  const isEntrada = item.tipo === 1 || String(item.tipo).toUpperCase() === "ENTRADA";
                  const badgeClass = isEntrada ? styles.badgeEntrada : styles.badgeSaida;
                  const Icon = isEntrada ? ArrowUpRight : ArrowDownLeft;
                  const movimentoLabel = isEntrada ? "Entrada" : "Saída";

                  return (
                    <tr key={item.id}>
                      <td>{formatarData(item.data_hora)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${badgeClass}`}>
                          <span className={styles.badgeIcon}>
                            <Icon size={14} />
                          </span>
                          {movimentoLabel}
                        </span>
                      </td>
                      <td>{item.produto_nome}</td>
                      <td>{item.produto_sku}</td>
                      <td className={`${styles.centered} ${styles.quantityCell}`}>
                        <strong>{item.quantidade}</strong> un.
                      </td>
                      <td>{item.usuario_nome || "Sistema"}</td>
                      <td>{item.motivo || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <CalendarDays size={40} />
            </div>
            <h4>Nenhuma movimentação encontrada</h4>
            <p>Tente ajustar a busca ou os filtros para encontrar os registros.</p>
          </div>
        )}
      </section>
    </div>
  );
}

