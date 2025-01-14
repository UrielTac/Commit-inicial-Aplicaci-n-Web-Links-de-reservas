export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  capacity: number
  instructors: string[]
  price: number
  courtIds?: string[]
}

export interface ClassScheduleConfig {
  isRecurring: boolean
  startDate: Date | undefined
  endDate: Date | undefined
  weekDays: number[]
  timeSlots: TimeSlot[]
}

export type BookingStep = 
  | 'class-details'
  | 'class-availability'
  | 'class-schedule'
  | 'date'
  | 'time'
  | 'payment'
  | 'confirmation'
  | 'participants'
  | 'rentals'

export type BookingType = 'class' | 'shift'

export interface ClassDetails {
  name: string
  description: string
  visibility?: 'public' | 'private'
  branchId?: string[]
}

export interface TimeSelection {
  startTime: string
  endTime: string
}

export interface PaymentMethod {
  id: string
  name: string
  icon: string
}

export interface ClassPaymentConfig {
  pricePerSession: number
  currency: string
  paymentMethod: 'cash' | 'card' | 'transfer'
  paymentStatus: 'pending' | 'completed' | 'failed'
  availableMethods: PaymentMethod[]
}

export interface BookingState {
  currentStep: BookingStep
  selectedBookingType: BookingType
  selectedDate?: Date
  selectedCourts: string[]
  classDetails: ClassDetails
  timeSelection?: TimeSelection
  classPaymentConfig: ClassPaymentConfig
  scheduleConfig: ClassScheduleConfig
  isStepValid: boolean
}

export interface BookingStateActions {
  updateState: (updates: Partial<BookingState>) => void
  resetState: () => void
  handleContinue: () => void
  handleBack: () => void
  validateStep: (step: BookingStep) => boolean
} 