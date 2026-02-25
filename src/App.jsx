import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import useStore from './store/useStore';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AddTransactionPage from './pages/AddTransactionPage';
import InvestmentsPage from './pages/InvestmentsPage';
import GoalsPage from './pages/GoalsPage';
import BudgetsPage from './pages/BudgetsPage';
import ReportsPage from './pages/ReportsPage';
import AIAgentPage from './pages/AIAgentPage';
import ProfilePage from './pages/ProfilePage';
import PreferencesPage from './pages/PreferencesPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import SecurityPage from './pages/SecurityPage';
import HelpPage from './pages/HelpPage';

function AppLayout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            {!isMobile && <Sidebar />}
            <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', position: 'relative' }}>
                {children}
            </main>
            {isMobile && <BottomNav />}
        </div>
    );
}

function ProtectedRoute({ children }) {
    const isAuthenticated = useStore((s) => s.isAuthenticated);
    return isAuthenticated ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" />;
}

export default function App() {
    const setUser = useStore((s) => s.setUser);
    const setSession = useStore((s) => s.setSession);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #1E1E1E', borderTop: '4px solid #8EFF00', borderRadius: '50%', animation: 'spin 0.8s linear infinite', boxShadow: '0 0 20px rgba(142,255,0,0.2)' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                <Route path="/add" element={<ProtectedRoute><AddTransactionPage /></ProtectedRoute>} />
                <Route path="/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
                <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
                <Route path="/budgets" element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AIAgentPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/preferences" element={<ProtectedRoute><PreferencesPage /></ProtectedRoute>} />
                <Route path="/payment-methods" element={<ProtectedRoute><PaymentMethodsPage /></ProtectedRoute>} />
                <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}
