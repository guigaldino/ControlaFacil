import React, { useState, useEffect } from 'react';
import { FolderX, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { ModalCategoria } from '../ModalCategoria';
import { ModalConfirmacao } from '../ModalConfirmacao';
import styles from './Categorias.module.css';
import estoqueStyles from '../../pages/Estoque/Estoque.module.css';
import { API_BASE_URL } from '../../api';
import { toast } from 'react-toastify';
import { Loading } from '../Loading';

const mockCategorias = [
  { id: 1, nome: "Eletrônicos", descricao: "Produtos eletrônicos em geral" },
  { id: 2, nome: "Informática", descricao: "Computadores, mouses, teclados" },
];

export function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);


  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
          try {
              setLoading(true);
              const token = localStorage.getItem("authToken");
              const response = await fetch(`${API_BASE_URL}/categoria-produto`, {
                  headers: {
                      'Authorization': `Bearer ${token}`
                  }
              });
              const data = await response.json();
              
              if (data.sucesso) {
                  setCategorias(data.categorias);
              } else {
                  setCategorias([]);
              }
          } catch (error) {
              console.error('Erro ao buscar categorias:', error);
              toast.error("Erro ao carregar categorias");
          } finally {
              setLoading(false);
          }
      };

  const handleOpenModal = (categoria = null) => {
    setCategoriaEmEdicao(categoria);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoriaEmEdicao(null);
  };

  const handleSaveCategoria = (formData) => {
    if (categoriaEmEdicao) {
      const dadosEdicao = {
        id: categoriaEmEdicao.id,
        nome: formData.nome,
        descricao: formData.descricao
      }
      editarCategoria(dadosEdicao)
    } else {
      adicionarCategoria(formData);
    }
    handleCloseModal();
  };

  const confirmDelete = (categoria) => {
    setCategoriaParaExcluir(categoria);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (id) => {
    deletarCategoria(categoriaParaExcluir.id).then(() => {
      setIsDeleteModalOpen(false);
      setCategoriaParaExcluir(null);
    });
  };

  const adicionarCategoria = async (dados) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/categoria-produto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });
      const data = await response.json();
      
      if (data.sucesso) {
        setCategorias([...categorias, data.categoria]);
        toast.success("Categoria adicionada com sucesso!");
      } else {
        toast.error(data.message || "Erro ao adicionar categoria");
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error("Erro ao adicionar categoria");
    }
  }

  const deletarCategoria = async (idCategoria) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/categoria-produto/${idCategoria}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.sucesso) {
        setCategorias(categorias.filter(cat => cat.id != idCategoria));
        toast.success("Categoria excluída com sucesso!");
      } else {
        toast.error(data.message || "Erro ao excluir categoria");
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error("Erro ao excluir categoria");
    }
  }

  const editarCategoria = async (dados) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/categoria-produto`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });
      const data = await response.json();
      
      if (data.sucesso) {
        setCategorias(categorias.map(cat => cat.id === data.categoria.id ? data.categoria : cat));
        toast.success("Categoria editada com sucesso!");
      } else {
        toast.error(data.message || "Erro ao editar categoria");
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error("Erro ao editar categoria");
    }
  }

  const categoriasFiltradas = categorias.filter(cat =>
    cat.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={estoqueStyles.tabContent}>
      {loading ? (
        <Loading message="Carregando categorias..." />
      ) : categorias.length === 0 ? (
        <div className={estoqueStyles.emptyState}>
          <div className={estoqueStyles.emptyIcon}>
            <FolderX size={48} />
          </div>
          <h2>Não foram encontradas categorias cadastradas</h2>
          <p>Você ainda não possui categorias internas para organizar seus produtos.</p>
          <button className={estoqueStyles.btnAdd} onClick={() => handleOpenModal()}>
            <Plus size={20} /> Cadastrar Categoria
          </button>
        </div>
      ) : (
        <div>
          <div className={styles.headerActions} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            <button className={estoqueStyles.btnAdd} onClick={() => handleOpenModal()}>
              <Plus size={20} /> Cadastrar Categoria
            </button>
          </div>

          <section className={styles.tableSection}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Nome da Categoria</th>
                    <th>Descrição</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasFiltradas.length > 0 ? (
                    categoriasFiltradas.map((cat) => (
                      <tr key={cat.id}>
                        <td style={{ fontWeight: 600, color: '#0C3447' }}>{cat.nome}</td>
                        <td style={{ color: '#64748b' }}>{cat.descricao || '-'}</td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button 
                            className={`${styles.actionBtn} ${styles.btnEdit}`} 
                            onClick={() => handleOpenModal(cat)}
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.btnDelete}`} 
                            onClick={() => confirmDelete(cat)}
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        Nenhuma categoria encontrada para "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      <ModalCategoria 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onSave={handleSaveCategoria}
        categoriaEmEdicao={categoriaEmEdicao}
      />

      <ModalConfirmacao
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Categoria?"
        message="Ao excluir, todos os produtos vinculados a essa categoria ficarão sem categoria interna vinculada. Deseja continuar?"
      />
    </div>
  );
}
