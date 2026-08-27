import React from 'react';
import { AlertTriangle, CircleHelp, CheckCircle, Info } from 'lucide-react';
import styles from './ModalConfirmacao.module.css';

const icons = {
  danger: AlertTriangle,
  question: CircleHelp,
  success: CheckCircle,
  info: Info,
};

export function ModalConfirmacao({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  btnCancelText = "Não, Cancelar", 
  btnConfirmText, 
  variant = "danger" 
}) {
  if (!isOpen) return null;

  const IconComponent = icons[variant] || AlertTriangle;
  const finalConfirmText = btnConfirmText || (variant === "danger" ? "Sim, Excluir" : "Confirmar");

  const capitalizedVariant = variant.charAt(0).toUpperCase() + variant.slice(1);
  const iconClass = `${styles.iconContainer} ${styles[`icon${capitalizedVariant}`] || styles.iconDanger}`;
  const confirmBtnClass = `${styles.btnConfirm} ${styles[`btn${capitalizedVariant}`] || styles.btnDanger}`;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={iconClass}>
          <IconComponent size={32} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={confirmBtnClass} onClick={onConfirm}>
            {finalConfirmText}
          </button>
          <button className={styles.btnCancel} onClick={onClose}>
            {btnCancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
