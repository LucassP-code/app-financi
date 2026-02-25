import { useState, useMemo } from 'react';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency, formatDate, t } from '../utils/helpers';
import { deleteTransaction } from '../services/supabase';
import useStore from '../store/useStore';

export default function TransactionsPage() {
    const transactions = useStore((s) => s.transactions);
    const removeTransaction = useStore((s) => s.removeTransaction);
    const language = useStore((s) => s.language);
    const currency = useStore((s) => s.currency);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filtered = useMemo(() => {
        return transactions.filter(t => {
            const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) ||
                t.categories?.name?.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === 'all' || t.type === filter;
            return matchSearch && matchFilter;
        });
    }, [transactions, search, filter]);

    const handleDelete = async (id) => {
        if (window.confirm('Excluir transação permanentemente?')) {
            const { error } = await deleteTransaction(id);
            if (!error) removeTransaction(id);
        }
    };

    return (
        <div className="page pb-24">
            <div className="page-header">
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('allTransactions')}</p>
                    <h1>{t('transactions')}</h1>
                </div>
            </div>

            <div className="card-solid" style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
                    <Search size={18} style={{ position: 'absolute', left: 16, top: 18, color: 'var(--text-muted)' }} />
                    <input
                        className="input"
                        placeholder={t('searchTransactions')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: 44 }}
                    />
                </div>
                <div className="filter-group" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {['all', 'income', 'expense'].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? t('all') : f === 'income' ? t('income') : t('expense')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="tx-list">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <Filter size={48} />
                        <h3>{t('noTransactionsYet')}</h3>
                        <p>{t('searchTransactions')}</p>
                    </div>
                ) : filtered.map((t) => (
                    <div key={t.id} className="tx-row-modern hover-glow">
                        <div className="tx-left">
                            <div className="tx-icon-wrapper" style={{ background: t.type === 'income' ? 'var(--primary-muted)' : 'rgba(255, 59, 48, 0.1)', color: t.type === 'income' ? 'var(--primary)' : 'var(--expense)' }}>
                                {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div className="tx-info-modern">
                                <span className="tx-title">{t.description || t.categories?.name || 'Transaction'}</span>
                                <span className="tx-time">{formatDate(t.date)} • {t.categories?.name}</span>
                            </div>
                        </div>
                        <div className="tx-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span className={`tx-amt-modern ${t.type}`}>
                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                            </span>
                            <button className="del-btn modern" onClick={() => handleDelete(t.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .filter-btn {
          padding: 12px 24px;
          border-radius: var(--radius-full);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          font-weight: 600;
          font-size: 14px;
          transition: var(--transition);
          white-space: nowrap;
        }
        .filter-btn:hover { border-color: var(--border-light); color: var(--text-primary); }
        .filter-btn.active {
          background: var(--primary);
          color: var(--text-on-primary);
          border-color: var(--primary);
          box-shadow: var(--shadow-glow);
        }
        .del-btn.modern {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          color: var(--text-muted);
          transition: var(--transition);
        }
        .del-btn.modern:hover {
          background: rgba(255, 59, 48, 0.1);
          color: var(--expense);
        }
      `}</style>
        </div>
    );
}
