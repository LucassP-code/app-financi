import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            // Auth
            user: null,
            session: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setSession: (session) => set({ session }),

            // Preferences (persistidas)
            language: 'pt-BR',
            currency: 'BRL',
            notifications: true,
            setLanguage: (language) => set({ language }),
            setCurrency: (currency) => set({ currency }),
            setNotifications: (notifications) => set({ notifications }),

            // Dados
            transactions: [],
            setTransactions: (transactions) => set({ transactions }),
            addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
            removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

            categories: [],
            setCategories: (categories) => set({ categories }),

            budgets: [],
            setBudgets: (budgets) => set({ budgets }),

            investments: [],
            setInvestments: (investments) => set({ investments }),

            goals: [],
            setGoals: (goals) => set({ goals }),

            getSummary: () => {
                const { transactions } = get();
                const now = new Date();
                const m = now.getMonth(), y = now.getFullYear();
                const monthly = transactions.filter((t) => { const d = new Date(t.date); return d.getMonth() === m && d.getFullYear() === y; });
                const totalIncome = monthly.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
                const totalExpense = monthly.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
                return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
            },

            chatMessages: [],
            addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
            clearChat: () => set({ chatMessages: [] }),

            clearStore: () => set({
                user: null, session: null, isAuthenticated: false,
                transactions: [], categories: [], budgets: [],
                investments: [], goals: [], chatMessages: [],
            }),
        }),
        {
            name: 'financi-prefs',
            partialize: (state) => ({
                language: state.language,
                currency: state.currency,
                notifications: state.notifications,
            }),
        }
    )
);

export default useStore;
