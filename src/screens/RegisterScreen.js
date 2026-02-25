import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { signUp } from '../services/supabase';
import useStore from '../store/useStore';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const setUser = useStore((s) => s.setUser);
    const setSession = useStore((s) => s.setSession);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Atenção', 'As senhas não coincidem.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await signUp(email.trim(), password, name.trim());
            if (error) throw error;
            if (data.session) {
                setSession(data.session);
                setUser(data.user);
            } else {
                Alert.alert('Sucesso', 'Conta criada! Verifique seu e-mail para confirmar.', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (err) {
            Alert.alert('Erro', err.message || 'Não foi possível criar a conta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.inner}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <Text style={styles.title}>Criar Conta</Text>
                <Text style={styles.subtitle}>Comece sua jornada financeira</Text>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="person" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nome completo"
                            placeholderTextColor={COLORS.textMuted}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="E-mail"
                            placeholderTextColor={COLORS.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="lock" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            placeholderTextColor={COLORS.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <MaterialIcons
                                name={showPassword ? 'visibility' : 'visibility-off'}
                                size={20}
                                color={COLORS.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="lock-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar senha"
                            placeholderTextColor={COLORS.textMuted}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.registerButton, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.textOnPrimary} />
                        ) : (
                            <Text style={styles.registerButtonText}>Criar Conta</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Já tem uma conta? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.loginLink}>Entrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.paddingXl,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: SIZES.paddingXl,
    },
    title: {
        fontSize: SIZES.xxxl,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: SIZES.base,
        color: COLORS.textSecondary,
        marginBottom: 32,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SIZES.padding,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: SIZES.base,
    },
    registerButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusXl,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        ...SHADOWS.glow,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: COLORS.textOnPrimary,
        fontSize: SIZES.lg,
        fontWeight: '700',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    loginText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.md,
    },
    loginLink: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        fontWeight: '600',
    },
});
