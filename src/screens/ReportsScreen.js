import React, { useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../theme/theme';
import { formatCurrency, MONTH_NAMES, CATEGORY_COLORS } from '../utils/helpers';
import useStore from '../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReportsScreen({ navigation }) {
    const transactions = useStore((s) => s.transactions);

    // Category breakdown
    const categoryData = useMemo(() => {
        const map = {};
        transactions
            .filter((t) => t.type === 'expense')
            .forEach((t) => {
                const catName = t.categories?.name || t.description || 'Outros';
                map[catName] = (map[catName] || 0) + parseFloat(t.amount);
            });

        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, amount], i) => ({
                name: name.length > 10 ? name.slice(0, 10) + '...' : name,
                amount,
                color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                legendFontColor: COLORS.textSecondary,
                legendFontSize: 12,
            }));
    }, [transactions]);

    // Monthly totals (last 6 months)
    const monthlyData = useMemo(() => {
        const labels = [];
        const incomeData = [];
        const expenseData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(MONTH_NAMES[date.getMonth()].slice(0, 3));

            const month = date.getMonth();
            const year = date.getFullYear();

            const monthIncome = transactions
                .filter((t) => {
                    const d = new Date(t.date);
                    return t.type === 'income' && d.getMonth() === month && d.getFullYear() === year;
                })
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const monthExpense = transactions
                .filter((t) => {
                    const d = new Date(t.date);
                    return t.type === 'expense' && d.getMonth() === month && d.getFullYear() === year;
                })
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            incomeData.push(monthIncome || 0.1);
            expenseData.push(monthExpense || 0.1);
        }

        return { labels, incomeData, expenseData };
    }, [transactions]);

    // Summary stats
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
    const avgExpense = transactions.filter((t) => t.type === 'expense').length > 0
        ? totalExpense / transactions.filter((t) => t.type === 'expense').length
        : 0;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Relatórios</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <MaterialIcons name="arrow-downward" size={20} color={COLORS.income} />
                    <Text style={styles.statLabel}>Total Receitas</Text>
                    <Text style={[styles.statValue, { color: COLORS.income }]}>{formatCurrency(totalIncome)}</Text>
                </View>
                <View style={styles.statCard}>
                    <MaterialIcons name="arrow-upward" size={20} color={COLORS.expense} />
                    <Text style={styles.statLabel}>Total Despesas</Text>
                    <Text style={[styles.statValue, { color: COLORS.expense }]}>{formatCurrency(totalExpense)}</Text>
                </View>
            </View>
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <MaterialIcons name="account-balance" size={20} color={COLORS.primary} />
                    <Text style={styles.statLabel}>Saldo Geral</Text>
                    <Text style={[styles.statValue, { color: COLORS.primary }]}>{formatCurrency(totalIncome - totalExpense)}</Text>
                </View>
                <View style={styles.statCard}>
                    <MaterialIcons name="calculate" size={20} color={COLORS.warning} />
                    <Text style={styles.statLabel}>Média/Despesa</Text>
                    <Text style={[styles.statValue, { color: COLORS.warning }]}>{formatCurrency(avgExpense)}</Text>
                </View>
            </View>

            {/* Monthly Bar Chart */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Receitas vs Despesas (6 meses)</Text>
                <View style={styles.chartCard}>
                    <BarChart
                        data={{
                            labels: monthlyData.labels,
                            datasets: [
                                { data: monthlyData.incomeData },
                            ],
                        }}
                        width={SCREEN_WIDTH - 64}
                        height={200}
                        chartConfig={{
                            backgroundColor: 'transparent',
                            backgroundGradientFrom: COLORS.surface,
                            backgroundGradientTo: COLORS.surface,
                            decimalPlaces: 0,
                            color: () => COLORS.primary,
                            labelColor: () => COLORS.textMuted,
                            barPercentage: 0.5,
                            propsForBackgroundLines: {
                                stroke: COLORS.border,
                                strokeWidth: 0.5,
                            },
                        }}
                        withInnerLines={false}
                        showValuesOnTopOfBars={false}
                        style={styles.chart}
                    />
                </View>
            </View>

            {/* Pie Chart */}
            {categoryData.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
                    <View style={styles.chartCard}>
                        <PieChart
                            data={categoryData}
                            width={SCREEN_WIDTH - 64}
                            height={200}
                            chartConfig={{
                                color: () => COLORS.textPrimary,
                            }}
                            accessor="amount"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                </View>
            )}

            {/* Top Categories */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Categorias de Gasto</Text>
                {categoryData.map((cat, i) => (
                    <View key={i} style={styles.catItem}>
                        <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                        <Text style={styles.catName}>{cat.name}</Text>
                        <Text style={styles.catAmount}>{formatCurrency(cat.amount)}</Text>
                    </View>
                ))}
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.paddingXl, marginBottom: 24 },
    title: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
    statsRow: { flexDirection: 'row', paddingHorizontal: SIZES.paddingXl, gap: 12, marginBottom: 12 },
    statCard: {
        flex: 1, backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: SIZES.padding,
        borderWidth: 1, borderColor: COLORS.border, gap: 4,
    },
    statLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    statValue: { fontSize: SIZES.lg, fontWeight: '700' },
    section: { paddingHorizontal: SIZES.paddingXl, marginBottom: 24 },
    sectionTitle: { fontSize: SIZES.base, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
    chartCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: SIZES.padding, borderWidth: 1, borderColor: COLORS.border },
    chart: { borderRadius: SIZES.radius },
    catItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    catDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    catName: { flex: 1, fontSize: SIZES.md, color: COLORS.textPrimary },
    catAmount: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
});
