import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { addTransaction } from '../services/supabase';
import { t } from '../utils/helpers';
import useStore from '../store/useStore';

export default function AddTransactionPage() {
    const navigate = useNavigate();
    const user = useStore((s) => s.user);
    const categories = useStore((s) => s.categories);
    const addTransactionToStore = useStore((s) => s.addTransaction);
    const language = useStore((s) => s.language);
    const currency = useStore((s) => s.currency);

    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const activeCategories = categories.filter(c => c.type === type);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !categoryId || loading) return;
        setLoading(true);

        const { data, error } = await addTransaction({
            user_id: user.id,
            type,
            amount: parseFloat(amount),
            description,
            category_id: categoryId,
            date: new Date().toISOString()
        });

        setLoading(false);
        if (error) alert(error.message);
        if (data) {
            addTransactionToStore(data);
            setSuccess(true);
            setTimeout(() => navigate('/'), 1500);
        }
    };

    if (success) {
        return (
            <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-muted)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'slideUp 0.4s ease' }}>
                    <CheckCircle2 size={40} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{t('saved')}!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard')}...</p>
            </div>
        );
    }

    return (
        <div className="page pb-24" style={{ maxWidth: 600 }}>
            <div className="page-header">
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('newTransaction')}</p>
                    <h1>{t('addTransaction')}</h1>
                </div>
            </div>

            <div className="card-solid">
                <div className="type-toggle modern">
                    <button
                        className={`toggle-btn ${type === 'income' ? 'income-active' : ''}`}
                        onClick={() => setType('income')}
                    >
                        <ArrowDownLeft size={18} /> {t('receive')}
                    </button>
                    <button
                        className={`toggle-btn ${type === 'expense' ? 'expense-active' : ''}`}
                        onClick={() => setType('expense')}
                    >
                        <ArrowUpRight size={18} /> {t('send')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 32 }}>
                    <div className="amount-input-wrapper">
                        <span className="currency-symbol">{currency === 'BRL' ? 'R$' : currency === 'EUR' ? '€' : '$'}</span>
                        <input
                            type="number"
                            step="0.01"
                            className="amount-input"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{t('description').toUpperCase()}</label>
                        <input
                            className="input"
                            placeholder={t('addDescription')}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{t('category').toUpperCase()}</label>
                        <div className="category-grid modern">
                            {activeCategories.map(c => (
                                <div
                                    key={c.id}
                                    className={`cat-pill ${categoryId === c.id ? 'active' : ''}`}
                                    onClick={() => setCategoryId(c.id)}
                                >
                                    <span className="cat-icon">{c.icon}</span>
                                    <span className="cat-name">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading || !amount || !categoryId} style={{ marginTop: 16 }}>
                        {loading ? t('creating') : t('create') + ' ' + t('transaction')}
                    </button>
                </form>
            </div>

            <style>{`
        .type-toggle.modern {
          display: flex;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          padding: 6px;
          gap: 6px;
          border: 1px solid var(--border);
        }
        .toggle-btn {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 15px;
          transition: var(--transition);
        }
        .toggle-btn.income-active {
          background: var(--primary); color: #000; box-shadow: var(--shadow-glow);
        }
        .toggle-btn.expense-active {
          background: var(--expense); color: #fff; box-shadow: 0 0 24px rgba(255, 59, 48, 0.2);
        }
        
        .amount-input-wrapper {
          display: flex; align-items: center; justify-content: center;
          padding: 20px 0 10px;
        }
        .currency-symbol {
          font-size: 48px; font-weight: 800; color: var(--text-secondary); margin-right: 8px;
        }
        .amount-input {
          font-size: 56px; font-weight: 800; color: var(--text-primary);
          background: transparent; border: none; outline: none;
          width: 50%; width: 220px;
          letter-spacing: -1px;
        }
        .amount-input::placeholder { color: var(--text-secondary); opacity: 0.3; }
        
        .category-grid.modern {
          display: flex; flex-wrap: wrap; gap: 10px;
        }
        .cat-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 18px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition);
        }
        .cat-pill:hover { border-color: var(--primary); }
        .cat-pill.active {
          background: rgba(142, 255, 0, 0.1);
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: inset 0 0 0 1px var(--primary);
        }
        .cat-name { font-size: 14px; font-weight: 500; }
        .cat-icon { font-size: 16px; }
      `}</style>
        </div>
    );
}
