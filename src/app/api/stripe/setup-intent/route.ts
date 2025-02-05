import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { createId } from '@paralleldrive/cuid2';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST(request: Request) {
  const requestId = createId();
  console.log(`🔄 [${requestId}] Iniciando creación de SetupIntent`);

  try {
    const { stripeAccountId } = await request.json();

    if (!stripeAccountId) {
      console.warn(`⚠️ [${requestId}] No se proporcionó el ID de cuenta de Stripe`);
      return NextResponse.json(
        { error: 'Se requiere el ID de la cuenta de Stripe' },
        { status: 400 }
      );
    }

    console.log(`✅ [${requestId}] Verificando cuenta de Stripe: ${stripeAccountId}`);

    // Verificar la conexión en la base de datos
    const supabase = createRouteHandlerClient({ cookies });
    const { data: connection, error: dbError } = await supabase
      .from('stripe_connections')
      .select('*')
      .eq('stripe_account_id', stripeAccountId)
      .single();

    if (dbError) {
      console.error(`❌ [${requestId}] Error de base de datos:`, dbError);
      return NextResponse.json(
        { error: 'Error al verificar la cuenta de Stripe' },
        { status: 500 }
      );
    }

    if (!connection) {
      console.warn(`⚠️ [${requestId}] Cuenta de Stripe no encontrada: ${stripeAccountId}`);
      return NextResponse.json(
        { error: 'Cuenta de Stripe no encontrada' },
        { status: 404 }
      );
    }

    if (!connection.charges_enabled) {
      console.warn(`⚠️ [${requestId}] Cuenta sin cargos habilitados: ${stripeAccountId}`);
      return NextResponse.json(
        { 
          error: 'La cuenta no tiene habilitados los cargos. Por favor, complete la configuración de Stripe.',
          details: {
            accountId: stripeAccountId,
            status: connection.account_status
          }
        },
        { status: 400 }
      );
    }

    console.log(`✅ [${requestId}] Creando SetupIntent para la cuenta: ${stripeAccountId}`);

    // Crear SetupIntent en el contexto de la cuenta conectada
    const setupIntent = await stripe.setupIntents.create(
      {
        payment_method_types: ['card'],
        usage: 'off_session',
      },
      {
        stripeAccount: stripeAccountId,
      }
    );

    console.log(`✅ [${requestId}] SetupIntent creado exitosamente: ${setupIntent.id}`);

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      requestId
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Error al crear SetupIntent:`, error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Error de Stripe al procesar la solicitud',
          details: {
            type: error.type,
            code: error.code,
            message: error.message
          }
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error interno al procesar la solicitud',
        requestId 
      },
      { status: 500 }
    );
  }
} 