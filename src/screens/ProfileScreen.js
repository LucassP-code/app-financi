import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/theme';
import { signOut } from '../services/supabase';
import useStore from '../store/useStore';

export default function ProfileScreen({ navigation }) {
    const user = useStore((s) => s.user);
    const setUser = useStore((s) => s.setUser);
    const setSession = useStore((s) => s.setSession);
    const userName = user?.user_metadata?.full_name || 'Usuário';
    const userEmail = user?.email || '';

    const handleLogout = () => {
        Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                    setUser(null);
                    setSession(null);
                },
            },
        ]);
    };

    const menuItems = [
        { icon: 'person', label: 'Editar Perfil', onPress: () => { } },
        { icon: 'notifications', label: 'Notificações', onPress: () => { } },
        { icon: 'security', label: 'Segurança', onPress: () => { } },
        { icon: 'palette', label: 'Aparência', onPress: () => { } },
        { icon: 'help-outline', label: 'Ajuda e Suporte', onPress: () => { } },
        { icon: 'info-outline', label: 'Sobre o App', onPress: () => { } },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
            </View>

            {/* AI Button */}
            <TouchableOpacity
                style={styles.aiCard}
                onPress={() => navigation.navigate('AIAgent')}
                activeOpacity={0.8}
            >
                <View style={styles.aiCardLeft}>
                    <MaterialIcons name="smart-toy" size={28} color={COLORS.primary} />
                    <View>
                        <Text style={styles.aiCardTitle}>FinBot - Consultor IA</Text>
                        <Text style={styles.aiCardSubtitle}>Tire dúvidas sobre suas finanças</Text>
                    </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
                        <View style={styles.menuItemLeft}>
                            <View style={styles.menuIcon}>
                                <MaterialIcons name={item.icon} size={22} color={COLORS.textSecondary} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                <MaterialIcons name="logout" size={22} color={COLORS.expense} />
                <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>

            <Text style={styles.version}>App Financi v1.0.0</Text>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
    profileHeader: { alignItems: 'center', marginBottom: 24 },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
        borderWidth: 2, borderColor: COLORS.primary,
    },
    avatarText: { fontSize: 32, fontWeight: '700', color: COLORS.primary },
    userName: { fontSize: SIZES.xxl, fontWeight: '700', color: COLORS.textPrimary },
    userEmail: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
    aiCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.primaryMuted, borderRadius: SIZES.radiusLg,
        marginHorizontal: SIZES.paddingXl, padding: SIZES.padding, marginBottom: 24,
        borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)',
    },
    aiCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    aiCardTitle: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
    aiCardSubtitle: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    menuSection: { paddingHorizontal: SIZES.paddingXl, marginBottom: 24 },
    menuItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: SIZES.radius,
        padding: SIZES.padding, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: SIZES.md, color: COLORS.textPrimary },
    logoutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginHorizontal: SIZES.paddingXl, paddingVertical: 16, borderRadius: SIZES.radius,
        backgroundColor: 'rgba(255, 82, 82, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 82, 82, 0.3)',
    },
    logoutText: { fontSize: SIZES.base, fontWeight: '600', color: COLORS.expense },
    version: { textAlign: 'center', fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 24 },
});
