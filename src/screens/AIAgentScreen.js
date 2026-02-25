import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
    Alert, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../theme/theme';
import { sendMessage, analyzeImage, clearChat } from '../services/gemini';
import { formatCurrency } from '../utils/helpers';
import { addTransaction, supabase } from '../services/supabase';
import useStore from '../store/useStore';

const CATEGORY_MAP = {
    'alimentação': 'alimentacao',
    'alimentacao': 'alimentacao',
    'comida': 'alimentacao',
    'restaurante': 'alimentacao',
    'lanche': 'alimentacao',
    'mercado': 'alimentacao',
    'supermercado': 'alimentacao',
    'transporte': 'transporte',
    'uber': 'transporte',
    'combustível': 'transporte',
    'gasolina': 'transporte',
    'moradia': 'moradia',
    'aluguel': 'moradia',
    'conta de luz': 'moradia',
    'energia': 'moradia',
    'água': 'moradia',
    'internet': 'moradia',
    'saúde': 'saude',
    'saude': 'saude',
    'farmácia': 'saude',
    'farmacia': 'saude',
    'médico': 'saude',
    'lazer': 'lazer',
    'entretenimento': 'lazer',
    'cinema': 'lazer',
    'educação': 'educacao',
    'educacao': 'educacao',
    'curso': 'educacao',
    'escola': 'educacao',
    'vestuário': 'vestuario',
    'vestuario': 'vestuario',
    'roupa': 'vestuario',
    'tecnologia': 'tecnologia',
    'eletrônico': 'tecnologia',
    'celular': 'tecnologia',
    'salário': 'salario',
    'salario': 'salario',
    'freelance': 'freelance',
    'investimento': 'investimento',
    'presente': 'presente',
};

const mapCategory = (suggestion) => {
    if (!suggestion) return 'outros';
    const lower = suggestion.toLowerCase().trim();
    return CATEGORY_MAP[lower] || 'outros';
};

