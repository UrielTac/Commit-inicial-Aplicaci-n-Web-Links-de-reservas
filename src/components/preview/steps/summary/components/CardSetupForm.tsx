'use client';

import { useState, useEffect } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import './stripe-elements.css';
import { useStripeCustomer } from '@/hooks/useStripeCustomer';

interface CardSetupFormProps {
  stripeAccountId: string;
  userId?: string;
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: any) => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

// Constante para desarrollo
const DEV_CUSTOMER_ID = process.env.NEXT_PUBLIC_STRIPE_TEST_CUSTOMER_ID;
const DEV_USER_ID = process.env.NEXT_PUBLIC_TEST_USER_ID;

// Configuración base para todos los elementos
const BASE_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

// Configuraciones específicas para cada elemento
const CARD_NUMBER_OPTIONS = {
  ...BASE_ELEMENT_OPTIONS,
  showIcon: true
};

const CARD_EXPIRY_OPTIONS = {
  ...BASE_ELEMENT_OPTIONS
};

const CARD_CVC_OPTIONS = {
  ...BASE_ELEMENT_OPTIONS
};

export function CardSetupForm({
  stripeAccountId,
  userId = process.env.NEXT_PUBLIC_TEST_USER_ID || '',
  onSuccess,
  onError,
  onBack,
  theme
}: CardSetupFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false
  });

  const { getOrCreateCustomer } = useStripeCustomer({
    stripeAccountId,
    userId
  });

  useEffect(() => {
    if (!stripe || !elements) {
      console.warn('⚠️ Stripe.js no ha sido inicializado correctamente');
    }
    if (!stripeAccountId) {
      console.warn('⚠️ No se ha proporcionado un ID de cuenta de Stripe');
    }
    if (!userId) {
      console.warn('⚠️ No se ha proporcionado un ID de usuario');
    }
  }, [stripe, elements, stripeAccountId, userId]);

  const handleElementChange = (event: any) => {
    const { elementType, error, complete } = event;
    console.log(`💳 Cambio en elemento ${elementType}:`, { complete, error: error?.message });

    setCardComplete(prev => ({
      ...prev,
      [elementType]: complete
    }));
    
    if (error) {
      setError(error.message);
    } else {
      setError(null);
    }
  };

  const isFormComplete = () => {
    return Object.values(cardComplete).every(Boolean);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      console.error('❌ Stripe no está disponible');
      setError('Error de configuración del sistema de pago');
      return;
    }

    if (!stripeAccountId) {
      console.error('❌ No se ha proporcionado un ID de cuenta de Stripe');
      setError('Error de configuración de la cuenta');
      return;
    }

    if (!isFormComplete()) {
      setError('Por favor, completa todos los campos de la tarjeta');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Iniciando proceso de setup con cuenta:', stripeAccountId);
      
      // 1. Obtener o crear customer
      const customerData = await getOrCreateCustomer();
      console.log('✅ Cliente obtenido:', customerData);

      // 2. Crear Setup Intent
      const setupIntentResponse = await fetch('/api/stripe/setup-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Stripe-Account': stripeAccountId
        },
        body: JSON.stringify({ 
          customerId: customerData.stripeCustomerId,
          timestamp: new Date().toISOString()
        })
      });

      if (!setupIntentResponse.ok) {
        const errorData = await setupIntentResponse.json();
        throw new Error(errorData.error || 'Error al crear el Setup Intent');
      }

      const { clientSecret, setupIntentId } = await setupIntentResponse.json();
      console.log('✅ Setup Intent creado:', { setupIntentId });

      // 3. Crear PaymentMethod
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        throw new Error('Error al obtener los datos de la tarjeta');
      }

      // Crear PaymentMethod en el contexto de la cuenta conectada
      const { paymentMethod, error: pmError } = await (stripe as any).createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {},
      }, {
        stripeAccount: stripeAccountId
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      if (!paymentMethod) {
        throw new Error('No se pudo crear el método de pago');
      }

      // 4. Confirmar Setup Intent
      const confirmResponse = await fetch(`/api/stripe/setup-intent/${setupIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Account': stripeAccountId
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id
        })
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Error al confirmar el Setup Intent');
      }

      const { setupIntent } = await confirmResponse.json();

      console.log('✅ Tarjeta guardada exitosamente:', {
        setupIntentId: setupIntent.id,
        paymentMethodId: paymentMethod.id,
        status: setupIntent.status
      });

      onSuccess(paymentMethod.id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      console.error('❌ Error detallado:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      setError(error.message);
      onError({
        message: error.message,
        originalError: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className={cn(
          "stripe-element",
          error && "error",
          cardComplete.cardNumber && "complete"
        )}>
          <CardNumberElement 
            options={BASE_ELEMENT_OPTIONS}
            onChange={handleElementChange}
            onReady={() => console.log('✅ CardNumberElement listo')}
          />
        </div>
        
        <div className="flex gap-4">
          <div className={cn(
            "stripe-element flex-1",
            error && "error",
            cardComplete.cardExpiry && "complete"
          )}>
            <CardExpiryElement 
              options={BASE_ELEMENT_OPTIONS}
              onChange={handleElementChange}
              onReady={() => console.log('✅ CardExpiryElement listo')}
            />
          </div>
          <div className={cn(
            "stripe-element flex-1",
            error && "error",
            cardComplete.cardCvc && "complete"
          )}>
            <CardCvcElement 
              options={BASE_ELEMENT_OPTIONS}
              onChange={handleElementChange}
              onReady={() => console.log('✅ CardCvcElement listo')}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={!stripe || loading || !isFormComplete()}
          className={cn(
            "w-full",
            loading && "opacity-50"
          )}
        >
          {loading ? 'Procesando...' : 'Guardar Tarjeta'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className={cn(
            "w-full",
            theme === 'dark' 
              ? "border-neutral-800 hover:bg-neutral-800"
              : "border-gray-200 hover:bg-gray-100"
          )}
        >
          Volver
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Tus datos están seguros y encriptados
      </p>
    </form>
  );
} 