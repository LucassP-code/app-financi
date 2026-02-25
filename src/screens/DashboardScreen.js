import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Dimensions, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { formatCurrency, getMonthName, DAY_NAMES_SHORT } from '../utils/helpers';
import { getTransactions, getCategories } from '../services/supabase';
import useStore from '../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
    const [refreshing, setRefreshing] = useState(false);
    const user = useStore((s) => s.user);
    const transactions = useStore((s) => s.transactions);
    const setTransactions = useStore((s) => s.setTransactions);
    const setCategories = useStore((s) => s.setCategories);
    const getSummary = useStore((s) => s.getSummary);

    const summary = getSummary();
    const userName = user?.user_metadata?.full_name || 'Usuário';
    const currentMonth = getMonthName(new Date().getMonth());

    const recentTransactions = transactions.slice(0, 5);

    // Chart data (last 7 days)
    const getLast7DaysData = () => {
        const labels = [];
        const incomeData = [];
        const expenseData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(DAY_NAMES_SHORT[date.getDay()]);

            const dayStr = date.toISOString().split('T')[0];
            const dayIncome = transactions
                .filter((t) => t.type === 'income' && t.date?.startsWith(dayStr))
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const dayExpense = transactions
                .filter((t) => t.type === 'expense' && t.date?.startsWith(dayStr))
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            incomeData.push(dayIncome);
            expenseData.push(dayExpense);
        }

        return { labels, incomeData, expenseData };
    };

    const chartData = getLast7DaysData();

    const loadData = async () => {
        if (!user) return;
        try {
            const [txRes, catRes] = await Promise.all([
                getTransactions(user.id),
                getCategories(),
            ]);
            if (txRes.data) setTransactions(txRes.data);
            if (catRes.data) setCategories(catRes.data);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, [user]);

    // Quick Actions
    const quickActions = [
        { icon: 'arrow-upward', label: 'Enviar', color: COLORS.primary },
        { icon: 'arrow-downward', label: 'Receber', color: COLORS.primary },
        { icon: 'swap-horiz', label: 'Transferir', color: COLORS.primary },
        { icon: 'receipt-long', label: 'Contas', color: COLORS.primary },
    ];

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Bem-vindo de volta,</Text>
                    <Text style={styles.userName}>Olá {userName} 👋</Text>
                </View>
                <TouchableOpacity
                    style={styles.aiButton}
                    onPress={() => navigation.navigate('AIAgent')}
                >
                    <MaterialIcons name="smart-toy" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
                <View style={styles.balanceCardInner}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>Saldo Total</Text>
                        <View style={styles.monthBadge}>
                            <Text style={styles.monthText}>{currentMonth}</Text>
                        </View>
                    </View>
                    <Text style={styles.balanceAmount}>{formatCurrency(summary.balance)}</Text>

                    <View style={styles.incomeExpenseRow}>
                        <View style={styles.incomeExpenseItem}>
                            <View style={[styles.indicator, { backgroundColor: COLORS.income }]} />
                            <View>
                                <Text style={styles.ieLabel}>Receitas</Text>
                                <Text style={[styles.ieAmount, { color: COLORS.income }]}>
                                    {formatCurrency(summary.totalIncome)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.incomeExpenseItem}>
                            <View style={[styles.indicator, { backgroundColor: COLORS.expense }]} />
                            <View>
                                <Text style={styles.ieLabel}>Despesas</Text>
                                <Text style={[styles.ieAmount, { color: COLORS.expense }]}>
                                    {formatCurrency(summary.totalExpense)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsRow}>
                {quickActions.map((action, index) => (
                    <TouchableOpacity key={index} style={styles.quickAction} activeOpacity={0.7}>
                        <View style={styles.quickActionIcon}>
                            <MaterialIcons name={action.icon} size={24} color={action.color} />
                        </View>
                        <Text style={styles.quickActionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Chart */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Visão Semanal</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
                        <Text style={styles.seeAll}>Ver Tudo</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.chartCard}>
                    <LineChart
                        data={{
                            labels: chartData.labels,
                            datasets: [
                                {
                                    data: chartData.incomeData.map((v) => v || 0.1),
                                    color: () => COLORS.income,
                                    strokeWidth: 2,
                                },
                                {
                                    data: chartData.expenseData.map((v) => v || 0.1),
                                    color: () => COLORS.expense,
                                    strokeWidth: 2,
                                },
                            ],
                        }}
                        width={SCREEN_WIDTH - 64}
                        height={180}
                        chartConfig={{
                            backgroundColor: 'transparent',
                            backgroundGradientFrom: COLORS.surface,
                            backgroundGradientTo: COLORS.surface,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.3})`,
                            labelColor: () => COLORS.textMuted,
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                            },
                            propsForBackgroundLines: {
                                strokeDasharray: '',
                                stroke: COLORS.border,
                                strokeWidth: 0.5,
                            },
                        }}
                        bezier
                        withInnerLines={false}
                        withOuterLines={false}
                        style={styles.chart}
                    />
                </View>
            </View>

            {/* Feature Cards */}
            <View style={styles.featureRow}>
                <TouchableOpacity
                    style={styles.featureCard}
                    onPress={() => navigation.navigate('Budgets')}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="account-balance-wallet" size={28} color={COLORS.warning} />
                    <Text style={styles.featureTitle}>Orçamentos</Text>
                    <Text style={styles.featureDesc}>Controle seus limites</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.featureCard}
                    onPress={() => navigation.navigate('Goals')}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="flag" size={28} color={COLORS.accent} />
                    <Text style={styles.featureTitle}>Metas</Text>
                    <Text style={styles.featureDesc}>Alcance seus objetivos</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transações Recentes</Text>
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={styles.seeAll}>Ver Tudo</Text>
                    </TouchableOpacity>
                </View>

                {recentTransactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="receipt-long" size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
                        <Text style={styles.emptySubtext}>Adicione sua primeira transação!</Text>
                    </View>
                ) : (
                    recentTransactions.map((tx) => (
                        <View key={tx.id} style={styles.transactionItem}>
                            <View style={[
                                styles.txIcon,
                                { backgroundColor: tx.type === 'income' ? 'rgba(0,230,118,0.15)' : 'rgba(255,82,82,0.15)' }
                            ]}>
                                <MaterialIcons
                                    name={tx.categories?.icon || (tx.type === 'income' ? 'arrow-downward' : 'arrow-upward')}
                                    size={20}
                                    color={tx.type === 'income' ? COLORS.income : COLORS.expense}
                                />
                            </View>
                            <View style={styles.txInfo}>
                                <Text style={styles.txName}>{tx.description || tx.categories?.name || 'Transação'}</Text>
                                <Text style={styles.txDate}>
                                    {new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                </Text>
                            </View>
                            <Text style={[
                                styles.txAmount,
                                { color: tx.type === 'income' ? COLORS.income : COLORS.expense }
                            ]}>
                                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                            </Text>
                        </View>
                    ))
                )}
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingXl,
        marginBottom: 24,
    },
    greeting: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    userName: {
        fontSize: SIZES.xxl,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    aiButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    balanceCard: {
        marginHorizontal: SIZES.paddingXl,
        borderRadius: SIZES.radiusLg,
        overflow: 'hidden',
        marginBottom: 24,
        ...SHADOWS.medium,
    },
    balanceCardInner: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.paddingXl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardLabel: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
    },
    monthBadge: {
        backgroundColor: COLORS.primaryMuted,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: SIZES.radiusFull,
    },
    monthText: {
        fontSize: SIZES.xs,
        color: COLORS.primary,
        fontWeight: '600',
    },
    balanceAmount: {
        fontSize: SIZES.hero,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 20,
    },
    incomeExpenseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    incomeExpenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    separator: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    ieLabel: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    ieAmount: {
        fontSize: SIZES.base,
        fontWeight: '600',
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: SIZES.paddingXl,
        marginBottom: 24,
    },
    quickAction: {
        alignItems: 'center',
        gap: 8,
    },
    quickActionIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.2)',
    },
    quickActionLabel: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    section: {
        paddingHorizontal: SIZES.paddingXl,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    seeAll: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
    chartCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.padding,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chart: {
        borderRadius: SIZES.radius,
    },
    featureRow: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.paddingXl,
        gap: 12,
        marginBottom: 24,
    },
    featureCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.padding,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 4,
    },
    featureTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: 8,
    },
    featureDesc: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    txIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    txInfo: {
        flex: 1,
    },
    txName: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    txDate: {
        fontSize: SIZES.xs,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    txAmount: {
        fontSize: SIZES.md,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    emptyText: {
        fontSize: SIZES.base,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: SIZES.sm,
        color: COLORS.textMuted,
    },
});
