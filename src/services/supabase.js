import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth
export const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
    });
    return { data, error };
};

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

// Transactions
export const getTransactions = async (userId, filters = {}) => {
    let q = supabase.from('transactions').select('*, categories(*)').eq('user_id', userId).order('date', { ascending: false });
    if (filters.type) q = q.eq('type', filters.type);
    if (filters.limit) q = q.limit(filters.limit);
    return await q;
};

export const addTransaction = async (tx) => {
    return await supabase.from('transactions').insert(tx).select('*, categories(*)').single();
};

export const deleteTransaction = async (id) => {
    return await supabase.from('transactions').delete().eq('id', id);
};

// Categories
export const getCategories = async () => {
    return await supabase.from('categories').select('*').order('name');
};

// Budgets
export const getBudgets = async (userId, month) => {
    return await supabase.from('budgets').select('*, categories(*)').eq('user_id', userId).eq('month', month);
};

// Investments
export const getInvestments = async (userId) => {
    return await supabase.from('investments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
};

// Goals
export const getGoals = async (userId) => {
    return await supabase.from('goals').select('*').eq('user_id', userId).order('target_date');
};
