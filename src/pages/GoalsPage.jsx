import { useState, useEffect } from 'react';
import { PlusCircle, Target } from 'lucide-react';
import { supabase } from '../services/supabase';
import { formatCurrency, t } from '../utils/helpers';
import useStore from '../store/useStore';

export default function GoalsPage() {
    const user = useStore(s => s.user);
    const goals = useStore(s => s.goals);
    const setGoals = useStore(s => s.setGoals);
    const language = useStore(s => s.language);
    const currency = useStore(s => s.currency);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
                .then(({ data }) => data && setGoals(data));
        }
    }, [user]);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!name || !targetAmount || loading) return;
        setLoading(true);

        const { data, error } = await supabase.from('goals')
            .insert({ user_id: user.id, name, target_amount: parseFloat(targetAmount), current_amount: 0, target_date: targetDate || null })
            .select().single();

        if (error) alert(error.message);
        else { setGoals([data, ...goals]); setIsModalOpen(false); setName(''); setTargetAmount(''); setTargetDate(''); }
        setLoading(false);
    };

    const getPercentage = (current, target) => Math.min((current / target) * 100, 100);

    return (
        <div className="page pb-24">
            <div className="page-header">
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('savings')}</p>
                    <h1>{t('lifeGoals')}</h1>
                </div>
                <button className="btn-icon" onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={24} />
                </button>
            </div>

            <div className="grid-2">
                {goals.length === 0 ? (
                    <div className="empty-state card-solid" style={{ gridColumn: '1 / -1' }}>
                        <Target size={48} />
                        <h3>{t('noGoals')}</h3>
                        <p>{t('whatSavingFor')}</p>
                        <button className="btn-outline" style={{ marginTop: 16 }} onClick={() => setIsModalOpen(true)}>{t('createGoal')}</button>
                    </div>
                ) : goals.map(g => {
                    const pct = getPercentage(g.current_amount, g.target_amount);
                    return (
                        <div key={g.id} className="card-solid hover-glow">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary-muted)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{g.name}</h3>
                                    {g.target_date && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Target: {new Date(g.target_date).toLocaleDateString()}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'flex-end' }}>
                                <div>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>{t('saved2')}</span>
                                    <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', letterSpacing: -0.5 }}>{formatCurrency(g.current_amount)}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>{t('goal')}</span>
                                    <span style={{ fontSize: 16, fontWeight: 600 }}>{formatCurrency(g.target_amount)}</span>
                                </div>
                            </div>

                            <div className="progress-bar-modern">
                                <div className="progress-fill-modern good" style={{ width: `${pct}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsModalOpen(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{t('newGoal')}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{t('goalName')}</label>
                                <input className="input" placeholder="e.g. New Car, Vacation" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{t('targetAmount')}</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 16, top: 16, color: 'var(--text-muted)' }}>$</span>
                                    <input type="number" step="0.01" className="input" placeholder="0.00" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required style={{ paddingLeft: 32 }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{t('targetDate')}</label>
                                <input type="date" className="input" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 12 }}>
                                {loading ? t('creating') : t('createGoal')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
