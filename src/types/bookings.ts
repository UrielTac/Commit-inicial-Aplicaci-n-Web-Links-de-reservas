export interface PaymentDetails {
  totalAmount: number
  deposit: number
  isPaid: boolean
  paymentMethod?: 'cash' | 'card' | 'transfer'
  paymentStatus: 'pending' | 'partial' | 'completed'
}

export interface Selection {
  selections: {
    courtId: string
    startTime: string
    endTime: string
    slots: number
  }[]
  startCourtId: string
  endCourtId: string
  startTime: string
  endTime: string
  slots: number
}

export interface GuestForm {
  id: string
  fullName: string
  dni: string
  email: string
}

export interface RentalSelection {
  itemId: string
  quantity: number
}

export type PopupView = 
  | 'actions' 
  | 'blocking' 
  | 'clearing' 
  | 'booking-type' 
  | 'shift-info' 
  | 'shift-details' 
  | 'shift-payment'
  | 'class-info' 
  | 'class-details'
  | 'class-payment'
  | 'rentals'