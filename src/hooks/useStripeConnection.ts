'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface StripeConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  stripeAccountId: string | null;
  charges_enabled: boolean;
}

export function useStripeConnection(empresaId?: string) {
  const [state, setState] = useState<StripeConnectionState>({
    isConnected: false,
    isLoading: true,
    error: null,
    stripeAccountId: null,
    charges_enabled: false
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkStripeConnection() {
      if (!empresaId) {
        console.error('❌ No se proporcionó ID de empresa');
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: new Error('No se proporcionó ID de empresa')
        }));
        return;
      }

      try {
        // Primero verificamos si existe la empresa
        const { data: empresa, error: empresaError } = await supabase
          .from('empresas')
          .select('id')
          .eq('id', empresaId)
          .single();

        if (empresaError || !empresa) {
          throw new Error('No se encontró la empresa especificada');
        }

        // Luego buscamos la conexión de Stripe
        const { data: stripeConnection, error: stripeError } = await supabase
          .from('stripe_connections')
          .select('*')
          .eq('empresa_id', empresaId)
          .maybeSingle();

        if (stripeError) {
          throw stripeError;
        }

        // Validamos el estado de la conexión
        const isValidConnection = stripeConnection && 
                                stripeConnection.stripe_account_id && 
                                stripeConnection.charges_enabled;

        setState({
          isConnected: !!isValidConnection,
          isLoading: false,
          error: null,
          stripeAccountId: stripeConnection?.stripe_account_id || null,
          charges_enabled: stripeConnection?.charges_enabled || false
        });

        // Log informativo
        if (!isValidConnection) {
          console.warn('⚠️ La cuenta de Stripe no está completamente configurada:', {
            tieneConexion: !!stripeConnection,
            tieneCuentaStripe: !!stripeConnection?.stripe_account_id,
            cargosHabilitados: stripeConnection?.charges_enabled
          });
        }

      } catch (error) {
        console.error('❌ Error al verificar la conexión de Stripe:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
          isConnected: false
        }));
      }
    }

    checkStripeConnection();
  }, [empresaId, supabase]);

  return state;
} 