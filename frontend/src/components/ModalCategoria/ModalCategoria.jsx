import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from '../ModalProdutos/ModalProdutos.module.css'; // Reusing ModalProdutos styles for consistency

export function ModalCategoria({ isOpen, onClose, onSave, categoriaEmEdicao }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (categoriaEmEdicao) {
        setFormData({ nome: categoriaEmEdicao.nome, descricao: categoriaEmEdicao.descricao });
      } else {
        setFormData({ nome: '', descricao: '' });
      }
    }
  }, [isOpen, categoriaEmEdicao]);

  if (!isOpen) return null;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) {
      alert("O nome da categoria é obrigatório.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer} style={{ maxWidth: '500px' }}>
        <div className={styles.modalHeader}>
          <h2>{categoriaEmEdicao ? "Editar Categoria" : "Cadastrar Nova Categoria"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
            <label>Nome da Categoria</label>
            <input 
              type="text" 
              name="nome" 
              value={formData.nome} 
              onChange={handleFormChange} 
              placeholder="Ex: Eletrônicos" 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Descrição</label>
            <textarea 
              name="descricao" 
              value={formData.descricao} 
              onChange={handleFormChange} 
              placeholder="Descrição opcional da categoria..."
              style={{ minHeight: '80px' }}
            ></textarea>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnSubmit} onClick={handleSubmit}>
            Salvar Categoria
          </button>
        </div>
      </div>
    </div>
  );
}
