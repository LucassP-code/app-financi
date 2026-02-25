import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { supabase } from '../services/supabase';
import useStore from '../store/useStore';
import './Auth.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setSession = useStore((s) => s.setSession);
    const setUser = useStore((s) => s.setUser);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else {
            setSession(data.session);
            setUser(data.user);
            navigate('/');
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
                        <label>Email Address</label>
                        <input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="auth-input-group">
                        <label>Password</label>
                        <input type="password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
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
