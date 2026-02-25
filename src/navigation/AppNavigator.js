import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { COLORS, SIZES } from '../theme/theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIAgentScreen from '../screens/AIAgentScreen';
import GoalsScreen from '../screens/GoalsScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import ReportsScreen from '../screens/ReportsScreen';

import useStore from '../store/useStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="DashboardMain" component={DashboardScreen} />
            <HomeStack.Screen name="Reports" component={ReportsScreen} />
            <HomeStack.Screen name="Budgets" component={BudgetsScreen} />
            <HomeStack.Screen name="Goals" component={GoalsScreen} />
        </HomeStack.Navigator>
    );
}

function getTabIcon(routeName, color, size) {
    let iconName;
    switch (routeName) {
        case 'Home': iconName = 'home'; break;
        case 'Transações': iconName = 'swap-horiz'; break;
        case 'Adicionar': iconName = 'add'; break;
        case 'Investimentos': iconName = 'trending-up'; break;
        case 'Perfil': iconName = 'person'; break;
        default: iconName = 'circle';
    }
    return <MaterialIcons name={iconName} size={size} color={color} />;
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIcon: ({ color, size }) => getTabIcon(route.name, color, size),
            })}
        >
            <Tab.Screen name="Home" component={HomeStackNavigator} />
            <Tab.Screen name="Transações" component={TransactionsScreen} />
            <Tab.Screen
                name="Adicionar"
                component={AddTransactionScreen}
                options={{
                    tabBarIcon: () => (
                        <View style={styles.fab}>
                            <MaterialIcons name="add" size={28} color={COLORS.textOnPrimary} />
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tab.Screen name="Investimentos" component={InvestmentsScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const isAuthenticated = useStore((state) => state.isAuthenticated);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="AIAgent" component={AIAgentScreen} />
                        <Stack.Screen
                            name="AddTransaction"
                            component={AddTransactionScreen}
                            options={{ presentation: 'modal' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        height: 70,
        paddingBottom: 8,
        paddingTop: 8,
    },
    tabLabel: {
        fontSize: SIZES.xs,
        marginTop: 2,
    },
    fab: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});
