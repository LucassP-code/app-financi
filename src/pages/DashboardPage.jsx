import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, Landmark, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate, t } from '../utils/helpers';
import { getTransactions, getCategories } from '../services/supabase';
import useStore from '../store/useStore';
import './Dashboard.css';

export default function DashboardPage() {
    const user = useStore((s) => s.user);
    const transactions = useStore((s) => s.transactions);
    const setTransactions = useStore((s) => s.setTransactions);
    const getSummary = useStore((s) => s.getSummary);
    const setCategories = useStore((s) => s.setCategories);
    const language = useStore((s) => s.language);
    const currency = useStore((s) => s.currency);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            getTransactions(user.id).then(({ data }) => data && setTransactions(data));
            getCategories().then(({ data }) => data && setCategories(data));
        }
    }, [user]);

    const summary = getSummary();
    const recent = transactions.slice(0, 5);

    // Chart data (last 7 days)
    const chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const day = d.toLocaleDateString('en-US', { weekday: 'short' }); // Inspiração usa inglês: Mon, Tue, etc
        const income = transactions.filter(t => t.type === 'income' && new Date(t.date).toDateString() === d.toDateString()).reduce((s, t) => s + parseFloat(t.amount), 0);
        const expense = transactions.filter(t => t.type === 'expense' && new Date(t.date).toDateString() === d.toDateString()).reduce((s, t) => s + parseFloat(t.amount), 0);
        return { day, [t('income')]: income, [t('expense')]: expense };
    });

    const actions = [
        { icon: ArrowUpRight, label: t('send'), path: '/add' },
        { icon: ArrowDownLeft, label: t('receive'), path: '/add' },
        { icon: RefreshCcw, label: t('swap'), path: '/investments' },
        { icon: Landmark, label: t('payBills'), path: '/budgets' },
    ];

    return (
        <div className="page dashboard-page">
            <div className="dash-header-mobile mobile-only-flex">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="user-avatar-small">
                        {user?.user_metadata?.full_name?.charAt(0) || 'H'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('welcomeBack')}</span>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{t('hi')} {user?.user_metadata?.full_name?.split(' ')[0] || t('user')}</span>
                    </div>
                </div>
            </div>

            <div className="page-header desktop-only">
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('welcomeBack')}</p>
                    <h1>{t('overview')}</h1>
                </div>
            </div>

            {/* Virtual Credit Card - The Hero Section */}
            <div className="credit-card-container">
                <div className="virtual-card glass">
                    <div className="card-top">
                        <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="24" rx="4" fill="#E8AA32" />
                            <path d="M4 12H28" stroke="black" strokeWidth="2" />
                            <path d="M12 4V20" stroke="black" strokeWidth="2" />
                        </svg>
                        <div className="visa-badge">VISA</div>
                    </div>

                    <div className="card-middle">
                        <span className="card-label">{t('totalBalance')}</span>
                        <div className="card-balance">{formatCurrency(summary.balance)}</div>
                    </div>

                    <div className="card-bottom">
                        <div className="card-info-group">
                            <span className="info-label">{t('cardHolder')}</span>
                            <span className="info-value">{user?.user_metadata?.full_name || 'Gabi Martins'}</span>
                        </div>
                        <div className="card-info-group text-center">
                            <span className="info-label">{t('expireDate')}</span>
                            <span className="info-value">02/29</span>
                        </div>
                        <div className="card-info-group text-right">
                            <span className="info-label">CVV</span>
                            <span className="info-value">***</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Baseado na Inspiração */}
            <div className="quick-actions-section">
                <h3 className="section-title">{t('quickActions')}</h3>
                <div className="qa-grid">
                    {actions.map(({ icon: I, label, path }) => (
                        <div key={label} className="qa-item" onClick={() => navigate(path)}>
                            <button className="qa-btn">
                                <I size={22} strokeWidth={2} />
                            </button>
                            <span className="qa-label">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dash-grid">
                {/* Recent Transactions */}
                <div className="list-section">
                    <div className="section-header">
                        <h3 className="section-title">{t('recentTransactions')}</h3>
                        <button className="see-all-btn" onClick={() => navigate('/transactions')}>{t('seeAll')}</button>
                    </div>

                    <div className="tx-list">
                        {recent.length === 0 ? (
                            <p className="empty-tx">{t('noTransactionsYet')}</p>
                        ) : recent.map((t) => (
                            <div key={t.id} className="tx-row-modern hover-glow">
                                <div className="tx-left">
                                    <div className="tx-icon-wrapper">
                                        <span className="tx-emoji">{t.categories?.name?.charAt(0) || '💰'}</span>
                                    </div>
                                    <div className="tx-info-modern">
                                        <span className="tx-title">{t.description || t.categories?.name || 'Transaction'}</span>
                                        <span className="tx-time">Today {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="tx-right">
                                    <span className={`tx-amt-modern ${t.type}`}>
                                        {t.type === 'income' ? '↗ ' : '↘ '}
                                        {formatCurrency(t.amount)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analytics Chart */}
                <div className="chart-section">
                    <div className="section-header">
                        <h3 className="section-title">{t('incomeBreakdown')}</h3>
                        <button className="expand-btn"><ArrowUpRight size={18} /></button>
                    </div>
                    <div className="card-solid chart-container">
                        <div className="chart-stat">
                            <span className="badge badge-income">{formatCurrency(summary.totalIncome)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: '#121212', border: '1px solid #1E1E1E', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                                    formatter={(v) => formatCurrency(v)}
                                />
                                <Line type="monotone" dataKey={t('income')} stroke="#00E676" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#00E676', stroke: '#050505', strokeWidth: 4 }} />
                                <Line type="monotone" dataKey={t('expense')} stroke="#FF5252" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#FF5252', stroke: '#050505', strokeWidth: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
