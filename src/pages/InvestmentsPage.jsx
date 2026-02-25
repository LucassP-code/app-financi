import { useEffect, useState } from 'react';
import { TrendingUp, Plus, X } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { getInvestments, supabase } from '../services/supabase';
import useStore from '../store/useStore';

export default function InvestmentsPage() {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'renda_fixa', amount: '' });
    const user = useStore((s) => s.user);
    const investments = useStore((s) => s.investments);
    const setInvestments = useStore((s) => s.setInvestments);

    useEffect(() => { if (user) getInvestments(user.id).then(({ data }) => data && setInvestments(data)); }, [user]);

    const total = investments.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
    const totalYield = investments.reduce((s, i) => s + parseFloat(i.current_yield || 0), 0);

    const handleAdd = async () => {
        if (!form.name || !form.amount) return alert('Preencha nome e valor');
        const { error } = await supabase.from('investments').insert({ user_id: user.id, name: form.name, type: form.type, amount: parseFloat(form.amount.replace(',', '.')) });
        if (error) return alert(error.message);
        setShowModal(false); setForm({ name: '', type: 'renda_fixa', amount: '' });
        getInvestments(user.id).then(({ data }) => data && setInvestments(data));
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Investimentos</h1>
                <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Adicionar</button>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
                <div className="card"><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Investido</span><span style={{ fontSize: 28, fontWeight: 800, color: 'var(--cyan)' }}>{formatCurrency(total)}</span></div>
                <div className="card"><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Rendimento</span><span style={{ fontSize: 28, fontWeight: 800, color: 'var(--income)' }}>{formatCurrency(totalYield)}</span></div>
            </div>

            {investments.length === 0 ? (
                <div className="card empty-state"><TrendingUp size={48} /><h3>Sem investimentos</h3><p>Adicione seus investimentos para acompanhar</p></div>
            ) : (
                <div className="card">
                    {investments.map((inv) => (
                        <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                            <div><div style={{ fontWeight: 600, fontSize: 14 }}>{inv.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inv.type}</div></div>
                            <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700, color: 'var(--cyan)' }}>{formatCurrency(inv.amount)}</div></div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2>Novo Investimento</h2><button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <input className="input" placeholder="Nome do investimento" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                <option value="renda_fixa">Renda Fixa</option><option value="acoes">Ações</option><option value="fii">FII</option><option value="cripto">Cripto</option><option value="outros">Outros</option>
                            </select>
                            <input className="input" placeholder="Valor (R$)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                            <button className="btn-primary" onClick={handleAdd} style={{ width: '100%' }}>Adicionar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
