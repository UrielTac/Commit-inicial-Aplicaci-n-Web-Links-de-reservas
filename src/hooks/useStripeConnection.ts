'use client';

import { useState, useEffect } from 'react';

interface StripeConnection {
  stripeAccountId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useStripeConnection(): StripeConnection {
  const [connection, setConnection] = useState<StripeConnection>({
    stripeAccountId: null,
    isConnected: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch('/api/stripe/connection-status');
        const data = await response.json();

        if (!response.ok) {
          setConnection({
            stripeAccountId: null,
            isConnected: false,
            isLoading: false,
            error: data.error || 'Error al verificar la conexión con Stripe'
          });
          return;
        }

        setConnection({
          stripeAccountId: data.stripeAccountId,
          isConnected: data.isConnected,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error al verificar la conexión con Stripe:', error);
        setConnection({
          stripeAccountId: null,
          isConnected: false,
          isLoading: false,
          error: 'Error al verificar la conexión con Stripe'
        });
      }
    }

    checkConnection();
  }, []);

  return connection;
} 