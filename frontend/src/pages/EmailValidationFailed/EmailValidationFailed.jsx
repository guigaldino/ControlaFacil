import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import styles from './EmailValidationFailed.module.css';

/**
 * EmailValidationFailed Component
 * Error state shown when email validation link is invalid or expired.
 */
export function EmailValidationFailed() {
  const navigate = useNavigate();

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <div className={styles.iconCircle}>
          <ShieldAlert size={56} strokeWidth={1.5} />
        </div>

        <h1 className={styles.title}>Falha na validação</h1>
        
        <p className={styles.message}>
          Não foi possível validar seu e-mail. O link pode ter <strong>expirado</strong> ou é <strong>inválido</strong>. 
          Por favor, tente realizar o cadastro novamente.
        </p>

        <button 
          className={styles.actionButton} 
          onClick={() => navigate('/cadastro')}
          type="button"
        >
          Tentar novamente
        </button>
        
        <button 
          className={styles.secondaryButton} 
          onClick={() => navigate('/')}
          type="button"
        >
          Voltar para o Início
        </button>
      </section>
    </main>
  );
}

export default EmailValidationFailed;
