import { useNavigate } from "react-router-dom";
import styles from '../HeaderU/HeaderU.module.css';
import { Settings, LogOut } from 'lucide-react'; 

// Simplificado: Removida a prop secondaryLinks
export function UserMenu({ onClose }) {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    const handleSair = () => {
        // Implemente aqui a lógica de logout (limpar token/sessão)
        navigate("/login");
        onClose();
    };

    return (
        <div className={styles.userMenu}>
            <button className={styles.menuItem} onClick={() => handleNavigation("/meus-dados")}>
                <Settings size={18} /> Meus dados
            </button>
            
            {/* Removido o bloco secondaryLinks e o divisor */}

            <button className={`${styles.menuItem} ${styles.logoutItem}`} onClick={handleSair}>
                <LogOut size={18} /> Sair
            </button>
        </div>
    );
}