export type BookingStep = 
  | 'shift-info'
  | 'class-details'
  | 'class-schedule'
  | 'class-payment-methods'
  | 'confirmation'

export interface Participant {
  id: string
  name: string
  email?: string
  phone?: string
}

export interface ClassDetails {
  name: string
  description: string
  visibility?: 'public' | 'private'
}

export interface TimeSelection {
  startTime: string
  endTime: string
}

export interface ClassScheduleConfig {
  isRecurring: boolean
  startDate?: Date
  endDate?: Date
  weekDays: number[]
  timeSlots: TimeSelection[]
}

export interface ClassPaymentConfig {
  pricePerClass: number
  paymentMethods: ('cash' | 'card' | 'transfer')[]
  isAdvancePaymentRequired: boolean
  advancePaymentAmount?: number
}

export interface BookingFormData {
  participants: string[]
  paymentMethods: ('cash' | 'card' | 'transfer')[]
  classDetails?: ClassDetails
  scheduleConfig?: ClassScheduleConfig
  paymentConfig?: ClassPaymentConfig
} 