'use client';

import { useState, useEffect } from 'react';
import { useStripe as useStripeContext } from '@/contexts/StripeContext';

interface StoredCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export function useStoredCards() {
  const [cards, setCards] = useState<StoredCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { stripeAccountId, isConnected } = useStripeContext();

  useEffect(() => {
    async function loadCards() {
      if (!stripeAccountId || !isConnected) {
        setCards([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/stripe/payment-methods', {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar las tarjetas guardadas');
        }

        const data = await response.json();
        setCards(data.paymentMethods);
      } catch (err) {
        setError(err as Error);
        console.error('Error al cargar las tarjetas:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCards();
  }, [stripeAccountId, isConnected]);

  const deleteCard = async (cardId: string) => {
    if (!stripeAccountId) return;

    try {
      const response = await fetch(`/api/stripe/payment-methods/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la tarjeta');
      }

      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    } catch (err) {
      console.error('Error al eliminar la tarjeta:', err);
      throw err;
    }
  };

  return {
    cards,
    isLoading,
    error,
    deleteCard
  };
} 