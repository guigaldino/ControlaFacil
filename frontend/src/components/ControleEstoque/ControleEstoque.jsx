import React, { useState, useEffect, useMemo } from "react";
import {
  PackageX,
  Plus,
  Search,
  Edit2,
  RefreshCw,
  Store,
  ChevronDown,
  ImageOff,
  Trash2,
  Zap,
  ExternalLink,
} from "lucide-react";
import estoqueStyles from "../../pages/Estoque/Estoque.module.css";
import styles from "./ControleEstoque.module.css";
import { ModalProdutos } from "../ModalProdutos";
import { ModalConfirmacao } from "../ModalConfirmacao";
import { ModalAjusteRapido } from "../ModalAjusteRapido/ModalAjusteRapido";
import { ModalRemoverProduto } from "../ModalRemoverProduto/ModalRemoverProduto";
import { Loading } from "../Loading";
import { API_BASE_URL } from "../../api";
import { toast } from "react-toastify";
import { produtoStatus } from "../../utils/enums";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStockStatus(qtdDisponivel, qtdMinima) {
  if (qtdDisponivel === 0) return { label: "Esgotado", key: "esgotado" };
  if (qtdDisponivel <= qtdMinima * 0.5) return { label: "Baixo", key: "baixo" };
  if (qtdDisponivel <= qtdMinima) return { label: "Médio", key: "medio" };
  return { label: "OK", key: "ok" };
}

function getStockStatusOrder(qtdDisponivel, qtdMinima) {
  if (qtdDisponivel === 0) return 0;
  if (qtdDisponivel <= qtdMinima * 0.5) return 1;
  if (qtdDisponivel <= qtdMinima) return 2;
  return 3;
}

