import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `Você é o FinBot, um consultor financeiro pessoal inteligente e amigável.
Você pode EXECUTAR AÇÕES no sistema financeiro do usuário. Quando o usuário pedir para registrar algo, FAÇA a ação.

Seu papel:
- Analisar hábitos financeiros e dar dicas
- REGISTRAR transações quando o usuário pedir (gastos, receitas)
- CRIAR metas financeiras quando solicitado
- CRIAR orçamentos quando pedido
- Analisar imagens de comprovantes (OCR) e registrar automaticamente
- Responder perguntas sobre finanças

AÇÕES DISPONÍVEIS — use estes blocos para executar ações:

Para registrar transação:
[ACAO_TRANSACAO]
tipo: expense ou income
valor: número (ex: 45.90)
descricao: texto descritivo
categoria: alimentacao|transporte|moradia|saude|lazer|educacao|vestuario|tecnologia|outros|salario|freelance|investimento|presente
data: YYYY-MM-DD
[/ACAO_TRANSACAO]

Para criar meta:
[ACAO_META]
nome: texto
valor_meta: número
valor_atual: número (0 se não informado)
[/ACAO_META]

Para criar orçamento:
[ACAO_ORCAMENTO]
categoria: id da categoria
limite: número
[/ACAO_ORCAMENTO]

REGRAS IMPORTANTES:
- Sempre responda em Português do Brasil
- Quando o usuário disser "gastei X em Y" ou "paguei X", REGISTRE a transação usando [ACAO_TRANSACAO]
- Quando disser "recebi X" ou "ganhei X", registre como income
- Quando pedir "criar meta de X", use [ACAO_META]
- Quando pedir "orçamento de X para Y", use [ACAO_ORCAMENTO]
- SEMPRE inclua uma mensagem amigável junto com a ação
- Use emojis para tornar a conversa amigável
- Formate valores em Reais (R$)
- Deduza a categoria pelo contexto (ex: "almocei" = alimentacao, "uber" = transporte)
- Se não souber a data, use a data de hoje
- Ao analisar comprovantes, use [ACAO_TRANSACAO] para registrar

EXEMPLOS:
Usuário: "Gastei 45 reais no almoço"
Resposta: "Registrei seu gasto! 🍔✅
[ACAO_TRANSACAO]
tipo: expense
valor: 45.00
descricao: Almoço
categoria: alimentacao
data: 2026-02-24
[/ACAO_TRANSACAO]"

Usuário: "Recebi meu salário de 5000"
Resposta: "Salário registrado! 💰
[ACAO_TRANSACAO]
tipo: income
valor: 5000.00
descricao: Salário
categoria: salario
data: 2026-02-24
[/ACAO_TRANSACAO]"`;

let chatHistory = [];

export const sendMessage = async (message, userContext = '') => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM_PROMPT });
        const today = new Date().toISOString().split('T')[0];
        const ctx = userContext
            ? `[Dados financeiros: ${userContext}] [Data de hoje: ${today}]\n\n${message}`
            : `[Data de hoje: ${today}]\n\n${message}`;
        chatHistory.push({ role: 'user', parts: [{ text: ctx }] });
        const chat = model.startChat({ history: chatHistory.slice(0, -1) });
        const result = await chat.sendMessage(ctx);
        const response = result.response.text();
        chatHistory.push({ role: 'model', parts: [{ text: response }] });
        const actions = parseActions(response);
        const cleanText = response
            .replace(/\[ACAO_TRANSACAO\][\s\S]*?\[\/ACAO_TRANSACAO\]/g, '')
            .replace(/\[ACAO_META\][\s\S]*?\[\/ACAO_META\]/g, '')
            .replace(/\[ACAO_ORCAMENTO\][\s\S]*?\[\/ACAO_ORCAMENTO\]/g, '')
            .trim();
        return { response: cleanText, actions, error: null };
    } catch (error) {
        return { ...handleError(error), actions: [] };
    }
};

export const analyzeImage = async (base64, mimeType = 'image/jpeg', msg = '') => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM_PROMPT });
        const today = new Date().toISOString().split('T')[0];
        const prompt = msg || `[Data de hoje: ${today}] Analise este comprovante/nota fiscal. Extraia os dados e registre usando [ACAO_TRANSACAO].`;
        const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType } }]);
        const response = result.response.text();
        chatHistory.push({ role: 'user', parts: [{ text: '[Imagem enviada]' }] });
        chatHistory.push({ role: 'model', parts: [{ text: response }] });
        const actions = parseActions(response);
        const cleanText = response
            .replace(/\[ACAO_TRANSACAO\][\s\S]*?\[\/ACAO_TRANSACAO\]/g, '')
            .replace(/\[ACAO_META\][\s\S]*?\[\/ACAO_META\]/g, '')
            .replace(/\[ACAO_ORCAMENTO\][\s\S]*?\[\/ACAO_ORCAMENTO\]/g, '')
            .trim();
        return { response: cleanText, actions, error: null };
    } catch (error) {
        return { ...handleError(error), actions: [] };
    }
};

// Parse all action blocks
const parseActions = (text) => {
    const actions = [];

    // Transactions
    const txRe = /\[ACAO_TRANSACAO\]([\s\S]*?)\[\/ACAO_TRANSACAO\]/g;
    let m;
    while ((m = txRe.exec(text)) !== null) {
        const b = m[1];
        const val = b.match(/valor:\s*([\d.,]+)/);
        if (val) {
            actions.push({
                actionType: 'transaction',
                type: (b.match(/tipo:\s*(expense|income)/i)?.[1] || 'expense').toLowerCase(),
                amount: parseFloat(val[1].replace(',', '.')),
                description: b.match(/descricao:\s*(.+)/i)?.[1]?.trim() || 'Transação',
                category_id: b.match(/categoria:\s*(.+)/i)?.[1]?.trim() || 'outros',
                date: b.match(/data:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || new Date().toISOString().split('T')[0],
            });
        }
    }

    // Goals
    const goalRe = /\[ACAO_META\]([\s\S]*?)\[\/ACAO_META\]/g;
    while ((m = goalRe.exec(text)) !== null) {
        const b = m[1];
        const val = b.match(/valor_meta:\s*([\d.,]+)/);
        if (val) {
            actions.push({
                actionType: 'goal',
                name: b.match(/nome:\s*(.+)/i)?.[1]?.trim() || 'Meta',
                target_amount: parseFloat(val[1].replace(',', '.')),
                current_amount: parseFloat(b.match(/valor_atual:\s*([\d.,]+)/)?.[1]?.replace(',', '.') || '0'),
            });
        }
    }

    // Budgets
    const budgetRe = /\[ACAO_ORCAMENTO\]([\s\S]*?)\[\/ACAO_ORCAMENTO\]/g;
    while ((m = budgetRe.exec(text)) !== null) {
        const b = m[1];
        const val = b.match(/limite:\s*([\d.,]+)/);
        if (val) {
            actions.push({
                actionType: 'budget',
                category_id: b.match(/categoria:\s*(.+)/i)?.[1]?.trim() || 'outros',
                limit_amount: parseFloat(val[1].replace(',', '.')),
            });
        }
    }

    return actions;
};

export const clearChat = () => { chatHistory = []; };

const handleError = (error) => {
    let msg = 'Erro ao processar. Tente novamente.';
    if (error?.message?.includes('429') || error?.message?.includes('quota'))
        msg = '⚠️ Limite da API atingido. Aguarde e tente novamente.';
    else if (error?.message?.includes('API_KEY'))
        msg = '🔑 Chave API inválida.';
    return { response: null, error: msg };
};
