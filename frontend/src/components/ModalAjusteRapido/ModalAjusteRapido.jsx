import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import styles from './ModalAjusteRapido.module.css';
import { API_BASE_URL } from '../../api';
import { toast } from 'react-toastify';
import { tipoMovimentacaoEstoque } from '../../utils/enums';

export function ModalAjusteRapido({ isOpen, onClose, produto, onSaveSuccess }) {
  const [tipo, setTipo] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setTipo('');
      setQuantidade('');
      setMotivo('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !produto) return null;

  const validate = () => {
    const newErrors = {};
    if (!tipo) {
      newErrors.tipo = 'Selecione o tipo de movimentação';
    }
    if (!quantidade) {
      newErrors.quantidade = 'Informe a quantidade';
    } else {
      const qNum = Number(quantidade);
      if (isNaN(qNum) || qNum <= 0 || !Number.isInteger(qNum)) {
        newErrors.quantidade = 'A quantidade deve ser um número inteiro positivo';
      }
    }
    if (!motivo.trim()) {
      newErrors.motivo = 'Informe o motivo do ajuste manual';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/estoque/movimentacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          produto_id: Number(produto.id),
          quantidade: Number(quantidade),
          tipo: Number(tipo),
          motivo: motivo.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        toast.success(data.mensagem || 'Movimentação registrada com sucesso!');
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        onClose();
      } else {
        toast.error(data.error || 'Erro ao registrar movimentação de estoque.');
      }
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error);
      toast.error('Erro de conexão ao salvar movimentação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>Ajuste Rápido de Estoque</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Warning Banner */}
            <div className={styles.infoBox}>
              <AlertTriangle className={styles.infoIcon} size={20} />
              <p className={styles.infoText}>
                Esta modificação é apenas interna. Para atualizar o saldo de estoque no Mercado Livre,
                você precisará sincronizar o anúncio novamente.
              </p>
            </div>

            {/* Produto Name Display */}
            <div className={styles.inputGroup}>
              <label>Produto</label>
              <input type="text" value={produto.nome} disabled style={{ opacity: 0.8 }} />
            </div>

            {/* Tipo de Movimentação */}
            <div className={styles.inputGroup}>
              <label htmlFor="tipo-movimentacao">Tipo de Movimentação *</label>
              <select
                id="tipo-movimentacao"
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  if (errors.tipo) setErrors((prev) => ({ ...prev, tipo: null }));
                }}
                className={errors.tipo ? styles.errorBorder : ''}
              >
                <option value="">Selecione...</option>
                <option value={tipoMovimentacaoEstoque.ENTRADA}>Entrada</option>
                <option value={tipoMovimentacaoEstoque.SAIDA}>Saída</option>
              </select>
              {errors.tipo && <span className={styles.errorText}>{errors.tipo}</span>}
            </div>

            {/* Quantidade */}
            <div className={styles.inputGroup}>
              <label htmlFor="quantidade-movimentacao">Quantidade *</label>
              <input
                id="quantidade-movimentacao"
                type="number"
                min="1"
                step="1"
                placeholder="Ex: 5"
                value={quantidade}
                onChange={(e) => {
                  setQuantidade(e.target.value);
                  if (errors.quantidade) setErrors((prev) => ({ ...prev, quantidade: null }));
                }}
                className={errors.quantidade ? styles.errorBorder : ''}
              />
              {errors.quantidade && <span className={styles.errorText}>{errors.quantidade}</span>}
            </div>

            {/* Motivo */}
            <div className={styles.inputGroup}>
              <label htmlFor="motivo-movimentacao">Motivo / Justificativa *</label>
              <textarea
                id="motivo-movimentacao"
                placeholder="Descreva o motivo do ajuste manual (ex: ajuste de inventário, perda de itens)"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  if (errors.motivo) setErrors((prev) => ({ ...prev, motivo: null }));
                }}
                className={errors.motivo ? styles.errorBorder : ''}
              />
              {errors.motivo && <span className={styles.errorText}>{errors.motivo}</span>}
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Confirmar Movimentação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
