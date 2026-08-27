import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import styles from '../EmailValidado/EmailValidado.module.css';

export function MarketplaceAuthSuccess() {
    useEffect(() => {
        // Sinaliza sucesso para a janela principal (opener)
        if (window.opener) {
            window.opener.postMessage({ type: 'ML_AUTH_SUCCESS' }, window.location.origin);
            
            // Fechamento automático como conveniência de UX
            const timer = setTimeout(() => {
                window.close();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <main className={styles.container}>
            <section className={styles.card}>
                <div className={styles.iconCircle} style={{ color: '#5FC16C', background: '#f0fdf4' }}>
                    <CheckCircle size={56} strokeWidth={1.5} />
                </div>

                <h1 className={styles.title}>Integração Concluída!</h1>
                
                <p className={styles.message}>
                    Sua conta do Mercado Livre foi conectada com sucesso ao <strong>Controla Fácil</strong>. 
                    Esta janela será fechada em instantes.
                </p>

                <button 
                    className={styles.actionButton} 
                    onClick={() => window.close()}
                >
                    Voltar para Integrações
                </button>
            </section>
        </main>
    );
}
