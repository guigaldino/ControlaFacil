import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import styles from './ModalRemoverProduto.module.css';

export function ModalRemoverProduto({ isOpen, onClose, produto, onConfirmInativar, onConfirmExcluir }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !produto) return null;

  const handleInativar = async () => {
    setIsSubmitting(true);
    try {
      if (onConfirmInativar) {
        await onConfirmInativar(produto);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao inativar produto no modal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExcluir = async () => {
    setIsSubmitting(true);
    try {
      if (onConfirmExcluir) {
        await onConfirmExcluir(produto);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao excluir produto no modal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={isSubmitting ? null : onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>Remover Produto</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar modal" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Mercado Livre Warning Banner */}
          <div className={styles.alertBanner}>
            <AlertTriangle className={styles.alertIcon} size={20} />
            <p className={styles.alertText}>
              Aviso: As alterações feitas aqui também irão refletir diretamente no anúncio vinculado no Mercado Livre.
            </p>
          </div>

          <p className={styles.explanationText}>
            Como deseja remover o produto <strong>{produto.nome}</strong>? Escolha uma das opções abaixo:
          </p>

          {/* Comparison Cards */}
          <div className={styles.comparisonGrid}>
            <div className={`${styles.optionCard} ${styles.inativarCard}`}>
              <h4>Inativar Produto</h4>
              <p>
                <strong>Ação Reversível.</strong> O produto ficará oculto temporariamente no catálogo local
                e pausará as vendas e sincronizações do anúncio correspondente no Mercado Livre.
                Pode ser reativado a qualquer momento.
              </p>
            </div>

            <div className={`${styles.optionCard} ${styles.excluirCard}`}>
              <h4>Excluir Definitivamente</h4>
              <p>
                <strong>Ação Irreversível.</strong> Deleta o produto de forma permanente do Controla Fácil.
                O anúncio associado no Mercado Livre também será deletado permanentemente do marketplace.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className={styles.btnInativar} onClick={handleInativar} disabled={isSubmitting}>
            {isSubmitting ? 'Aguarde...' : 'Inativar Produto'}
          </button>
          <button className={styles.btnExcluir} onClick={handleExcluir} disabled={isSubmitting}>
            {isSubmitting ? 'Aguarde...' : 'Excluir Definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
}
