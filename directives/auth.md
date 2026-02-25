# Directive: Autenticação

## Objetivo
Gerenciar o fluxo de autenticação do usuário usando Supabase Auth.

## Fluxo
1. **Registro**: Email + senha + nome → `supabase.auth.signUp()` → Cria profile automaticamente (trigger)
2. **Login**: Email + senha → `supabase.auth.signInWithPassword()` → Sessão armazenada no AsyncStorage
3. **Logout**: `supabase.auth.signOut()` → Limpa sessão
4. **Persistência**: O Supabase client com AsyncStorage mantém a sessão entre reinicializações

## Ferramentas
- `src/services/supabase.js` — Client e helpers de auth
- `src/store/useStore.js` — Estado global (user, session, isAuthenticated)
- `src/navigation/AppNavigator.js` — Roteamento condicional (auth vs main)

## Edge Cases
- Session expirada: O Supabase auto-refresh resolve
- Erro de rede: Mostrar Alert com mensagem de erro
- Email já em uso: Supabase retorna erro específico
