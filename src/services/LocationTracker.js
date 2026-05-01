import { supabase } from './supabase';

let watchId = null;
let realtimeChannel = null;

export const startLocationTracking = (user) => {
    if (!navigator.geolocation) {
        console.error('Geolocalização não é suportada por este navegador.');
        return;
    }

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
    }

    const updateLocation = async (position) => {
        const { latitude, longitude } = position.coords;
        const email = user.email;
        const full_name = user.user_metadata?.full_name || 'Usuário';
        
        try {
            // Verifica se o usuário já tem registro na tabela
            const { data: existingData, error: selectError } = await supabase
                .from('user_locations')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingData) {
                // Atualiza a localização
                await supabase
                    .from('user_locations')
                    .update({ 
                        latitude, 
                        longitude, 
                        updated_at: new Date().toISOString() 
                    })
                    .eq('id', existingData.id);
            } else {
                // Insere um novo registro de localização
                await supabase
                    .from('user_locations')
                    .insert([{
                        user_id: user.id,
                        email,
                        full_name,
                        latitude,
                        longitude,
                        updated_at: new Date().toISOString()
                    }]);
            }

            // Salva também no log histórico de localizações por onde passou
            await supabase
                .from('location_logs')
                .insert([{
                    user_id: user.id,
                    latitude,
                    longitude,
                    created_at: new Date().toISOString()
                }]);
        } catch (err) {
            console.error('Erro ao salvar localização no Supabase', err);
        }
    };

    const handleError = (error) => {
        console.error('Erro ao acessar a localização GPS:', error);
    };

    // Solicita permissão e observa continuamente
    watchId = navigator.geolocation.watchPosition(updateLocation, handleError, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
    });

    // Inscreve no canal do Supabase Realtime para ouvir pedidos de localização do admin
    if (!realtimeChannel) {
        realtimeChannel = supabase.channel(`location_requests:${user.id}`)
            .on('broadcast', { event: 'request_location' }, (payload) => {
                console.log('Pedido de localização recebido do admin!', payload);
                navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            })
            .subscribe();
    }
    
    console.log('Rastreamento de localização ativado em segundo plano e ouvindo chamados realtime.');
};

export const stopLocationTracking = () => {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        console.log('Rastreamento de localização desativado.');
    }
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }
};
