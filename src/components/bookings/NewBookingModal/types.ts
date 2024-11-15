import type { Icon } from "@tabler/icons-react"

export type BookingStep = 
  | 'booking-type' 
  | 'class-details'
  | 'class-schedule'
  | 'class-payment-methods'
  | 'confirmation'
  | 'date'
  | 'time'
  | 'participants'
  | 'rentals'
  | 'payment'

export type BookingType = 'shift' | 'class'

export interface BookingTypeOption {
  id: BookingType
  title: string
  description: string
  icon: React.ReactNode
  colors: {
    bg: string
    text: string
    hover: string
  }
}

export interface ClassDetails {
  name: string
  description: string
  visibility: 'public' | 'private'
}

export interface ClassAvailability {
  maxParticipants: number
  selectedCourts: string[]
}

export interface ClassSession {
  id: string
  name: string
  date: Date | null
  isRecurring?: boolean
}

export interface TimeSelection {
  startTime: string
  endTime: string
  duration: number
}

export interface ValidationErrors {
  name?: string
  description?: string
  duration?: string
  maxParticipants?: string
  courts?: string
  sessions?: string
}

export interface Participant {
  id: string
  fullName: string
  dni: string
  email?: string
}

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  capacity: number
  instructors: string[]
  price: number
  courtIds: string[]
}

export interface ClassScheduleConfig {
  isRecurring: boolean
  startDate: Date | undefined
  endDate: Date | undefined
  weekDays: number[]
  timeSlots: TimeSlot[]
}

export type PaymentMethod = 'cash' | 'card' | 'transfer'

export interface ClassPaymentConfig {
  availableMethods: PaymentMethod[]
}
