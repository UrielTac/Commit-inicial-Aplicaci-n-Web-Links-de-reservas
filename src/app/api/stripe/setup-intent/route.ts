import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { StripeSetupIntentService } from '@/services/stripe-setup-intent.service';
import { createId } from '@paralleldrive/cuid2';

export async function POST(req: Request) {
  const requestId = createId();

  try {
    const headersList = await headers();
    const stripeAccount = headersList.get('Stripe-Account');

    if (!stripeAccount) {
      console.error(`❌ [${requestId}] No se proporcionó el ID de cuenta de Stripe`);
      return NextResponse.json(
        { error: 'Se requiere el ID de cuenta de Stripe' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      console.error(`❌ [${requestId}] No se proporcionó el ID del cliente`);
      return NextResponse.json(
        { error: 'Se requiere el ID del cliente' },
        { status: 400 }
      );
    }

    const result = await StripeSetupIntentService.create({
      customerId,
      stripeAccountId: stripeAccount,
      requestId
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`❌ [${requestId}] Error:`, error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error al crear el Setup Intent';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 