import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, getCurrentMonth, t } from '../utils/helpers';
import useStore from '../store/useStore';

export default function ReportsPage() {
    const transactions = useStore((s) => s.transactions);
    const categories = useStore((s) => s.categories);
    const language = useStore((s) => s.language);
    const currency = useStore((s) => s.currency);

    const currentMonth = getCurrentMonth();
    const monthlyTx = useMemo(() => transactions.filter(t => t.date.startsWith(currentMonth)), [transactions, currentMonth]);

    const stats = useMemo(() => {
        let income = 0, expense = 0;
        monthlyTx.forEach(t => t.type === 'income' ? income += parseFloat(t.amount) : expense += parseFloat(t.amount));
        return { income, expense, balance: income - expense };
    }, [monthlyTx]);

    // Data for Category Pie Chart (Expenses)
    const pieData = useMemo(() => {
        const expenses = monthlyTx.filter(t => t.type === 'expense');
        const grouped = expenses.reduce((acc, t) => {
            acc[t.category_id] = (acc[t.category_id] || 0) + parseFloat(t.amount);
            return acc;
        }, {});

        return Object.entries(grouped).map(([id, amount]) => {
            const cat = categories.find(c => c.id === id);
            return { name: cat?.name || 'Others', value: amount, color: cat?.color || '#555' };
        }).sort((a, b) => b.value - a.value);
    }, [monthlyTx, categories]);

    const COLORS = ['var(--primary)', '#26A69A', '#66BB6A', '#9CCC65', '#D4E157', '#FFEE58'];

    // Data for Income vs Expense Bar Chart
    const barData = [
        { name: 'Income', amount: stats.income, fill: 'var(--income)' },
        { name: 'Expense', amount: stats.expense, fill: 'var(--expense)' }
    ];

    return (
        <div className="page pb-24">
            <div className="page-header">
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('analytics')}</p>
                    <h1>{t('overviewReports')}</h1>
                </div>
            </div>

            <div className="grid-3" style={{ marginBottom: 32 }}>
                <div className="card-solid" style={{ borderLeft: '4px solid var(--income)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('totalIncome')}</span>
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, letterSpacing: -0.5 }}>{formatCurrency(stats.income)}</div>
                </div>
                <div className="card-solid" style={{ borderLeft: '4px solid var(--expense)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('totalExpense')}</span>
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, letterSpacing: -0.5 }}>{formatCurrency(stats.expense)}</div>
                </div>
                <div className="card-solid" style={{ borderLeft: '4px solid var(--primary)', background: 'rgba(142, 255, 0, 0.05)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('netBalance')}</span>
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: 'var(--text-primary)', letterSpacing: -0.5 }}>{formatCurrency(stats.balance)}</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card-solid">
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>{t('expenseByCategory')}</h3>
                    {pieData.length === 0 ? (
                        <div className="empty-state" style={{ padding: 40 }}>
                            <p>{t('noExpensesMonth')}</p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData} innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: 'drop-shadow(0 0 10px rgba(142,255,0,0.2))' }} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{ background: '#121212', border: '1px solid #1E1E1E', borderRadius: 8, color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontWeight: 600 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center Total */}
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>{t('totalSpend')}</span>
                                <span style={{ fontSize: 18, fontWeight: 800 }}>{formatCurrency(stats.expense)}</span>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20, justifyContent: 'center' }}>
                        {pieData.map((d, i) => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }}></span>
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-solid">
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>{t('incomeVsExpense')}</h3>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={60}>
                                <XAxis dataKey="name" stroke="var(--text-secondary)" axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" axisLine={false} tickLine={false} hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{ background: '#121212', border: '1px solid #1E1E1E', borderRadius: 8 }}
                                />
                                <Bar dataKey="amount" radius={[8, 8, 8, 8]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
