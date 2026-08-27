import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Loading.module.css';

export function Loading({ message = "Carregando..." }) {
    return (
        <div className={styles.loadingContainer}>
            <Loader2 className={styles.spin} size={40} />
            <p>{message}</p>
        </div>
    );
}
