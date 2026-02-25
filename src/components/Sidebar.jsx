import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PlusCircle, TrendingUp, Target, Wallet, BarChart3, Bot, User, LogOut } from 'lucide-react';
import { signOut } from '../services/supabase';
import { t } from '../utils/helpers';
import useStore from '../store/useStore';
import './Sidebar.css';

export default function Sidebar() {
    const user = useStore((s) => s.user);
    const setUser = useStore((s) => s.setUser);
    const language = useStore((s) => s.language); // forçar re-render ao trocar idioma
    const navigate = useNavigate();

    const links = [
        { to: '/', icon: LayoutDashboard, label: t('dashboard') },
        { to: '/transactions', icon: ArrowLeftRight, label: t('transactions') },
        { to: '/add', icon: PlusCircle, label: t('add') },
        { to: '/investments', icon: TrendingUp, label: 'Investments' },
        { to: '/goals', icon: Target, label: t('goals') },
        { to: '/budgets', icon: Wallet, label: t('budgets') },
        { to: '/reports', icon: BarChart3, label: t('reports') },
        { to: '/ai', icon: Bot, label: 'FinBot IA' },
        { to: '/profile', icon: User, label: t('profile') },
    ];

    const handleLogout = async () => {
        await signOut();
        setUser(null);
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">₣</div>
                <span className="logo-text">Financi</span>
            </div>

            <nav className="sidebar-nav">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end={to === '/'}>
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="user-avatar">{user?.user_metadata?.full_name?.charAt(0) || 'U'}</div>
                    <div className="user-info">
                        <span className="user-name">{user?.user_metadata?.full_name || 'Usuário'}</span>
                        <span className="user-email">{user?.email || ''}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout} title={t('logout')}>
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
}
