import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import styles from './EmailValidado.module.css';

export function EmailValidado() {
  const navigate = useNavigate();

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <div className={styles.iconCircle}>
          <BadgeCheck size={56} strokeWidth={1.5} />
        </div>

        <h1 className={styles.title}>E-mail validado!</h1>
        
        <p className={styles.message}>
          Sua conta foi ativada com sucesso. Agora você já pode acessar 
          todas as funcionalidades do <strong>Controla Fácil</strong>.
        </p>

        <button 
          className={styles.actionButton} 
          onClick={() => navigate('/')}
        >
          Acessar minha conta
        </button>
      </section>
    </main>
  );
}

export default EmailValidado;
