import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2 } from 'lucide-react';
import { t } from '../utils/helpers';

export default function PaymentMethodsPage() {
    const navigate = useNavigate();
    const [cards, setCards] = useState([
        { id: 1, type: 'Visa', last4: '4242', expiry: '12/28', brandColor: '#1A1F71' },
        { id: 2, type: 'Mastercard', last4: '8899', expiry: '08/26', brandColor: '#EB001B' }
    ]);

    const handleRemove = (id) => {
        setCards(cards.filter(c => c.id !== id));
    };

    const handleAdd = () => {
        alert('Funcionalidade de adicionar cartão será interligada com o gateway de pagamento (ex: Stripe).');
    };

    return (
        <div className="page pb-24" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('billing')}</p>
                    <h1 style={{ fontSize: 24 }}>{t('paymentMethods')}</h1>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {cards.map(card => (
                    <div key={card.id} className="card-solid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 48, height: 32, borderRadius: 6, background: card.brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>
                                {card.type.toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ fontSize: 15, fontWeight: 600 }}>{card.type} {t('endingIn')} {card.last4}</h3>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('expires')} {card.expiry}</span>
                            </div>
                        </div>
                        <button className="del-btn modern" onClick={() => handleRemove(card.id)}><Trash2 size={18} /></button>
                    </div>
                ))}

                <button className="btn-outline" onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, borderStyle: 'dashed' }}>
                    <Plus size={20} /> {t('addNewPayment')}
                </button>
            </div>
        </div>
    );
}
