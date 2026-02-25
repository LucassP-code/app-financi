import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Mail, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { t } from '../utils/helpers';

export default function HelpPage() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        { q: 'How does the FinBot AI work?', a: 'FinBot uses Google Gemini to analyze your text, audio and images. It automatically creates transactions or budgets when you give a clear command like "I spent $10 on coffee".' },
        { q: 'Is my data secure?', a: 'Yes. We use Supabase with Row Level Security (RLS) ensuring your data is only accessible by you. Passwords are cryptographically hashed.' },
        { q: 'How do I change my currency?', a: 'Go to Profile > Preferences > Region & Language, and select your preferred currency.' }
    ];

    return (
        <div className="page pb-24" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('support')}</p>
                    <h1 style={{ fontSize: 24 }}>{t('helpCenter')}</h1>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                <div className="card-solid" style={{ textAlign: 'center', padding: 32 }}>
                    <HelpCircle size={48} color="var(--primary)" style={{ margin: '0 auto 16px', filter: 'drop-shadow(0 0 12px rgba(142,255,0,0.3))' }} />
                    <h2>{t('howCanWeHelp')}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{t('findAnswers')}</p>
                </div>

                <div className="card-solid">
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t('faq')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {faqs.map((faq, i) => (
                            <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden' }}>
                                <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 500 }}>
                                    {faq.q}
                                    <ChevronDown size={18} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                </div>
                                {openFaq === i && (
                                    <div style={{ padding: '0 16px 16px', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-solid">
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t('contactUs')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <a href="mailto:support@fastsmart.com" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, textDecoration: 'none', color: 'var(--text-primary)' }}>
                            <Mail size={24} color="var(--primary)" style={{ marginBottom: 8 }} />
                            <span style={{ fontWeight: 500 }}>{t('emailSupport')}</span>
                        </a>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, cursor: 'pointer' }}>
                            <MessageCircle size={24} color="var(--primary)" style={{ marginBottom: 8 }} />
                            <span style={{ fontWeight: 500 }}>{t('liveChat')}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
