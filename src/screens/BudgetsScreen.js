import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    TextInput, Alert, Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { formatCurrency, getPercentage, getCurrentMonth } from '../utils/helpers';
import { getBudgets, supabase } from '../services/supabase';
import useStore from '../store/useStore';

export default function BudgetsScreen({ navigation }) {
    const [showModal, setShowModal] = useState(false);
    const [newBudget, setNewBudget] = useState({ category: '', limit_amount: '' });
    const user = useStore((s) => s.user);
    const budgets = useStore((s) => s.budgets);
    const setBudgets = useStore((s) => s.setBudgets);
    const transactions = useStore((s) => s.transactions);

    useEffect(() => {
        if (user) loadBudgets();
    }, [user]);

    const loadBudgets = async () => {
        const { data } = await getBudgets(user.id, getCurrentMonth());
        if (data) setBudgets(data);
    };

    const getSpentForCategory = (categoryId) => {
        const now = new Date();
        return transactions
            .filter((t) => t.type === 'expense' && t.category_id === categoryId &&
                new Date(t.date).getMonth() === now.getMonth() &&
                new Date(t.date).getFullYear() === now.getFullYear())
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    };

    const handleAdd = async () => {
        if (!newBudget.category || !newBudget.limit_amount) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }
        try {
            const { error } = await supabase.from('budgets').insert({
                user_id: user.id,
                category_id: newBudget.category,
                limit_amount: parseFloat(newBudget.limit_amount.replace(',', '.')),
                month: getCurrentMonth(),
            });
            if (error) throw error;
            setShowModal(false);
            setNewBudget({ category: '', limit_amount: '' });
            loadBudgets();
        } catch (err) {
            Alert.alert('Erro', err.message);
        }
    };

    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limit_amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + getSpentForCategory(b.category_id), 0);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Orçamentos</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                    <MaterialIcons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <View>
                        <Text style={styles.summaryLabel}>Orçamento Total</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(totalBudget)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.summaryLabel}>Gasto</Text>
                        <Text style={[styles.summaryValue, { color: totalSpent > totalBudget ? COLORS.expense : COLORS.income }]}>
                            {formatCurrency(totalSpent)}
                        </Text>
                    </View>
                </View>
                <View style={styles.progressBar}>
                    <View style={[
                        styles.progressFill,
                        {
                            width: `${Math.min(getPercentage(totalSpent, totalBudget), 100)}%`,
                            backgroundColor: totalSpent > totalBudget ? COLORS.expense : COLORS.primary,
                        }
                    ]} />
                </View>
            </View>

            {/* Budgets List */}
            {budgets.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialIcons name="account-balance-wallet" size={48} color={COLORS.textMuted} />
                    <Text style={styles.emptyText}>Nenhum orçamento definido</Text>
                    <Text style={styles.emptySubtext}>Crie limites para controlar seus gastos!</Text>
                </View>
            ) : (
                budgets.map((budget) => {
                    const spent = getSpentForCategory(budget.category_id);
                    const percentage = getPercentage(spent, budget.limit_amount);
                    const isOver = spent > budget.limit_amount;
                    return (
                        <View key={budget.id} style={styles.budgetCard}>
                            <View style={styles.budgetHeader}>
                                <View style={styles.budgetIcon}>
                                    <MaterialIcons
                                        name={budget.categories?.icon || 'category'}
                                        size={20}
                                        color={isOver ? COLORS.expense : COLORS.primary}
                                    />
                                </View>
                                <View style={styles.budgetInfo}>
                                    <Text style={styles.budgetName}>{budget.categories?.name || 'Categoria'}</Text>
                                    <Text style={styles.budgetLimit}>Limite: {formatCurrency(budget.limit_amount)}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.budgetSpent, { color: isOver ? COLORS.expense : COLORS.textPrimary }]}>
                                        {formatCurrency(spent)}
                                    </Text>
                                    <Text style={[styles.budgetPercentage, { color: isOver ? COLORS.expense : COLORS.primary }]}>
                                        {percentage}%
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(percentage, 100)}%`,
                                        backgroundColor: isOver ? COLORS.expense : COLORS.primary,
                                    }
                                ]} />
                            </View>
                            {isOver && (
                                <View style={styles.warningBadge}>
                                    <MaterialIcons name="warning" size={14} color={COLORS.expense} />
                                    <Text style={styles.warningText}>Orçamento excedido!</Text>
                                </View>
                            )}
                        </View>
                    );
                })
            )}

            {/* Modal */}
            <Modal visible={showModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Novo Orçamento</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <TextInput style={styles.modalInput} placeholder="Categoria (ex: Alimentação)"
                            placeholderTextColor={COLORS.textMuted} value={newBudget.category}
                            onChangeText={(v) => setNewBudget({ ...newBudget, category: v })} />
                        <TextInput style={styles.modalInput} placeholder="Limite mensal (R$)"
                            placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={newBudget.limit_amount}
                            onChangeText={(v) => setNewBudget({ ...newBudget, limit_amount: v })} />
                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd}>
                            <Text style={styles.modalSaveBtnText}>Criar Orçamento</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.paddingXl, marginBottom: 24 },
    title: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
    addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center' },
    summaryCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: SIZES.padding, marginHorizontal: SIZES.paddingXl, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    summaryValue: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
    progressBar: { height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    budgetCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: SIZES.padding, marginHorizontal: SIZES.paddingXl, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
    budgetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    budgetIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    budgetInfo: { flex: 1 },
    budgetName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
    budgetLimit: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
    budgetSpent: { fontSize: SIZES.md, fontWeight: '600' },
    budgetPercentage: { fontSize: SIZES.xs, fontWeight: '600', marginTop: 2 },
    warningBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    warningText: { fontSize: SIZES.xs, color: COLORS.expense },
    empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
    emptyText: { fontSize: SIZES.base, color: COLORS.textSecondary, fontWeight: '600' },
    emptySubtext: { fontSize: SIZES.sm, color: COLORS.textMuted },
    modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
    modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, padding: SIZES.paddingXl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
    modalInput: { backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: 16, height: 50, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, fontSize: SIZES.md },
    modalSaveBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...SHADOWS.glow },
    modalSaveBtnText: { color: COLORS.textOnPrimary, fontSize: SIZES.base, fontWeight: '700' },
});
