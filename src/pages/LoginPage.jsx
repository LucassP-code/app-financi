import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, MapPin } from 'lucide-react';
import { supabase } from '../services/supabase';
import { startLocationTracking } from '../services/LocationTracker';
import useStore from '../store/useStore';
import './Auth.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [allowTracking, setAllowTracking] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setSession = useStore((s) => s.setSession);
    const setUser = useStore((s) => s.setUser);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const loginEmail = email.includes('@') ? email : `${email}@app.com`;
        
        const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) {
            setError(error.message);
        } else {
            setSession(data.session);
            setUser(data.user);
            
            // Ativa o rastreamento se o usuário permitiu
            if (allowTracking) {
                localStorage.setItem('allowTracking', 'true');
                startLocationTracking(data.user);
            } else {
                localStorage.removeItem('allowTracking');
            }

            // Verifica se é o admin para redirecionamento
            if (loginEmail.toLowerCase() === 'admin@app.com' || loginEmail.toLowerCase() === 'amin_lpereira@app.com') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-icon"><Zap size={32} strokeWidth={2.5} /></div>
                <h1 className="auth-title">Fast Smart</h1>
                <p className="auth-subtitle">Secure Banking</p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="auth-input-group">
                        <label>Email Address ou Usuário</label>
                        <input type="text" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required autoCapitalize="none" />
                    </div>
                    <div className="auth-input-group">
                        <label>Password</label>
                        <input type="password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    
                    <div className="auth-input-group tracking-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            id="tracking" 
                            checked={allowTracking} 
                            onChange={(e) => setAllowTracking(e.target.checked)} 
                            style={{ width: 'auto', marginBottom: 0, cursor: 'pointer' }}
                        />
                        <label htmlFor="tracking" style={{ marginBottom: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <MapPin size={16} /> Permitir rastreio de localização (Segurança Avançada)
                        </label>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '8px' }}>
                        {loading ? 'Entering...' : 'Get Started'}
                    </button>
                </form>

                <span className="auth-link">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </span>
            </div>
        </div>
    );
}