export default function AIAgentScreen({ navigation }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef();
    const chatMessages = useStore((s) => s.chatMessages);
    const addChatMessage = useStore((s) => s.addChatMessage);
    const storeClearChat = useStore((s) => s.clearChat);
    const transactions = useStore((s) => s.transactions);
    const getSummary = useStore((s) => s.getSummary);
    const user = useStore((s) => s.user);
    const setTransactions = useStore((s) => s.setTransactions);

    const buildContext = () => {
        const summary = getSummary();
        return JSON.stringify({
            saldo: summary.balance,
            receitas_mes: summary.totalIncome,
            despesas_mes: summary.totalExpense,
            ultimas_transacoes: transactions.slice(0, 10).map((t) => ({
                tipo: t.type,
                valor: t.amount,
                categoria: t.categories?.name || t.description,
                data: t.date,
            })),
        });
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input.trim(), timestamp: Date.now() };
        addChatMessage(userMsg);
        setInput('');
        setLoading(true);

        const { response, error } = await sendMessage(userMsg.text, buildContext());

        addChatMessage({
            role: 'assistant',
            text: response || error || 'Erro ao processar.',
            timestamp: Date.now(),
        });

        setLoading(false);
    };

    const pickImage = async (useCamera = false) => {
        try {
            let result;

            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar fotos de comprovantes.');
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                    base64: true,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permissão necessária', 'Permita o acesso à galeria para selecionar comprovantes.');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                    base64: true,
                });
            }

            if (!result.canceled && result.assets[0]) {
                handleImageAnalysis(result.assets[0]);
            }
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível acessar a imagem.');
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            '📸 Analisar Comprovante',
            'Escolha como enviar a imagem:',
            [
                { text: 'Câmera', onPress: () => pickImage(true) },
                { text: 'Galeria', onPress: () => pickImage(false) },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleImageAnalysis = async (imageAsset) => {
        // Adiciona preview da imagem no chat
        addChatMessage({
            role: 'user',
            text: '📷 Comprovante enviado para análise',
            imageUri: imageAsset.uri,
            timestamp: Date.now(),
        });

        setLoading(true);

        const { response, transactions: detectedTx, error } = await analyzeImage(
            imageAsset.base64,
            imageAsset.mimeType || 'image/jpeg',
            input.trim() || undefined
        );
        setInput('');

        const botText = response || error || 'Não consegui analisar a imagem.';
        addChatMessage({
            role: 'assistant',
            text: botText,
            detectedTransactions: detectedTx || [],
            timestamp: Date.now(),
        });

        setLoading(false);
    };

    const handleSaveTransaction = async (tx) => {
        if (!user) return;
        try {
            const categoryId = mapCategory(tx.category_suggestion);
            const { data, error } = await addTransaction({
                user_id: user.id,
                type: tx.type || 'expense',
                amount: tx.amount,
                description: tx.description || 'Comprovante',
                category_id: categoryId,
                date: tx.date ? new Date(tx.date).toISOString() : new Date().toISOString(),
            });

            if (error) throw error;

            // Atualiza lista local de transações
            if (data) {
                setTransactions([data, ...transactions]);
            }

            Alert.alert('✅ Salvo!', `Transação "${tx.description}" de ${formatCurrency(tx.amount)} registrada com sucesso!`);

            addChatMessage({
                role: 'assistant',
                text: `✅ Transação registrada com sucesso!\n• ${tx.description}\n• ${formatCurrency(tx.amount)}\n• Categoria: ${tx.category_suggestion}`,
                timestamp: Date.now(),
            });
        } catch (err) {
            Alert.alert('Erro ao salvar', err.message || 'Tente novamente.');
        }
    };

    const handleClear = () => {
        clearChat();
        storeClearChat();
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
                {!isUser && (
                    <View style={styles.botAvatar}>
                        <MaterialIcons name="smart-toy" size={20} color={COLORS.primary} />
                    </View>
                )}
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
                    {/* Image preview */}
                    {item.imageUri && (
                        <Image source={{ uri: item.imageUri }} style={styles.chatImage} resizeMode="cover" />
                    )}
                    <Text style={[styles.messageText, isUser && styles.userText]}>{item.text}</Text>

                    {/* Botões para salvar transações detectadas */}
                    {item.detectedTransactions && item.detectedTransactions.length > 0 && (
                        <View style={styles.txActions}>
                            <Text style={styles.txDetectedLabel}>Transações detectadas:</Text>
                            {item.detectedTransactions.map((tx, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.saveTxBtn}
                                    onPress={() => handleSaveTransaction(tx)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="add-circle" size={18} color={COLORS.primary} />
                                    <Text style={styles.saveTxText}>
                                        Salvar: {tx.description} - {formatCurrency(tx.amount)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const QUICK_PROMPTS = [
        '📊 Analise meus gastos',
        '💡 Dicas para economizar',
        '🎯 Como investir melhor',
        '📸 Analisar comprovante',
    ];

    const handleQuickPrompt = (prompt) => {
        const clean = prompt.replace(/^[\p{Emoji}\s]+/u, '');
        if (prompt.includes('📸')) {
            showImageOptions();
        } else {
            setInput(clean);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={10}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.headerAvatar}>
                        <MaterialIcons name="smart-toy" size={20} color={COLORS.primary} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>FinBot</Text>
                        <Text style={styles.headerSubtitle}>Consultor IA • OCR</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleClear}>
                    <MaterialIcons name="refresh" size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Chat */}
            {chatMessages.length === 0 ? (
                <View style={styles.welcomeContainer}>
                    <View style={styles.welcomeIcon}>
                        <MaterialIcons name="smart-toy" size={48} color={COLORS.primary} />
                    </View>
                    <Text style={styles.welcomeTitle}>Olá! Sou o FinBot 🤖</Text>
                    <Text style={styles.welcomeText}>
                        Seu consultor financeiro com IA.{'\n'}Analiso gastos, comprovantes e dou dicas!
                    </Text>

                    {/* OCR Feature Card */}
                    <View style={styles.ocrCard}>
                        <MaterialIcons name="document-scanner" size={24} color={COLORS.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.ocrCardTitle}>Novo: OCR Inteligente</Text>
                            <Text style={styles.ocrCardText}>
                                Tire foto de comprovantes e registro automaticamente!
                            </Text>
                        </View>
                    </View>

                    <View style={styles.quickPrompts}>
                        {QUICK_PROMPTS.map((prompt, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.quickPromptBtn}
                                onPress={() => handleQuickPrompt(prompt)}
                            >
                                <Text style={styles.quickPromptText}>{prompt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={chatMessages}
                    renderItem={renderMessage}
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={styles.chatList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}

            {/* Loading */}
            {loading && (
                <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.typingText}>FinBot está analisando...</Text>
                </View>
            )}

            {/* Input Bar */}
            <View style={styles.inputBar}>
                <TouchableOpacity style={styles.cameraBtn} onPress={showImageOptions}>
                    <MaterialIcons name="photo-camera" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Pergunte ou envie foto..."
                    placeholderTextColor={COLORS.textMuted}
                    value={input}
                    onChangeText={setInput}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!input.trim() || loading}
                >
                    <MaterialIcons name="send" size={20} color={input.trim() && !loading ? COLORS.textOnPrimary : COLORS.textMuted} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SIZES.paddingXl, paddingTop: 60, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary },
    headerSubtitle: { fontSize: SIZES.xs, color: COLORS.textMuted },
    welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    welcomeIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    welcomeTitle: { fontSize: SIZES.xxl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
    welcomeText: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
    ocrCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: COLORS.primaryMuted, borderRadius: SIZES.radius,
        padding: 14, marginBottom: 20, width: '100%',
        borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)',
    },
    ocrCardTitle: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },
    ocrCardText: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
    quickPrompts: { gap: 8, width: '100%' },
    quickPromptBtn: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 14, borderWidth: 1, borderColor: COLORS.border },
    quickPromptText: { fontSize: SIZES.md, color: COLORS.textPrimary },
    chatList: { padding: SIZES.paddingXl, paddingBottom: 8 },
    messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
    messageRowUser: { justifyContent: 'flex-end' },
    botAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    messageBubble: { maxWidth: '78%', padding: 14, borderRadius: SIZES.radiusLg },
    userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    botBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
    messageText: { fontSize: SIZES.md, color: COLORS.textPrimary, lineHeight: 20 },
    userText: { color: COLORS.textOnPrimary },
    chatImage: { width: 200, height: 150, borderRadius: 8, marginBottom: 8 },
    txActions: { marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
    txDetectedLabel: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: '600', marginBottom: 6 },
    saveTxBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: COLORS.primaryMuted, borderRadius: 8,
        padding: 10, marginBottom: 4,
    },
    saveTxText: { fontSize: SIZES.sm, color: COLORS.textPrimary, flex: 1 },
    typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: SIZES.paddingXl, paddingVertical: 8 },
    typingText: { fontSize: SIZES.sm, color: COLORS.textMuted },
    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: SIZES.padding,
        paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border,
        backgroundColor: COLORS.surface, gap: 8,
    },
    cameraBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center', alignItems: 'center',
    },
    input: {
        flex: 1, backgroundColor: COLORS.background, borderRadius: SIZES.radiusLg,
        paddingHorizontal: 16, paddingVertical: 12, color: COLORS.textPrimary,
        fontSize: SIZES.md, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border,
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: COLORS.surface },
});
