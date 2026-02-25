import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { supabase } from '../services/supabase';
import './Auth.css';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });

        if (signUpError) setError(signUpError.message);
        else {
            alert('Account created! You can now sign in.');
            navigate('/login');
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-icon" style={{ width: 48, height: 48, marginBottom: 16 }}><Zap size={24} strokeWidth={2.5} /></div>
                <h1 className="auth-title" style={{ fontSize: 24 }}>Create Account</h1>
                <p className="auth-subtitle" style={{ marginBottom: 24 }}>Join our smart financial life.</p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="auth-input-group">
                        <label>Full Name</label>
                        <input type="text" className="auth-input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="auth-input-group">
                        <label>Email</label>
                        <input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="auth-input-group">
                        <label>Password</label>
                        <input type="password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="auth-input-group">
                        <label>Confirm Password</label>
                        <input type="password" className="auth-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>

                <span className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </span>
            </div>
        </div>
    );
}
