import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import styles from './EmailConfirmation.module.css';

/**
 * EmailConfirmation Component
 * Success state shown after user registration.
 */
export function EmailConfirmation() {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <div className={styles.confirmationContainer}>
      <div className={styles.confirmationCard}>
        <div className={styles.iconWrapper}>
          <MailCheck size={40} strokeWidth={1.5} />
        </div>

        <h1 className={styles.title}>Verifique seu e-mail</h1>
        
        <p className={styles.description}>
          Enviamos um link de confirmação para o endereço cadastrado. 
          Após validar sua conta, você poderá acessar o sistema.
        </p>

        <button 
          className={styles.loginButton} 
          onClick={handleLoginRedirect}
          type="button"
        >
          Ir para Login
        </button>
      </div>
    </div>
  );
}

export default EmailConfirmation;
