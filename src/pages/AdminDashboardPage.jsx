import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Users, RefreshCw, LogOut, Radio } from 'lucide-react';
import { supabase } from '../services/supabase';
import useStore from '../store/useStore';
import { t } from '../utils/helpers';

export default function AdminDashboardPage() {
    const user = useStore((s) => s.user);
    const clearStore = useStore((s) => s.clearStore);
    const navigate = useNavigate();
    
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [requestingUserId, setRequestingUserId] = useState(null);

    // Proteção de rota extra para garantir que só o admin acesse
    useEffect(() => {
        const isAdmin = user && (user.email?.toLowerCase() === 'admin@app.com' || user.email?.toLowerCase() === 'amin_lpereira@app.com');
        if (!user || !isAdmin) {
            navigate('/');
        }
    }, [user, navigate]);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_locations')
                .select('*')
                .order('updated_at', { ascending: false });
                
            if (error) {
                console.error("Erro ao buscar localizações", error);
            } else {
                setLocations(data || []);
            }
        } catch (err) {
            console.error("Erro", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        const isAdmin = user && (user.email?.toLowerCase() === 'admin@app.com' || user.email?.toLowerCase() === 'amin_lpereira@app.com');
        if (isAdmin) {
            fetchLocations();
        }
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        clearStore();
        navigate('/login');
    };

    const openMap = (lat, lng) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    const requestRealtimeLocation = async (userId) => {
        setRequestingUserId(userId);
        
        const channel = supabase.channel(`location_requests:${userId}`);
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'request_location',
                    payload: { timestamp: Date.now() },
                });
                
                // Remove o canal e atualiza a lista após 5 segundos
                setTimeout(() => {
                    supabase.removeChannel(channel);
                    fetchLocations(); 
                    setRequestingUserId(null);
                }, 5000);
            }
        });
    };

    return (
        <div className="page pb-24" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div className="page-header">
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={16} color="var(--primary)" /> Painel de Segurança
                    </p>
                    <h1 style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
                </div>
                <button className="btn-outline" onClick={handleLogout} style={{ border: '1px solid var(--expense)', color: 'var(--expense)' }}>
                    <LogOut size={16} /> Sair
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} /> Usuários Rastreados ({locations.length})
                </h2>
                <button onClick={fetchLocations} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'spin' : ''} /> Atualizar
                </button>
            </div>

            <div className="card-solid" style={{ padding: '0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando dados...</div>
                ) : locations.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum usuário com rastreio ativo no momento.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Usuário</th>
                                    <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Email</th>
                                    <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Última Atualização</th>
                                    <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center' }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map((loc) => (
                                    <tr key={loc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{loc.full_name}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{loc.email}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {new Date(loc.updated_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => requestRealtimeLocation(loc.user_id)}
                                                disabled={requestingUserId === loc.user_id}
                                                style={{ 
                                                    background: 'transparent', 
                                                    color: 'var(--text-secondary)', 
                                                    border: '1px solid var(--border)', 
                                                    padding: '8px 16px', 
                                                    borderRadius: '8px',
                                                    cursor: requestingUserId === loc.user_id ? 'wait' : 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontWeight: '600'
                                                }}
                                                title="Forçar atualização em tempo real no dispositivo"
                                            >
                                                <Radio size={16} className={requestingUserId === loc.user_id ? 'spin' : ''} color={requestingUserId === loc.user_id ? 'var(--primary)' : 'currentColor'} /> 
                                                {requestingUserId === loc.user_id ? 'Buscando...' : 'Puxar Tempo Real'}
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setSelectedUser(loc);
                                                    openMap(loc.latitude, loc.longitude);
                                                }}
                                                style={{ 
                                                    background: 'var(--primary-muted)', 
                                                    color: 'var(--primary)', 
                                                    border: '1px solid var(--primary)', 
                                                    padding: '8px 16px', 
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                <MapPin size={16} /> Ver Mapa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
