import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { addTransaction } from '../services/supabase';
import useStore from '../store/useStore';

const EXPENSE_CATEGORIES = [
    { id: 'alimentacao', name: 'Alimentação', icon: 'restaurant' },
    { id: 'transporte', name: 'Transporte', icon: 'directions-car' },
    { id: 'moradia', name: 'Moradia', icon: 'home' },
    { id: 'saude', name: 'Saúde', icon: 'favorite' },
    { id: 'lazer', name: 'Lazer', icon: 'sports-esports' },
    { id: 'educacao', name: 'Educação', icon: 'school' },
    { id: 'vestuario', name: 'Vestuário', icon: 'checkroom' },
    { id: 'tecnologia', name: 'Tecnologia', icon: 'devices' },
    { id: 'outros', name: 'Outros', icon: 'more-horiz' },
];

const INCOME_CATEGORIES = [
    { id: 'salario', name: 'Salário', icon: 'attach-money' },
    { id: 'freelance', name: 'Freelance', icon: 'work' },
    { id: 'investimento', name: 'Investimento', icon: 'trending-up' },
    { id: 'presente', name: 'Presente', icon: 'card-giftcard' },
    { id: 'outros', name: 'Outros', icon: 'more-horiz' },
];

export default function AddTransactionScreen({ navigation }) {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    const user = useStore((s) => s.user);
    const storeAddTransaction = useStore((s) => s.addTransaction);
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Atenção', 'Informe um valor válido.');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Atenção', 'Selecione uma categoria.');
            return;
        }

        setLoading(true);
        try {
            const transaction = {
                user_id: user?.id,
                type,
                amount: parseFloat(amount.replace(',', '.')),
                description: description || selectedCategory.name,
                category_id: selectedCategory.id,
                date: new Date().toISOString(),
            };

            const { data, error } = await addTransaction(transaction);
            if (error) throw error;

            storeAddTransaction(data || transaction);
            Alert.alert('Sucesso! ✅', 'Transação adicionada.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            Alert.alert('Erro', err.message || 'Não foi possível salvar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Nova Transação</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Type Toggle */}
                <View style={styles.typeToggle}>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'expense' && styles.typeButtonExpense]}
                        onPress={() => { setType('expense'); setSelectedCategory(null); }}
                    >
                        <MaterialIcons name="arrow-upward" size={18} color={type === 'expense' ? '#FFF' : COLORS.expense} />
                        <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Despesa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'income' && styles.typeButtonIncome]}
                        onPress={() => { setType('income'); setSelectedCategory(null); }}
                    >
                        <MaterialIcons name="arrow-downward" size={18} color={type === 'income' ? '#FFF' : COLORS.income} />
                        <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Receita</Text>
                    </TouchableOpacity>
                </View>

                {/* Amount */}
                <View style={styles.amountContainer}>
                    <Text style={styles.currency}>R$</Text>
                    <TextInput
                        style={styles.amountInput}
                        placeholder="0,00"
                        placeholderTextColor={COLORS.textMuted}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />
                </View>

                {/* Description */}
                <View style={styles.inputContainer}>
                    <MaterialIcons name="edit" size={20} color={COLORS.textMuted} />
                    <TextInput
                        style={styles.descInput}
                        placeholder="Descrição (opcional)"
                        placeholderTextColor={COLORS.textMuted}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Categories */}
                <Text style={styles.sectionTitle}>Categoria</Text>
                <View style={styles.categoriesGrid}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryItem,
                                selectedCategory?.id === cat.id && styles.categoryItemActive,
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <MaterialIcons
                                name={cat.icon}
                                size={24}
                                color={selectedCategory?.id === cat.id ? COLORS.primary : COLORS.textSecondary}
                            />
                            <Text style={[
                                styles.categoryName,
                                selectedCategory?.id === cat.id && styles.categoryNameActive,
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? 'Salvando...' : 'Salvar Transação'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SIZES.paddingXl, marginBottom: 24,
    },
    title: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
    typeToggle: {
        flexDirection: 'row', marginHorizontal: SIZES.paddingXl, gap: 12, marginBottom: 32,
    },
    typeButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 14, borderRadius: SIZES.radius, backgroundColor: COLORS.surface,
        borderWidth: 1, borderColor: COLORS.border,
    },
    typeButtonExpense: { backgroundColor: COLORS.expense, borderColor: COLORS.expense },
    typeButtonIncome: { backgroundColor: COLORS.income, borderColor: COLORS.income },
    typeText: { fontSize: SIZES.md, color: COLORS.textSecondary, fontWeight: '600' },
    typeTextActive: { color: '#FFF' },
    amountContainer: {
        flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center',
        marginBottom: 32, paddingHorizontal: SIZES.paddingXl,
    },
    currency: { fontSize: SIZES.xxl, color: COLORS.textSecondary, fontWeight: '600', marginRight: 4 },
    amountInput: {
        fontSize: 48, fontWeight: '700', color: COLORS.textPrimary, minWidth: 100, textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius, marginHorizontal: SIZES.paddingXl, paddingHorizontal: 16,
        height: 56, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
    },
    descInput: { flex: 1, marginLeft: 12, color: COLORS.textPrimary, fontSize: SIZES.md },
    sectionTitle: {
        fontSize: SIZES.base, fontWeight: '600', color: COLORS.textSecondary,
        paddingHorizontal: SIZES.paddingXl, marginBottom: 12,
    },
    categoriesGrid: {
        flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.paddingXl, gap: 10,
        marginBottom: 32,
    },
    categoryItem: {
        width: '30%', alignItems: 'center', paddingVertical: 16, borderRadius: SIZES.radius,
        backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, gap: 6,
    },
    categoryItemActive: {
        backgroundColor: COLORS.primaryMuted, borderColor: COLORS.primary,
    },
    categoryName: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    categoryNameActive: { color: COLORS.primary, fontWeight: '600' },
    saveButton: {
        backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl, height: 56,
        justifyContent: 'center', alignItems: 'center', marginHorizontal: SIZES.paddingXl,
        marginBottom: 32, ...SHADOWS.glow,
    },
    saveButtonText: { color: COLORS.textOnPrimary, fontSize: SIZES.lg, fontWeight: '700' },
});
