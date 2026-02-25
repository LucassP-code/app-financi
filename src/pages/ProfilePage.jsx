import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, CreditCard, Shield, HelpCircle, ChevronRight, Bot } from 'lucide-react';
import { supabase } from '../services/supabase';
import { t } from '../utils/helpers';
import useStore from '../store/useStore';

export default function ProfilePage() {
    const user = useStore((s) => s.user);
    const clearStore = useStore((s) => s.clearStore);
    const language = useStore((s) => s.language);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        clearStore();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const menuItems = [
        { icon: Settings, label: t('preferences'), desc: t('themeCurrencyLang'), action: () => navigate('/preferences') },
        { icon: CreditCard, label: t('paymentMethods'), desc: t('cardsAndBanks'), action: () => navigate('/payment-methods') },
        { icon: Bot, label: 'FinBot IA', desc: t('aiSettings'), action: () => navigate('/ai') },
        { icon: Shield, label: t('security'), desc: t('password2FA'), action: () => navigate('/security') },
        { icon: HelpCircle, label: t('help'), desc: t('faqContact'), action: () => navigate('/help') },
    ];

    return (
        <div className="page pb-24">
            <div className="page-header desktop-only">
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('yourAccount')}</p>
                    <h1>{t('profile')}</h1>
                </div>
            </div>

            <div className="profile-hero mobile-only-flex">
                <h1 style={{ fontSize: 28, fontWeight: 800 }}>{t('profile')}</h1>
                <button className="logout-icon-btn" onClick={handleLogout}><LogOut size={20} /></button>
            </div>

            <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* Profile Card Center */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 20 }}>
                    <div className="avatar-xl">
                        {getInitials(user?.user_metadata?.full_name)}
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 16 }}>{user?.user_metadata?.full_name || t('user')}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{user?.email}</p>
                    <button className="btn-outline" style={{ marginTop: 24 }}>{t('editProfile')}</button>
                </div>

                {/* Menu List */}
                <div className="card-solid" style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column' }}>
                    {menuItems.map((m, i) => (
                        <div key={i} className="menu-row" onClick={m.action}>
                            <div className="menu-icon"><m.icon size={20} /></div>
                            <div className="menu-text">
                                <span className="menu-title">{m.label}</span>
                                <span className="menu-desc">{m.desc}</span>
                            </div>
                            <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    ))}
                </div>

                <button className="logout-btn-large desktop-only" onClick={handleLogout}>
                    <LogOut size={20} /> {t('logout')}
                </button>

            </div>

            <style>{`
        .profile-hero {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;
        }
        .logout-icon-btn {
          width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 59, 48, 0.1); color: var(--expense);
          display: flex; align-items: center; justify-content: center;
        }
        .avatar-xl {
          width: 100px; height: 100px; border-radius: 50%;
          background: var(--primary-muted); color: var(--primary);
          font-size: 36px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--primary);
          box-shadow: var(--shadow-glow);
        }
        
        .menu-row {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer; transition: var(--transition);
        }
        .menu-row:last-child { border-bottom: none; }
        .menu-row:hover { opacity: 0.8; transform: translateX(4px); }
        .menu-row:hover .menu-icon { color: var(--primary); border-color: var(--primary); }
        
        .menu-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: var(--bg-secondary); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center; color: var(--text-primary);
          transition: var(--transition);
        }
        .menu-text { flex: 1; display: flex; flex-direction: column; }
        .menu-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .menu-desc { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }

        .logout-btn-large {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 16px; border-radius: var(--radius-full);
          background: rgba(255, 59, 48, 0.1); color: var(--expense);
          font-weight: 700; font-size: 15px; border: 1px solid rgba(255, 59, 48, 0.2);
          transition: var(--transition); cursor: pointer;
        }
        .logout-btn-large:hover { background: rgba(255, 59, 48, 0.2); }
      `}</style>
        </div>
    );
}
