export type PaymentStatusEnum = 'pending' | 'partial' | 'completed'
export type PaymentMethodEnum = 'cash' | 'stripe' | 'transfer'

export interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  gender?: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
  reservation_stats?: ReservationStats
}

export interface PaymentDetails {
  totalAmount: number
  deposit: number
  paymentStatus: PaymentStatusEnum
  paymentMethod: PaymentMethodEnum
}

export interface BookingCreationData {
  courtId: string
  date: string
  startTime: string
  endTime: string
  title?: string
  description?: string
  totalPrice: number
  paymentStatus: PaymentStatusEnum
  paymentMethod: PaymentMethodEnum
  depositAmount: number
  participants: Array<{
    memberId: string
    role: 'player' | 'guest'
  }>
  rentalItems: Array<{
    itemId: string
    quantity: number
    pricePerUnit: number
  }>
} 