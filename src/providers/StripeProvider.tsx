'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode, useEffect, useState } from 'react';
import { StripeProvider as CustomStripeProvider } from '@/contexts/StripeContext';
import { useStripeConfig } from '@/hooks/useStripeConfig';

interface StripeProviderProps {
  children: ReactNode;
  empresaId: string;
}

export function StripeProvider({ children, empresaId }: StripeProviderProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const config = useStripeConfig(empresaId);

  useEffect(() => {
    if (!config.stripeAccountId) return;

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('❌ No se encontró la clave pública de Stripe');
      return;
    }

    // Inicializar Stripe con la cuenta conectada del club
    setStripePromise(loadStripe(publishableKey, {
      stripeAccount: config.stripeAccountId
    }));
  }, [config.stripeAccountId]);

  // Siempre renderizamos el contenido, pero el contexto tendrá
  // la información del estado de la conexión
  return (
    <Elements stripe={stripePromise}>
      <CustomStripeProvider 
        empresaId={config.stripeAccountId}
        isConnected={config.isConnected}
        isLoading={config.isLoading}
        error={config.error}
        charges_enabled={config.charges_enabled}
      >
        {children}
      </CustomStripeProvider>
    </Elements>
  );
} 