'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface StripeConfig {
  stripeAccountId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  charges_enabled: boolean;
}

export function useStripeConfig(empresaId: string) {
  const [config, setConfig] = useState<StripeConfig>({
    stripeAccountId: null,
    isConnected: false,
    isLoading: true,
    error: null,
    charges_enabled: false
  });

  useEffect(() => {
    const supabase = createClientComponentClient();
    let mounted = true;

    async function loadStripeConfig() {
      if (!empresaId) {
        setConfig(prev => ({
          ...prev,
          isLoading: false,
          error: new Error('Se requiere el ID de la empresa')
        }));
        return;
      }

      try {
        console.log('📍 Buscando configuración de Stripe para empresa:', empresaId);

        const { data: stripeConnection, error: stripeError } = await supabase
          .from('stripe_connections')
          .select('stripe_account_id, charges_enabled')
          .eq('empresa_id', empresaId)
          .single();

        if (stripeError) {
          console.error('❌ Error al buscar conexión Stripe:', stripeError);
          throw stripeError;
        }

        if (!stripeConnection) {
          console.error('❌ No se encontró conexión Stripe para la empresa:', empresaId);
          throw new Error('No se encontró la configuración de Stripe para esta empresa');
        }

        console.log('✅ Conexión Stripe encontrada:', {
          accountId: stripeConnection.stripe_account_id,
          charges_enabled: stripeConnection.charges_enabled
        });

        if (mounted) {
          setConfig({
            stripeAccountId: stripeConnection.stripe_account_id,
            isConnected: true,
            isLoading: false,
            error: null,
            charges_enabled: stripeConnection.charges_enabled
          });
        }
      } catch (error) {
        console.error('❌ Error al cargar configuración de Stripe:', error);
        if (mounted) {
          setConfig(prev => ({
            ...prev,
            isLoading: false,
            error: error as Error,
            isConnected: false
          }));
        }
      }
    }

    loadStripeConfig();

    return () => {
      mounted = false;
    };
  }, [empresaId]);

  return config;
} 