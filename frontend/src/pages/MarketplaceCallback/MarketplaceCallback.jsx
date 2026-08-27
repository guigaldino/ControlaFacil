import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../api';

export function MarketplaceCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hasCalled = useRef(false);

    useEffect(() => {
        const processIntegration = async () => {
            const code = searchParams.get('code');
            
            if (!code) {
                navigate('/ml-auth-error');
                return;
            }

            if (hasCalled.current) return;
            hasCalled.current = true;

            try {
                const token = localStorage.getItem('authToken');
                const integracaoId = localStorage.getItem('currentIntegrationId');
                
                const response = await fetch(`${API_BASE_URL}/integracoes/mercado-livre/auth?code=${code}&integracaoId=${integracaoId}`, {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.sucesso) {
                    localStorage.removeItem('currentIntegrationId');
                    navigate('/ml-auth-success');
                } else {
                    navigate('/ml-auth-error');
                }
            } catch (error) {
                console.error("Erro no callback de integração:", error);
                navigate('/ml-auth-error');
            }
        };

        processIntegration();
    }, [searchParams, navigate]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            background: '#f8fafc',
            color: '#0C3447'
        }}>
            <Loader2 
                size={48} 
                style={{ animation: 'spin 1s linear infinite', color: '#5FC16C' }} 
            />
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontWeight: 800, marginBottom: '5px' }}>Quase lá!</h2>
                <p style={{ color: '#64748b', fontWeight: 500 }}>
                    Finalizando sua integração com Mercado Livre...
                </p>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
