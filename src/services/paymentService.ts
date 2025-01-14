import { supabase } from '@/lib/supabase'

interface RegisterPaymentParams {
  bookingId: string
  depositAmount: number
  paymentMethod: string
  notes?: string
}

interface PaymentResponse {
  success: boolean
  payment_id?: string
  new_status?: string
  total_paid?: number
  error?: string
}

export const paymentService = {
  async registerPayment({
    bookingId,
    depositAmount,
    paymentMethod,
    notes
  }: RegisterPaymentParams): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase
        .rpc('register_booking_payment', {
          p_booking_id: bookingId,
          p_deposit_amount: depositAmount,
          p_payment_method: paymentMethod,
          p_notes: notes
        })

      if (error) throw error

      return data as PaymentResponse
    } catch (error) {
      console.error('Error registering payment:', error)
      return {
        success: false,
        error: 'Error al procesar el pago'
      }
    }
  }
}