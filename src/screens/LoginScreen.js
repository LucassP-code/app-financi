import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { signIn } from '../services/supabase';
import useStore from '../store/useStore';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const setUser = useStore((s) => s.setUser);
    const setSession = useStore((s) => s.setSession);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await signIn(email.trim(), password);
            if (error) throw error;
            setSession(data.session);
            setUser(data.user);
        } catch (err) {
            Alert.alert('Erro', err.message || 'Não foi possível fazer login.');
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
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <MaterialIcons name="bolt" size={48} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Fast Smart</Text>
                    <Text style={styles.subtitle}>Secure Banking</Text>
                    <Text style={styles.description}>
                        Seu dinheiro, gerenciado com precisão{'\n'}para uma vida financeira mais inteligente.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
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

                    <TouchableOpacity style={styles.forgotButton}>
                        <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.textOnPrimary} />
                        ) : (
                            <Text style={styles.loginButtonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Não tem uma conta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Criar conta</Text>
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        ...SHADOWS.glow,
    },
    title: {
        fontSize: SIZES.xxxl,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: SIZES.xl,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 8,
    },
    description: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
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
    forgotButton: {
        alignSelf: 'flex-end',
    },
    forgotText: {
        color: COLORS.primary,
        fontSize: SIZES.sm,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusXl,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        ...SHADOWS.glow,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: COLORS.textOnPrimary,
        fontSize: SIZES.lg,
        fontWeight: '700',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    registerText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.md,
    },
    registerLink: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        fontWeight: '600',
    },
});
