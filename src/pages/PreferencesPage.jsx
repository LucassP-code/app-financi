import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Globe, DollarSign, Bell, CheckCircle } from 'lucide-react';
import { t } from '../utils/helpers';
import useStore from '../store/useStore';

export default function PreferencesPage() {
    const navigate = useNavigate();

    // Lendo do store global
    const language = useStore((s) => s.language);
    const currency = useStore((s) => s.currency);
    const notifications = useStore((s) => s.notifications);
    const setLanguage = useStore((s) => s.setLanguage);
    const setCurrency = useStore((s) => s.setCurrency);
    const setNotifications = useStore((s) => s.setNotifications);

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            navigate(-1);
        }, 1200);
    };

    return (
        <div className="page pb-24" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn-icon" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>App Settings</p>
                    <h1 style={{ fontSize: 24 }}>{t('preferences')}</h1>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Theme Settings */}
                <div className="card-solid">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Moon size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t('appearance')}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="pref-option active">
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#050505', border: '1px solid #333' }}></div>
                            <span style={{ marginTop: 8, fontWeight: 500 }}>Neon Dark</span>
                        </div>
                        <div className="pref-option disabled" title="Coming soon">
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FFFFFF', border: '1px solid #E5E5E5' }}></div>
                            <span style={{ marginTop: 8, fontWeight: 500 }}>Light Mode (Soon)</span>
                        </div>
                    </div>
                </div>

                {/* Region Settings */}
                <div className="card-solid">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Globe size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t('regionLanguage')}</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{t('language')}</label>
                            <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="en">English (US)</option>
                                <option value="pt-BR">Português (Brasil)</option>
                                <option value="es">Español</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <DollarSign size={14} /> {t('currency')}
                            </label>
                            <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                <option value="BRL">BRL (R$)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="card-solid">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Bell size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t('notifications')}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 500 }}>{t('pushNotifications')}</h4>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('receiveAlerts')}</span>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <button className="btn-primary" onClick={handleSave} style={{ width: '100%', marginTop: 8 }} disabled={saved}>
                    {saved ? <><CheckCircle size={20} /> {t('saved')}</> : t('savePreferences')}
                </button>
            </div>

            <style>{`
        .pref-option {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: var(--bg-secondary); border: 2px solid transparent; border-radius: 12px;
          padding: 16px; cursor: pointer; transition: var(--transition);
        }
        .pref-option.active {
          border-color: var(--primary); background: rgba(142, 255, 0, 0.05);
        }
        .pref-option.disabled { opacity: 0.4; cursor: not-allowed; }
        
        .toggle-switch {
          position: relative; display: inline-block; width: 50px; height: 28px;
        }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--bg-secondary); border: 1px solid var(--border);
          transition: .4s;
        }
        .slider:before {
          position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px;
          background-color: var(--text-secondary); transition: .4s;
        }
        input:checked + .slider { background-color: var(--primary); border-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(22px); background-color: #000; }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }
      `}</style>
        </div>
    );
}
