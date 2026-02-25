import { useState } from 'react';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency, getCurrentMonth, t } from '../utils/helpers';
import { supabase } from '../services/supabase';
import useStore from '../store/useStore';

export default function BudgetsPage() {
    const user = useStore((s) => s.user);
    const budgets = useStore((s) => s.budgets);
    const setBudgets = useStore((s) => s.setBudgets);
    const categories = useStore((s) => s.categories);
    const transactions = useStore((s) => s.transactions);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [limit, setLimit] = useState('');
    const [loading, setLoading] = useState(false);

    // Calcula gastos mensais por categoria para o mês atual
    const currentMonth = getCurrentMonth();
    const spendingByCategory = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((acc, t) => {
            acc[t.category_id] = (acc[t.category_id] || 0) + parseFloat(t.amount);
            return acc;
        }, {});

    const handleAddBudget = async (e) => {
        e.preventDefault();
        if (!categoryId || !limit) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('budgets')
            .insert({ user_id: user.id, category_id: categoryId, limit_amount: parseFloat(limit), month: currentMonth })
            .select('*, categories(*)')
            .single();

        if (error) {
            alert(error.message);
        } else {
            setBudgets([...budgets, data]);
            setIsModalOpen(false);
            setLimit('');
        }
        setLoading(false);
    };

    const getPercentage = (spent, limit) => Math.min((spent / limit) * 100, 100);

    return (
        <div className="page pb-24">
            <div className="page-header">
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('spendSmart')}</p>
                    <h1>{t('budgets')}</h1>
                </div>
                <button className="btn-icon" onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={24} />
                </button>
            </div>

            <div className="budget-grid">
                {budgets.length === 0 ? (
                    <div className="empty-state card-solid">
                        <Landmark size={48} />
                        <h3>{t('noBudgets')}</h3>
                        <p>{t('createBudget')}</p>
                        <button className="btn-outline" style={{ marginTop: 16 }} onClick={() => setIsModalOpen(true)}>{t('addBudget')}</button>
                    </div>
                ) : budgets.map(b => {
                    const spent = spendingByCategory[b.category_id] || 0;
                    const pct = getPercentage(spent, b.limit_amount);
                    const isOver = spent >= b.limit_amount;
                    const isWarning = pct >= 80 && !isOver;

                    let statusClass = 'good';
                    if (isOver) statusClass = 'over';
                    else if (isWarning) statusClass = 'warning';

                    return (
                        <div key={b.id} className="card-solid hover-glow">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 20 }}>
                                        {b.categories?.icon || '📦'}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{b.categories?.name}</h3>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pct.toFixed(0)}% Limite atingido</span>
                                    </div>
                                </div>
                                {isOver && <AlertTriangle size={20} color="var(--expense)" />}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-end' }}>
                                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: isOver ? 'var(--expense)' : 'var(--text-primary)' }}>
                                    {formatCurrency(spent)}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>of {formatCurrency(b.limit_amount)}</div>
                            </div>

                            <div className="progress-bar-modern">
                                <div className={`progress-fill-modern ${statusClass}`} style={{ width: `${pct}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsModalOpen(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{t('newBudget')}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleAddBudget} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{t('category')}</label>
                                <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required style={{ WebkitAppearance: 'none' }}>
                                    <option value="">{t('selectCategory')}</option>
                                    {categories.filter(c => c.type === 'expense').map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{t('monthlyLimit')}</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 16, top: 16, color: 'var(--text-muted)' }}>$</span>
                                    <input type="number" step="0.01" className="input" placeholder="0.00" value={limit} onChange={(e) => setLimit(e.target.value)} required style={{ paddingLeft: 32 }} />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 12 }}>
                                {loading ? t('creating') : t('addBudget')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .budget-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
        }
        @media (max-width: 768px) {
          .budget-grid { grid-template-columns: 1fr; }
        }

        .progress-bar-modern {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
        }
        .progress-fill-modern {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .progress-fill-modern.good { background: var(--primary); box-shadow: 0 0 12px var(--primary-muted); }
        .progress-fill-modern.warning { background: var(--warning); box-shadow: 0 0 12px rgba(255, 214, 10, 0.2); }
        .progress-fill-modern.over { background: var(--expense); box-shadow: 0 0 12px rgba(255, 59, 48, 0.2); }
      `}</style>
        </div>
    );
}
