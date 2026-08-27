import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, ChevronDown, Menu, X, ChevronLeft, ChevronRight, Store, ShoppingCart, Box, BarChart3 } from 'lucide-react';
import { API_BASE_URL } from '../../api';
import styles from './HeaderU.module.css';

export function HeaderU({ isCollapsed, onToggle }) {
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [userName, setUserName] = useState('Usuário');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/usuarios/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.sucesso) setUserName(data.usuario.nome.split(' ')[0]);
            } catch (e) { /* fallback silêncioso */ }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const navItems = [
        { to: "/home", label: "Menu Inicial", icon: <LayoutDashboard size={22} /> },
        { to: "/pedidos", label: "Controle de Pedidos", icon: <ShoppingCart size={22} /> },
        { to: "/estoque", label: "Estoque", icon: <Box size={22} /> },
        { to: "/marketplaces", label: "Marketplaces", icon: <Store size={22} /> },
        { to: "/relatorios", label: "Relatórios", icon: <BarChart3 size={22} /> },
        { to: "/meus-dados", label: "Meu Perfil", icon: <User size={22} /> },
    ];

    return (
        <>
            {/* Overlay para Mobile */}
            {isMobileOpen && <div className={styles.overlay} onClick={() => setIsMobileOpen(false)} />}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarBrand}>
                    <div className={styles.brandLogo}>CF</div>
                    {!isCollapsed && <span className={styles.brandName}>Controla Fácil</span>}
                    
                    <button className={styles.collapseBtn} onClick={onToggle}>
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>

                    <button className={styles.closeMenuMobile} onClick={() => setIsMobileOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map(item => (
                        <NavLink key={item.to} to={item.to} className={({ isActive }) => 
                            `${styles.navItem} ${isActive ? styles.navActive : ''}`
                        } onClick={() => setIsMobileOpen(false)}>
                            {item.icon}
                            {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.footerUser}>
                        <div className={styles.avatarMini}>{userName[0]}</div>
                        {!isCollapsed && (
                            <div className={styles.userInfo}>
                                <p>{userName}</p>
                                <span onClick={handleLogout}><LogOut size={14} /> Sair</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Topbar */}
            <header className={styles.topbar}>
                <button className={styles.mobileToggle} onClick={() => setIsMobileOpen(!isMobileOpen)}>
                    {isMobileOpen ? <X /> : <Menu />}
                </button>
                
                <h2 className={styles.pageTitle}>Painel Principal</h2>

                <div className={styles.topbarActions}>
                    <div className={styles.userDropdownWrapper}>
                        <div className={styles.userTrigger} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                            <div className={styles.avatar}>{userName[0]}</div>
                            <span className={styles.desktopName}>{userName}</span>
                            <ChevronDown size={16} className={isUserMenuOpen ? styles.rotate : ''} />
                        </div>

                        {isUserMenuOpen && (
                            <div className={styles.dropdownMenu}>
                                <button onClick={() => { navigate('/meus-dados'); setIsUserMenuOpen(false); }}>
                                    <User size={16} /> Meus Dados
                                </button>
                                <button onClick={handleLogout} className={styles.logoutBtn}>
                                    <LogOut size={16} /> Sair do Sistema
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
