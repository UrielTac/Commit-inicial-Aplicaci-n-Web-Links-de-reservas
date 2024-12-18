export type PopupView = 'actions' | 'blocking' | 'shift-info' | 'shift-details' | 'shift-payment' | 'rentals'

export interface GuestForm {
  id: string
  fullName: string
  dni: string
  email: string
  phone?: string
}

export interface ConfirmedBooking {
  courtId: string
  startTime: string
  endTime: string
  guests: GuestForm[]
  type: 'shift' | 'class'
  maxParticipants?: number
  isWaitingList?: boolean
  title?: string
  description?: string
  payment: PaymentDetails & {
    timestamp: string
  }
}

export interface PaymentDetails {
  totalAmount: number
  deposit: number
  isPaid: boolean
  paymentStatus: 'pending' | 'partial' | 'completed'
  paymentMethod?: string
}

export interface RentalSelection {
  itemId: string
  quantity: number
  pricePerUnit?: number
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

export interface Court {
  id: string
  name: string
  branch_id: string
  sport: string
  court_type: string
  surface: string
  is_active: boolean
}

export interface BookingCreationData {
  courtId: string
  date: string
  startTime: string
  endTime: string
  title?: string
  description?: string
  totalPrice: number
  paymentStatus: 'pending' | 'partial' | 'completed'
  paymentMethod?: string
  depositAmount: number
  participants: {
    memberId: string
    role: 'player' | 'instructor'
  }[]
  rentalItems: {
    itemId: string
    quantity: number
    pricePerUnit: number
  }[]
}

export type BookingType = 'shift' | 'class'

export interface ClassDetails {
  name: string
  description: string
}

export interface ClassScheduleConfig {
  isRecurring: boolean
  startDate?: Date
  endDate?: Date
  weekDays: number[]
  timeSlots: Array<{
    startTime: string
    endTime: string
  }>
}

export type BookingStep = 
  | 'booking-type'
  | 'date'
  | 'class-details'
  | 'class-schedule'
  | 'class-availability'

interface BookingPopupProps {
  selection: Selection | null
  isOpen: boolean
  onClose: () => void
  onViewChange: (view: PopupView) => void
  onConfirmBooking?: () => void
  shiftTitle?: string
  shiftDescription?: string
  paymentDetails: PaymentDetails
  guests: GuestForm[]
  selectedRentals: RentalSelection[]
}

export interface ExistingBooking {
  id: string
  courtId: string
  startTime: string
  endTime: string
  price: number
  totalAmount: number
  paymentStatus: 'pending' | 'partial' | 'completed'
  guests?: Array<{
    firstName: string
    lastName: string
  }>
  rentalItems?: Array<{
    name: string
    quantity: number
    pricePerUnit: number
  }>
}

export interface StatusHistoryEntry {
  status: 'pending' | 'partial' | 'completed'
  date: string
}

export interface Participant {
  first_name: string
  last_name: string
}

export interface SelectedBooking {
  id: string
  date: string
  startTime: string
  endTime: string
  court: string
  price: number
  totalAmount: number
  depositAmount: number
  paymentMethod: string
  participants: any[]
  paymentStatus: 'pending' | 'partial' | 'completed'
  rentedItems: any[]
}