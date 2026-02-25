import { useState, useRef, useEffect } from 'react';
import { Send, Camera, Trash2, CheckCircle, Mic, MicOff, Loader, Zap } from 'lucide-react';
import { sendMessage, analyzeImage, clearChat } from '../services/gemini';
import { addTransaction, supabase } from '../services/supabase';
import { formatCurrency, getCurrentMonth } from '../utils/helpers';
import useStore from '../store/useStore';
import './AIAgent.css';

export default function AIAgentPage() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [recording, setRecording] = useState(false);
    const chatEndRef = useRef(null);
    const fileRef = useRef(null);
    const recognitionRef = useRef(null);
    const chatMessages = useStore((s) => s.chatMessages);
    const addChatMessage = useStore((s) => s.addChatMessage);
    const storeClearChat = useStore((s) => s.clearChat);
    const transactions = useStore((s) => s.transactions);
    const setTransactions = useStore((s) => s.setTransactions);
    const getSummary = useStore((s) => s.getSummary);
    const user = useStore((s) => s.user);
    const goals = useStore((s) => s.goals);
    const setGoals = useStore((s) => s.setGoals);
    const budgets = useStore((s) => s.budgets);
    const setBudgets = useStore((s) => s.setBudgets);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.interimResults = false;
            recognition.continuous = false;
            recognition.maxAlternatives = 1;
            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                setInput(prev => prev ? prev + ' ' + transcript : transcript);
            };
            recognition.onerror = () => setRecording(false);
            recognition.onend = () => setRecording(false);
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) return alert('Navegador não suporta gravação nativa. Use Chrome.');
        if (recording) { recognitionRef.current.stop(); setRecording(false); }
        else { setInput(''); recognitionRef.current.start(); setRecording(true); }
    };

    const buildContext = () => {
        const s = getSummary();
        return JSON.stringify({ saldo: s.balance, receitas: s.totalIncome, despesas: s.totalExpense });
    };

    const executeActions = async (actions) => {
        const results = [];
        for (const action of actions) {
            try {
                if (action.actionType === 'transaction') {
                    const { data, error } = await addTransaction({ user_id: user.id, type: action.type, amount: action.amount, description: action.description, category_id: action.category_id, date: new Date(action.date || Date.now()).toISOString() });
                    if (!error && data) { setTransactions([data, ...transactions]); results.push(`✅ ${action.type === 'income' ? 'Received' : 'Sent'}: ${formatCurrency(action.amount)}`); }
                } else if (action.actionType === 'goal') {
                    const { error } = await supabase.from('goals').insert({ user_id: user.id, name: action.name, target_amount: action.target_amount, current_amount: action.current_amount || 0, target_date: new Date(Date.now() + 90 * 86400000).toISOString() });
                    if (!error) { const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); setGoals(data); results.push(`✅ Goal: ${action.name}`); }
                } else if (action.actionType === 'budget') {
                    const { error } = await supabase.from('budgets').insert({ user_id: user.id, category_id: action.category_id, limit_amount: action.limit_amount, month: getCurrentMonth() });
                    if (!error) { const { data } = await supabase.from('budgets').select('*, categories(*)').eq('user_id', user.id).eq('month', getCurrentMonth()); setBudgets(data); results.push(`✅ Budget limit set`); }
                }
            } catch (err) { results.push(`❌ Failed`); }
        }
        return results;
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        if (recording) { recognitionRef.current?.stop(); setRecording(false); }
        const msg = input.trim();
        addChatMessage({ role: 'user', text: msg, ts: Date.now() });
        setInput(''); setLoading(true);

        const { response, actions, error } = await sendMessage(msg, buildContext());
        let actionResults = [];
        if (actions?.length > 0) actionResults = await executeActions(actions);

        addChatMessage({ role: 'assistant', text: response || error || 'Erro', actionResults, ts: Date.now() });
        setLoading(false);
    };

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result.split(',')[1];
            addChatMessage({ role: 'user', text: '📷 Invoice Document', imageUrl: reader.result, ts: Date.now() });
            setLoading(true);
            const { response, actions, error } = await analyzeImage(base64, file.type || 'image/jpeg');
            let actionResults = [];
            if (actions?.length > 0) actionResults = await executeActions(actions);
            addChatMessage({ role: 'assistant', text: response || error || 'Erro', actionResults, ts: Date.now() });
            setLoading(false);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    return (
        <div className="ai-container" style={{ paddingTop: 20 }}>
            {/* Super Header Premium */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
                        <Zap size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>FinBot IA</h2>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Smart Financial Assistant</span>
                    </div>
                </div>
                <button className="del-btn modern" onClick={() => { clearChat(); storeClearChat(); }}><Trash2 size={18} /></button>
            </div>

            <div className="ai-messages" style={{ background: 'transparent', padding: '0 24px' }}>
                {chatMessages.length === 0 ? (
                    <div className="empty-state card-solid" style={{ margin: 'auto' }}>
                        <Zap size={48} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 10px rgba(142,255,0,0.5))' }} />
                        <h3>Ask anything</h3>
                        <p>Tell me what you spent, upload an invoice, or use audio.</p>
                        <div className="grid-2" style={{ gap: 8, marginTop: 16 }}>
                            {["I spent $45 on food", "Create a $5k goal", "Upload receipt", "Speak to record"].map((p, i) => (
                                <button key={i} className="ai-prompt-btn dark-pill" onClick={() => {
                                    if (p.includes('Upload')) fileRef.current?.click();
                                    else if (p.includes('Speak')) toggleRecording();
                                    else setInput(p);
                                }}>{p}</button>
                            ))}
                        </div>
                    </div>
                ) : (
                    chatMessages.map((m, i) => (
                        <div key={i} className={`ai-msg ${m.role === 'user' ? 'user' : 'bot'}`}>
                            <div className={`ai-bubble ${m.role} glass-bubble`}>
                                {m.imageUrl && <img src={m.imageUrl} alt="Doc" className="ai-img" />}
                                <div className="ai-text">{m.text}</div>
                                {m.actionResults?.length > 0 && (
                                    <div className="ai-action-results">
                                        {m.actionResults.map((r, j) => (
                                            <div key={j} className="ai-action-item premium">
                                                <CheckCircle size={14} color="var(--primary)" /> {r}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="ai-typing">
                        <Zap size={16} className="ai-pulse-neon" />
                        <span style={{ color: 'var(--primary)' }}>FinBot is typing...</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div style={{ padding: '16px 24px', position: 'relative' }}>
                <div className="ai-input-bar premium-glass-bar">
                    <input type="file" ref={fileRef} accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
                    <button className="ai-tool-btn" onClick={() => fileRef.current?.click()}><Camera size={20} /></button>
                    <button className={`ai-tool-btn ${recording ? 'recording' : ''}`} onClick={toggleRecording}>
                        {recording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <input
                        className="ai-input"
                        placeholder={recording ? 'Ouvindo...' : 'Message FinBot...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        style={{ background: 'transparent', border: 'none', boxShadow: 'none', flex: 1, minWidth: 0, fontSize: 16, color: '#fff', outline: 'none' }}
                    />

                    <button className="ai-send-btn neon" onClick={handleSend} disabled={!input.trim() || loading}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
