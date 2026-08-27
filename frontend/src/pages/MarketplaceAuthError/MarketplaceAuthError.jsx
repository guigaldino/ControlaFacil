import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';
import styles from '../EmailValidationFailed/EmailValidationFailed.module.css';

export function MarketplaceAuthError() {
    useEffect(() => {
        // Notifica a janela principal sobre a falha (opcional para logs/feedbacks na UI pai)
        if (window.opener) {
            window.opener.postMessage({ type: 'ML_AUTH_ERROR' }, window.location.origin);
        }
    }, []);

    return (
        <main className={styles.container}>
            <section className={styles.card}>
                <div className={styles.iconCircle} style={{ color: '#ef4444', background: '#fef2f2' }}>
                    <XCircle size={56} strokeWidth={1.5} />
                </div>

                <h1 className={styles.title}>Falha na Integração</h1>
                
                <p className={styles.message}>
                    Não foi possível concluir a conexão com o Marketplace. 
                    Isso pode ter ocorrido por expiração da sessão ou cancelamento da autorização.
                </p>

                <button 
                    className={styles.actionButton} 
                    onClick={() => window.close()}
                >
                    Tentar Novamente
                </button>
            </section>
        </main>
    );
}
