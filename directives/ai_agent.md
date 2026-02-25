# Directive: Agente Financeiro IA (Gemini)

## Objetivo
Integrar o Google Gemini como consultor financeiro pessoal (FinBot).

## Fluxo
1. Usuário abre tela do AI Agent
2. Pode enviar perguntas livres ou usar quick prompts
3. O sistema injeta o contexto financeiro do usuário (saldo, transações, etc.) no prompt
4. Gemini responde com análises e dicas personalizadas

## Ferramentas
- `src/services/gemini.js` — Client Gemini com system prompt, chat history, context injection
- `src/screens/AIAgentScreen.js` — Interface de chat

## System Prompt
O FinBot é configurado para:
- Responder sempre em PT-BR
- Analisar dados financeiros
- Dar dicas práticas
- Explicar conceitos de forma simples
- Usar emojis para amigabilidade
- Nunca recomendar produtos específicos

## Edge Cases
- API Key inválida: Mostrar erro genérico
- Rate limit: Informar ao usuário para tentar novamente
- Sem dados financeiros: FinBot oferece dicas genéricas
- Timeout: Timeout de 30s, mostrar mensagem de erro
