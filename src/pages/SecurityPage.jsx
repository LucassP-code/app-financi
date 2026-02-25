import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Key, Smartphone, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { t } from '../utils/helpers';

export default function SecurityPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [twoFA, setTwoFA] = useState(false);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) setMsg({ type: 'error', text: error.message });
        else {
            setMsg({ type: 'success', text: 'Password updated successfully!' });
            setPassword('');
        }
        setLoading(false);
    };

    return (
        <div className="page pb-24" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('accountProtection')}</p>
                    <h1 style={{ fontSize: 24 }}>{t('security')}</h1>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {msg && (
                    <div style={{ padding: 16, borderRadius: 8, background: msg.type === 'error' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(142, 255, 0, 0.1)', color: msg.type === 'error' ? 'var(--expense)' : 'var(--primary)', border: `1px solid ${msg.type === 'error' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(142, 255, 0, 0.2)'}` }}>
                        {msg.text}
                    </div>
                )}

                <div className="card-solid">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Key size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t('changePassword')}</h3>
                    </div>
                    <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <input type="password" className="input" placeholder={t('newPassword')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                        <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('updating') : t('updatePassword')}</button>
                    </form>
                </div>

                <div className="card-solid">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Smartphone size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t('twoFactorAuth')}</h3>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', mb: 16 }}>{t('addExtraLayer')}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                        <span style={{ fontWeight: 500 }}>{t('authenticatorApp')}</span>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
}
