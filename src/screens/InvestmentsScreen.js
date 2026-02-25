import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    TextInput, Alert, Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { formatCurrency } from '../utils/helpers';
import { getInvestments, supabase } from '../services/supabase';
import useStore from '../store/useStore';

const INVESTMENT_TYPES = [
    { id: 'renda_fixa', name: 'Renda Fixa', icon: 'savings', color: '#00E676' },
    { id: 'acoes', name: 'Ações', icon: 'trending-up', color: '#448AFF' },
    { id: 'fiis', name: 'FIIs', icon: 'apartment', color: '#E040FB' },
    { id: 'cripto', name: 'Cripto', icon: 'currency-bitcoin', color: '#FFD740' },
    { id: 'tesouro', name: 'Tesouro', icon: 'account-balance', color: '#FF6E40' },
    { id: 'outros', name: 'Outros', icon: 'pie-chart', color: '#18FFFF' },
];

export default function InvestmentsScreen() {
    const [showModal, setShowModal] = useState(false);
    const [newInvestment, setNewInvestment] = useState({ name: '', type: '', amount: '', yield_rate: '' });
    const user = useStore((s) => s.user);
    const investments = useStore((s) => s.investments);
    const setInvestments = useStore((s) => s.setInvestments);

    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const totalYield = investments.reduce((sum, inv) => sum + parseFloat(inv.current_yield || 0), 0);

    useEffect(() => {
        if (user) loadInvestments();
    }, [user]);

    const loadInvestments = async () => {
        const { data } = await getInvestments(user.id);
        if (data) setInvestments(data);
    };

    const handleAdd = async () => {
        if (!newInvestment.name || !newInvestment.amount) {
            Alert.alert('Atenção', 'Preencha nome e valor.');
            return;
        }
        try {
            const { error } = await supabase.from('investments').insert({
                user_id: user.id,
                name: newInvestment.name,
                type: newInvestment.type || 'outros',
                amount: parseFloat(newInvestment.amount.replace(',', '.')),
                yield_rate: parseFloat(newInvestment.yield_rate?.replace(',', '.') || 0),
                current_yield: 0,
            });
            if (error) throw error;
            setShowModal(false);
            setNewInvestment({ name: '', type: '', amount: '', yield_rate: '' });
            loadInvestments();
        } catch (err) {
            Alert.alert('Erro', err.message);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Investimentos</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                    <MaterialIcons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Investido</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(totalInvested)}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Rendimento</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.income }]}>
                        {formatCurrency(totalYield)}
                    </Text>
                </View>
            </View>

            {/* Investment Types */}
            <View style={styles.typesRow}>
                {INVESTMENT_TYPES.map((t) => {
                    const count = investments.filter((i) => i.type === t.id).length;
                    return (
                        <View key={t.id} style={styles.typeChip}>
                            <MaterialIcons name={t.icon} size={16} color={t.color} />
                            <Text style={styles.typeText}>{t.name} ({count})</Text>
                        </View>
                    );
                })}
            </View>

            {/* List */}
            {investments.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialIcons name="trending-up" size={48} color={COLORS.textMuted} />
                    <Text style={styles.emptyText}>Nenhum investimento ainda</Text>
                    <Text style={styles.emptySubtext}>Comece a investir hoje!</Text>
                </View>
            ) : (
                investments.map((inv) => {
                    const typeInfo = INVESTMENT_TYPES.find((t) => t.id === inv.type) || INVESTMENT_TYPES[5];
                    return (
                        <View key={inv.id} style={styles.investmentCard}>
                            <View style={[styles.invIcon, { backgroundColor: typeInfo.color + '20' }]}>
                                <MaterialIcons name={typeInfo.icon} size={24} color={typeInfo.color} />
                            </View>
                            <View style={styles.invInfo}>
                                <Text style={styles.invName}>{inv.name}</Text>
                                <Text style={styles.invType}>{typeInfo.name}</Text>
                            </View>
                            <View style={styles.invValues}>
                                <Text style={styles.invAmount}>{formatCurrency(inv.amount)}</Text>
                                <Text style={[styles.invYield, { color: COLORS.income }]}>
                                    +{formatCurrency(inv.current_yield || 0)}
                                </Text>
                            </View>
                        </View>
                    );
                })
            )}

            {/* Add Modal */}
            <Modal visible={showModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Novo Investimento</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <TextInput style={styles.modalInput} placeholder="Nome" placeholderTextColor={COLORS.textMuted}
                            value={newInvestment.name} onChangeText={(v) => setNewInvestment({ ...newInvestment, name: v })} />
                        <TextInput style={styles.modalInput} placeholder="Valor investido" placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric" value={newInvestment.amount}
                            onChangeText={(v) => setNewInvestment({ ...newInvestment, amount: v })} />
                        <TextInput style={styles.modalInput} placeholder="Taxa de rendimento (% a.a.)" placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric" value={newInvestment.yield_rate}
                            onChangeText={(v) => setNewInvestment({ ...newInvestment, yield_rate: v })} />
                        <View style={styles.typeSelect}>
                            {INVESTMENT_TYPES.map((t) => (
                                <TouchableOpacity key={t.id}
                                    style={[styles.typeSelectItem, newInvestment.type === t.id && { borderColor: t.color, backgroundColor: t.color + '20' }]}
                                    onPress={() => setNewInvestment({ ...newInvestment, type: t.id })}>
                                    <MaterialIcons name={t.icon} size={18} color={t.color} />
                                    <Text style={[styles.typeSelectText, newInvestment.type === t.id && { color: t.color }]}>{t.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd}>
                            <Text style={styles.modalSaveBtnText}>Salvar</Text>
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
    title: { fontSize: SIZES.xxl, fontWeight: '700', color: COLORS.textPrimary },
    addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center' },
    summaryRow: { flexDirection: 'row', paddingHorizontal: SIZES.paddingXl, gap: 12, marginBottom: 20 },
    summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: SIZES.padding, borderWidth: 1, borderColor: COLORS.border },
    summaryLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 4 },
    summaryValue: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
    typesRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.paddingXl, gap: 8, marginBottom: 24 },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull, borderWidth: 1, borderColor: COLORS.border },
    typeText: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    investmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: SIZES.padding, marginHorizontal: SIZES.paddingXl, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
    invIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    invInfo: { flex: 1 },
    invName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
    invType: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
    invValues: { alignItems: 'flex-end' },
    invAmount: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
    invYield: { fontSize: SIZES.xs, fontWeight: '600', marginTop: 2 },
    empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
    emptyText: { fontSize: SIZES.base, color: COLORS.textSecondary, fontWeight: '600' },
    emptySubtext: { fontSize: SIZES.sm, color: COLORS.textMuted },
    modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
    modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, padding: SIZES.paddingXl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
    modalInput: { backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: 16, height: 50, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, fontSize: SIZES.md },
    typeSelect: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    typeSelectItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: SIZES.radiusFull, borderWidth: 1, borderColor: COLORS.border },
    typeSelectText: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    modalSaveBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...SHADOWS.glow },
    modalSaveBtnText: { color: COLORS.textOnPrimary, fontSize: SIZES.base, fontWeight: '700' },
});