const SEARCH_FIELDS = [
  { value: "nome", label: "Nome / Título" },
  { value: "sku", label: "SKU" },
  { value: "categoria", label: "Categoria" },
  { value: "preco", label: "Preço" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function ControleEstoque() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [produtoIdParaEditar, setProdutoIdParaEditar] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [produtoIdParaSincronizar, setProdutoIdParaSincronizar] = useState(null);
  const [produtoNomeParaSincronizar, setProdutoNomeParaSincronizar] = useState("");
  const [mlItemIdParaSincronizar, setMlItemIdParaSincronizar] = useState(null);

  const [isAjusteModalOpen, setIsAjusteModalOpen] = useState(false);
  const [produtoParaAjustar, setProdutoParaAjustar] = useState(null);

  const [isRemoverModalOpen, setIsRemoverModalOpen] = useState(false);
  const [produtoParaRemover, setProdutoParaRemover] = useState(null);
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const [isReativarModalOpen, setIsReativarModalOpen] = useState(false);
  const [produtoIdParaReativar, setProdutoIdParaReativar] = useState(null);
  const [produtoNomeParaReativar, setProdutoNomeParaReativar] = useState("");

  // Dados da API
  const [integracoes, setIntegracoes] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [estoques, setEstoques] = useState({}); // { [produto_id]: { qtd_disponivel, qtd_minima } }

  // Loading states
  const [loadingIntegracoes, setLoadingIntegracoes] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  // Filtros
  const [integracaoSelecionada, setIntegracaoSelecionada] = useState("todas");
  const [searchField, setSearchField] = useState("nome");
  const [searchValue, setSearchValue] = useState("");

  // ── Buscar integrações ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchIntegracoes = async () => {
      try {
        setLoadingIntegracoes(true);
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/integracoes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.sucesso) {
          setIntegracoes(data.integracoes);
        } else {
          setIntegracoes([]);
        }
      } catch (error) {
        console.error("Erro ao buscar integrações:", error);
        toast.error("Erro ao carregar integrações.");
      } finally {
        setLoadingIntegracoes(false);
      }
    };

    fetchIntegracoes();
  }, []);

  // ── Buscar categorias ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/categoria-produto`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.sucesso) {
          const map = {};
          data.categorias.forEach((c) => {
            map[c.id] = c.nome;
          });
          setCategorias(map);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategorias();
  }, []);

  // ── Buscar produtos ──────────────────────────────────────────────────────
  const carregarProdutos = async () => {
    try {
      setLoadingProdutos(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/produto`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.sucesso) {
        setProdutos(data.produtos);
        fetchEstoques(data.produtos, token);
      } else {
        setProdutos([]);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast.error("Erro ao carregar produtos.");
    } finally {
      setLoadingProdutos(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // ── Buscar estoque de cada produto ───────────────────────────────────────
  const fetchEstoques = async (listaProdutos, token) => {
    const estoqueMap = {};
    await Promise.all(
      listaProdutos.map(async (produto) => {
        try {
          const res = await fetch(`${API_BASE_URL}/estoque/${produto.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.sucesso) {
            estoqueMap[produto.id] = {
              qtd_disponivel: data.estoque.qtd_disponivel ?? 0,
              qtd_minima: data.estoque.qtd_minima ?? 0,
            };
          } else {
            estoqueMap[produto.id] = { qtd_disponivel: 0, qtd_minima: 0 };
          }
        } catch {
          estoqueMap[produto.id] = { qtd_disponivel: 0, qtd_minima: 0 };
        }
      })
    );
    setEstoques(estoqueMap);
  };

  // ── Refresh de um produto ─────────────────────────────────────────────────
  const refreshEstoqueProduto = async (produtoId) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/estoque/${produtoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.sucesso) {
        setEstoques((prev) => ({
          ...prev,
          [produtoId]: {
            qtd_disponivel: data.estoque.qtd_disponivel ?? 0,
            qtd_minima: data.estoque.qtd_minima ?? 0,
          },
        }));
      }
    } catch {
      /* silently fail */
    }
  };

  // ── Filtrar produtos ─────────────────────────────────────────────────────
  const produtosFiltrados = useMemo(() => {
    let lista = [...produtos];

    // Filtro de inativos
    if (!mostrarInativos) {
      lista = lista.filter((p) => Number(p.excluido) === produtoStatus.ATIVO);
    } else {
      lista = lista.filter((p) => Number(p.excluido) === produtoStatus.ATIVO || Number(p.excluido) === produtoStatus.INATIVO);
    }

    // Filtro por integração
    if (integracaoSelecionada !== "todas") {
      lista = lista.filter(
        (p) => String(p.integracao_id) === String(integracaoSelecionada)
      );
    }

    // Filtro por busca
    if (searchValue.trim()) {
      const term = searchValue.trim().toLowerCase();
      lista = lista.filter((p) => {
        switch (searchField) {
          case "nome":
            return p.nome?.toLowerCase().includes(term);
          case "sku":
            return p.sku?.toLowerCase().includes(term);
          case "categoria":
            return categorias[p.categoria_id]?.toLowerCase().includes(term);
          case "preco":
            return String(p.preco).includes(term);
          default:
            return true;
        }
      });
    }

    // Ordenar por prioridade de estoque (esgotado primeiro)
    lista.sort((a, b) => {
      const estoqueA = estoques[a.id] ?? { qtd_disponivel: 0, qtd_minima: 0 };
      const estoqueB = estoques[b.id] ?? { qtd_disponivel: 0, qtd_minima: 0 };
      return (
        getStockStatusOrder(estoqueA.qtd_disponivel, estoqueA.qtd_minima) -
        getStockStatusOrder(estoqueB.qtd_disponivel, estoqueB.qtd_minima)
      );
    });

    return lista;
  }, [produtos, integracaoSelecionada, searchField, searchValue, categorias, estoques, mostrarInativos]);

  // ── Ações de botões ───────────────────────────────────────────────────────
  const handleEditar = (produto) => {
    setProdutoIdParaEditar(produto.id);
    setIsEditModalOpen(true);
  };

  const handleRemover = (produto) => {
    setProdutoParaRemover(produto);
    setIsRemoverModalOpen(true);
  };

  const handleReativar = (produto) => {
    setProdutoIdParaReativar(produto.id);
    setProdutoNomeParaReativar(produto.nome);
    setIsReativarModalOpen(true);
  };

  const handleConfirmarReativacao = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/produto/status/${produtoIdParaReativar}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: produtoStatus.ATIVO
        })
      });

      const data = await response.json();
      if (data.sucesso) {
        toast.success(data.mensagem || "Produto reativado com sucesso!");
        carregarProdutos();
      } else {
        toast.error(data.error || "Erro ao reativar produto.");
      }
    } catch (error) {
      console.error("Erro ao reativar produto:", error);
      toast.error("Erro ao reativar o produto.");
    } finally {
      setIsReativarModalOpen(false);
      setProdutoIdParaReativar(null);
      setProdutoNomeParaReativar("");
    }
  };

  const handleConfirmarInativacao = async (produto) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/produto/status/${produto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: produtoStatus.INATIVO
        })
      });

      const data = await response.json();
      if (response.ok && data.sucesso) {
        toast.success(data.mensagem || "Produto inativado com sucesso!");
        carregarProdutos();
      } else {
        toast.error(data.error || "Erro ao inativar produto.");
      }
    } catch (error) {
      console.error("Erro ao inativar produto:", error);
      toast.error("Erro de conexão ao inativar o produto.");
    }
  };

  const handleConfirmarExclusao = async (produto) => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Passo 1: Atualizar o status para excluído para sincronizar com o Mercado Livre (anúncio pausado/fechado)
      const statusResponse = await fetch(`${API_BASE_URL}/produto/status/${produto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: produtoStatus.EXCLUIDO
        })
      });

      if (!statusResponse.ok) {
        const errData = await statusResponse.json();
        throw new Error(errData.error || "Erro ao atualizar status no Mercado Livre antes da exclusão.");
      }

      // Passo 2: Excluir o produto localmente
      const deleteResponse = await fetch(`${API_BASE_URL}/produto/${produto.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await deleteResponse.json();
      if (deleteResponse.ok && data.sucesso) {
        toast.success(data.mensagem || "Produto excluído com sucesso!");
        carregarProdutos();
      } else {
        toast.error(data.error || "Erro ao excluir produto localmente.");
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast.error(error.message || "Erro de conexão ao excluir o produto.");
    }
  };

  const handleAjusteRapido = (produto) => {
    setProdutoParaAjustar(produto);
    setIsAjusteModalOpen(true);
  };

  const handleIrMercadoLivre = (produto) => {
    if (!produto.ml_link_anuncio) {
      toast.warning("Anúncio do Mercado Livre não encontrado. Por favor, sincronize o produto novamente.");
    } else {
      window.open(produto.ml_link_anuncio, "_blank");
    }
  };

  const handleSincronizar = async (produto) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/produto/${produto.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.sucesso) {
        const prod = data.produto;
        setProdutoIdParaSincronizar(prod.id);
        setProdutoNomeParaSincronizar(prod.nome);
        setMlItemIdParaSincronizar(prod.ml_item_id);
        setIsConfirmModalOpen(true);
      } else {
        toast.error("Erro ao buscar informações atualizadas do produto.");
      }
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      toast.error("Erro ao carregar dados do produto.");
    }
  };

  const handleConfirmarSincronizacao = async () => {
    let response;
    if (mlItemIdParaSincronizar) {
      response = await editarProdutoML(produtoIdParaSincronizar);
    } else {
      response = await publicarProdutoML(produtoIdParaSincronizar);
    }

    if (response && response.sucesso) {
      toast.success(response.mensagem);
      carregarProdutos();
    } else {
      toast.error(response?.mensagem || "Erro na sincronização.");
    }

    setIsConfirmModalOpen(false);
    setProdutoIdParaSincronizar(null);
    setProdutoNomeParaSincronizar("");
    setMlItemIdParaSincronizar(null);
  };

  const handleCancelarSincronizacao = () => {
    setIsConfirmModalOpen(false);
    setProdutoIdParaSincronizar(null);
    setProdutoNomeParaSincronizar("");
    setMlItemIdParaSincronizar(null);
  };

  const publicarProdutoML = async (produtoId) => {
    try {
      const token = localStorage.getItem("authToken");

      // Enviar request para publicar
      const response = await fetch(`${API_BASE_URL}/produto/mercado-livre/publicar/${produtoId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao publicar produto no Mercado Livre: " + error.message);
      return { sucesso: false, mensagem: "Erro ao publicar produto no Mercado Livre." };
    }
  };

  const editarProdutoML = async (produtoId) => {
    try {
      const token = localStorage.getItem("authToken");

      // Enviar request para editar
      const response = await fetch(`${API_BASE_URL}/produto/mercado-livre/editar/${produtoId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao atualizar produto no Mercado Livre: " + error.message);
      return { sucesso: false, mensagem: "Erro ao atualizar produto no Mercado Livre." };
    }
  };

  // ── Imagem de destaque ────────────────────────────────────────────────────
  const getImagemDestaque = (produto) => {
    // O campo `imagem_destaque` já vem na listagem via JOIN no backend
    const url = produto.imagem_destaque || null;
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}/${url}`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loadingIntegracoes || loadingProdutos) {
    return <Loading message="Carregando estoque..." />;
  }

  return (
    <div className={estoqueStyles.tabContent}>
      {/* ── Filtro de integração ─── */}
      <div className={styles.topControls}>
        <div className={styles.integracaoSelectWrapper}>
          <Store size={18} className={styles.integracaoIcon} />
          <select
            id="select-integracao"
            className={styles.integracaoSelect}
            value={integracaoSelecionada}
            onChange={(e) => {
              setIntegracaoSelecionada(e.target.value);
              setSearchValue("");
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

        {/* ── Barra de pesquisa ─── */}
        <div className={styles.searchBar}>
          <div className={styles.searchFieldWrapper}>
            <select
              id="search-field"
              className={styles.searchFieldSelect}
              value={searchField}
              onChange={(e) => {
                setSearchField(e.target.value);
                setSearchValue("");
              }}
            >
              {SEARCH_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.searchFieldArrow} />
          </div>

          <div className={styles.searchInputWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              id="search-input"
              type="text"
              placeholder={`Buscar por ${SEARCH_FIELDS.find((f) => f.value === searchField)?.label}...`}
              className={styles.searchInput}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        {/* ── Visualizar Inativados ─── */}
        <div className={styles.toggleWrapper}>
          <span className={styles.toggleLabel} onClick={() => setMostrarInativos(!mostrarInativos)}>
            Visualizar Inativados
          </span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={mostrarInativos}
              onChange={(e) => setMostrarInativos(e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <button className={estoqueStyles.btnAdd} onClick={() => setIsModalOpen(true)} style={{ whiteSpace: 'nowrap' }}>
          <Plus size={20} /> Adicionar Produto
        </button>
      </div>

      {/* ── Grid de produtos ─── */}
      {produtosFiltrados.length > 0 ? (
        <section className={estoqueStyles.stockTableSection}>
          <div className={styles.tableHeader}>
            <h3>
              {integracaoSelecionada === "todas"
                ? "Todos os Produtos"
                : `Produtos — ${integracoes.find((i) => String(i.id) === integracaoSelecionada)?.nome ?? ""}`}
              <span className={styles.countBadge}>{produtosFiltrados.length}</span>
            </h3>
          </div>

          <div className={estoqueStyles.tableWrapper}>
            <table className={styles.stockTable}>
              <thead>
                <tr>
                  <th className={styles.thImage}>Imagem</th>
                  <th>Título</th>
                  <th>SKU</th>
                  <th>Preço</th>
                  <th>Categoria</th>
                  <th className={estoqueStyles.centered}>Estoque Atual</th>
                  <th className={estoqueStyles.centered}>Status do Estoque</th>
                  <th className={estoqueStyles.centered}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((produto) => {
                  const est = estoques[produto.id] ?? { qtd_disponivel: 0, qtd_minima: 0 };
                  const status = getStockStatus(est.qtd_disponivel, est.qtd_minima);
                  const imagemUrl = getImagemDestaque(produto);

                  return (
                    <tr key={produto.id} className={styles.productRow}>
                      {/* Imagem */}
                      <td className={styles.tdImage}>
                        {imagemUrl ? (
                          <img
                            src={imagemUrl}
                            alt={produto.nome}
                            className={styles.productThumb}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={styles.productThumbPlaceholder}
                          style={{ display: imagemUrl ? "none" : "flex" }}
                        >
                          <ImageOff size={22} />
                        </div>
                      </td>

                      {/* Título */}
                      <td className={styles.tdNome}>
                        <span className={styles.productName}>{produto.nome}</span>
                      </td>

                      {/* SKU */}
                      <td>
                        <span className={styles.skuChip}>{produto.sku}</span>
                      </td>

                      {/* Preço */}
                      <td className={styles.tdPreco}>
                        R$ {Number(produto.preco).toFixed(2)}
                      </td>

                      {/* Categoria */}
                      <td className={styles.tdCategoria}>
                        {categorias[produto.categoria_id] || "—"}
                      </td>

                      {/* Estoque atual */}
                      <td className={`${estoqueStyles.centered} ${styles.tdEstoque}`}>
                        <span
                          className={`${styles.estoqueNum} ${styles[`estoqueNum__${status.key}`]}`}
                        >
                          {est.qtd_disponivel}
                        </span>
                        <span className={styles.estoqueUnit}>un.</span>
                      </td>

                      {/* Etiqueta de estoque */}
                      <td className={estoqueStyles.centered}>
                        {Number(produto.excluido) === produtoStatus.INATIVO ? (
                          <span
                            className={`${estoqueStyles.statusBadge} ${styles.inativo}`}
                          >
                            Inativo
                          </span>
                        ) : (
                          <span
                            className={`${estoqueStyles.statusBadge} ${estoqueStyles[status.key]}`}
                          >
                            {status.label}
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className={estoqueStyles.centered}>
                        <div className={styles.actionsCell}>
                          {Number(produto.excluido) === produtoStatus.INATIVO ? (
                            <button
                              className={`${styles.actionBtn} ${styles.btnReativar}`}
                              title="Reativar produto"
                              onClick={() => handleReativar(produto)}
                            >
                              <RefreshCw size={15} />
                              <span>Reativar</span>
                            </button>
                          ) : (
                            <>
                              <button
                                className={`${styles.actionBtn} ${styles.btnEditar}`}
                                title="Editar produto"
                                onClick={() => handleEditar(produto)}
                              >
                                <Edit2 size={15} />
                                <span>Editar</span>
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.btnSincronizar}`}
                                title="Sincronizar com Mercado Livre"
                                onClick={() => handleSincronizar(produto)}
                              >
                                <RefreshCw size={15} />
                                <span>Sincronizar</span>
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.btnAjusteRapido}`}
                                title="Ajuste rápido do estoque"
                                onClick={() => handleAjusteRapido(produto)}
                              >
                                <Zap size={15} />
                                <span>Ajuste Rápido</span>
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.btnMercadoLivre}`}
                                title="Ver no Mercado Livre"
                                onClick={() => handleIrMercadoLivre(produto)}
                              >
                                <ExternalLink size={15} />
                                <span>Ver no ML</span>
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.btnExcluir}`}
                                title="Remover produto"
                                onClick={() => handleRemover(produto)}
                              >
                                <Trash2 size={15} />
                                <span>Remover</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* ── Empty state ── */
        <div className={estoqueStyles.emptyState}>
          <div className={estoqueStyles.emptyIcon}>
            <PackageX size={48} />
          </div>
          <h2>Nenhum produto em estoque</h2>
          <p>
            {searchValue
              ? `Nenhum produto encontrado para "${searchValue}" em "${SEARCH_FIELDS.find((f) => f.value === searchField)?.label}".`
              : integracaoSelecionada !== "todas"
              ? "Esta integração ainda não possui produtos cadastrados."
              : "Você ainda não possui produtos cadastrados no seu estoque."}
          </p>
          {!searchValue && (
            <button className={estoqueStyles.btnAdd} onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> Adicionar Produto
            </button>
          )}
        </div>
      )}

      <ModalProdutos
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={carregarProdutos}
      />

      <ModalProdutos
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProdutoIdParaEditar(null);
        }}
        produtoId={produtoIdParaEditar}
        onSaveSuccess={carregarProdutos}
      />

      <ModalConfirmacao
        isOpen={isConfirmModalOpen}
        onClose={handleCancelarSincronizacao}
        onConfirm={handleConfirmarSincronizacao}
        title={mlItemIdParaSincronizar ? "Atualizar Anúncio no Mercado Livre?" : "Sincronizar Produto?"}
        message={
          mlItemIdParaSincronizar
            ? `Deseja realmente atualizar os dados do anúncio "${produtoNomeParaSincronizar}" no Mercado Livre? Isso atualizará o preço, estoque, descrição e características do anúncio existente.`
            : `Deseja realmente sincronizar os dados do produto "${produtoNomeParaSincronizar}" para o Mercado Livre?`
        }
        btnConfirmText={mlItemIdParaSincronizar ? "Sim, Atualizar" : "Sim, Sincronizar"}
        btnCancelText="Não, Cancelar"
        variant="info"
      />

      <ModalAjusteRapido
        isOpen={isAjusteModalOpen}
        onClose={() => {
          setIsAjusteModalOpen(false);
          setProdutoParaAjustar(null);
        }}
        produto={produtoParaAjustar}
        onSaveSuccess={carregarProdutos}
      />

      <ModalRemoverProduto
        isOpen={isRemoverModalOpen}
        onClose={() => {
          setIsRemoverModalOpen(false);
          setProdutoParaRemover(null);
        }}
        produto={produtoParaRemover}
        onConfirmInativar={handleConfirmarInativacao}
        onConfirmExcluir={handleConfirmarExclusao}
      />

      <ModalConfirmacao
        isOpen={isReativarModalOpen}
        onClose={() => {
          setIsReativarModalOpen(false);
          setProdutoIdParaReativar(null);
          setProdutoNomeParaReativar("");
        }}
        onConfirm={handleConfirmarReativacao}
        title="Reativar Produto?"
        message={`Deseja realmente reativar o produto "${produtoNomeParaReativar}"?`}
        btnConfirmText="Sim, Reativar"
        btnCancelText="Não, Cancelar"
        variant="success"
      />
    </div>
  );
}
