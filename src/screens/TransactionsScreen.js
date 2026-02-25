import React, { useState, useMemo } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/theme';
import { formatCurrency } from '../utils/helpers';
import useStore from '../store/useStore';

const FILTERS = ['Todos', 'Receitas', 'Despesas'];

export default function TransactionsScreen() {
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [search, setSearch] = useState('');
    const transactions = useStore((s) => s.transactions);

    const filtered = useMemo(() => {
        let result = transactions;
        if (activeFilter === 'Receitas') result = result.filter((t) => t.type === 'income');
        if (activeFilter === 'Despesas') result = result.filter((t) => t.type === 'expense');
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((t) =>
                (t.description || '').toLowerCase().includes(q) ||
                (t.categories?.name || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [transactions, activeFilter, search]);

    const renderTransaction = ({ item: tx }) => (
        <TouchableOpacity style={styles.txItem} activeOpacity={0.7}>
            <View style={[
                styles.txIcon,
                { backgroundColor: tx.type === 'income' ? 'rgba(0,230,118,0.15)' : 'rgba(255,82,82,0.15)' }
            ]}>
                <MaterialIcons
                    name={tx.type === 'income' ? 'arrow-downward' : 'arrow-upward'}
                    size={20}
                    color={tx.type === 'income' ? COLORS.income : COLORS.expense}
                />
            </View>
            <View style={styles.txInfo}>
                <Text style={styles.txName}>{tx.description || tx.categories?.name || 'Transação'}</Text>
                <Text style={styles.txCategory}>{tx.categories?.name || ''}</Text>
                <Text style={styles.txDate}>
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                </Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'income' ? COLORS.income : COLORS.expense }]}>
                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Transações</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color={COLORS.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar transações..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id?.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialIcons name="inbox" size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
    header: { paddingHorizontal: SIZES.paddingXl, marginBottom: 16 },
    title: { fontSize: SIZES.xxl, fontWeight: '700', color: COLORS.textPrimary },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius, marginHorizontal: SIZES.paddingXl, paddingHorizontal: 16,
        height: 48, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
    },
    searchInput: { flex: 1, marginLeft: 8, color: COLORS.textPrimary, fontSize: SIZES.md },
    filterRow: {
        flexDirection: 'row', paddingHorizontal: SIZES.paddingXl, gap: 8, marginBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    },
    filterChipActive: {
        backgroundColor: COLORS.primaryMuted, borderColor: COLORS.primary,
    },
    filterText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
    filterTextActive: { color: COLORS.primary, fontWeight: '600' },
    list: { paddingHorizontal: SIZES.paddingXl, paddingBottom: 100 },
    txItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius, padding: SIZES.padding, marginBottom: 8,
        borderWidth: 1, borderColor: COLORS.border,
    },
    txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    txInfo: { flex: 1 },
    txName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
    txCategory: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
    txDate: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
    txAmount: { fontSize: SIZES.md, fontWeight: '700' },
    empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { fontSize: SIZES.base, color: COLORS.textSecondary },
});
