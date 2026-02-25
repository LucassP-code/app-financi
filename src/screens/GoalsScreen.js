import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    TextInput, Alert, Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { formatCurrency, getPercentage } from '../utils/helpers';
import { getGoals, supabase } from '../services/supabase';
import useStore from '../store/useStore';

export default function GoalsScreen({ navigation }) {
    const [showModal, setShowModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', current_amount: '' });
    const user = useStore((s) => s.user);
    const goals = useStore((s) => s.goals);
    const setGoals = useStore((s) => s.setGoals);

    useEffect(() => {
        if (user) loadGoals();
    }, [user]);

    const loadGoals = async () => {
        const { data } = await getGoals(user.id);
        if (data) setGoals(data);
    };

    const handleAdd = async () => {
        if (!newGoal.name || !newGoal.target_amount) {
            Alert.alert('Atenção', 'Preencha nome e valor da meta.');
            return;
        }
        try {
            const { error } = await supabase.from('goals').insert({
                user_id: user.id,
                name: newGoal.name,
                target_amount: parseFloat(newGoal.target_amount.replace(',', '.')),
                current_amount: parseFloat(newGoal.current_amount?.replace(',', '.') || 0),
                target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            });
            if (error) throw error;
            setShowModal(false);
            setNewGoal({ name: '', target_amount: '', current_amount: '' });
            loadGoals();
        } catch (err) {
            Alert.alert('Erro', err.message);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Metas Financeiras</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                    <MaterialIcons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {goals.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialIcons name="flag" size={48} color={COLORS.textMuted} />
                    <Text style={styles.emptyText}>Nenhuma meta criada</Text>
                    <Text style={styles.emptySubtext}>Defina uma meta e comece a economizar!</Text>
                    <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
                        <Text style={styles.emptyBtnText}>Criar Meta</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                goals.map((goal) => {
                    const progress = getPercentage(goal.current_amount || 0, goal.target_amount);
                    return (
                        <View key={goal.id} style={styles.goalCard}>
                            <View style={styles.goalHeader}>
                                <View style={styles.goalIcon}>
                                    <MaterialIcons name="flag" size={24} color={COLORS.accent} />
                                </View>
                                <View style={styles.goalInfo}>
                                    <Text style={styles.goalName}>{goal.name}</Text>
                                    <Text style={styles.goalTarget}>Meta: {formatCurrency(goal.target_amount)}</Text>
                                </View>
                                <Text style={styles.goalPercentage}>{progress}%</Text>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                            </View>

                            <View style={styles.goalFooter}>
                                <Text style={styles.goalCurrent}>
                                    Acumulado: {formatCurrency(goal.current_amount || 0)}
                                </Text>
                                <Text style={styles.goalRemaining}>
                                    Faltam: {formatCurrency(Math.max(0, goal.target_amount - (goal.current_amount || 0)))}
                                </Text>
                            </View>
                        </View>
                    );
                })
            )}

            {/* Modal */}
            <Modal visible={showModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nova Meta</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <TextInput style={styles.modalInput} placeholder="Nome da meta (ex: Viagem, Carro)"
                            placeholderTextColor={COLORS.textMuted} value={newGoal.name}
                            onChangeText={(v) => setNewGoal({ ...newGoal, name: v })} />
                        <TextInput style={styles.modalInput} placeholder="Valor da meta (R$)"
                            placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={newGoal.target_amount}
                            onChangeText={(v) => setNewGoal({ ...newGoal, target_amount: v })} />
                        <TextInput style={styles.modalInput} placeholder="Já acumulado (R$) - opcional"
                            placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={newGoal.current_amount}
                            onChangeText={(v) => setNewGoal({ ...newGoal, current_amount: v })} />
                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd}>
                            <Text style={styles.modalSaveBtnText}>Criar Meta</Text>
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
    goalCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: SIZES.padding, marginHorizontal: SIZES.paddingXl, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    goalIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0, 191, 165, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    goalInfo: { flex: 1 },
    goalName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
    goalTarget: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
    goalPercentage: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.accent },
    progressBar: { height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
    goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    goalCurrent: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    goalRemaining: { fontSize: SIZES.xs, color: COLORS.textMuted },
    empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
    emptyText: { fontSize: SIZES.base, color: COLORS.textSecondary, fontWeight: '600' },
    emptySubtext: { fontSize: SIZES.sm, color: COLORS.textMuted },
    emptyBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16, ...SHADOWS.glow },
    emptyBtnText: { color: COLORS.textOnPrimary, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
    modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, padding: SIZES.paddingXl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
    modalInput: { backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: 16, height: 50, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, fontSize: SIZES.md },
    modalSaveBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...SHADOWS.glow },
    modalSaveBtnText: { color: COLORS.textOnPrimary, fontSize: SIZES.base, fontWeight: '700' },
});
