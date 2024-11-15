import type { ClassSession, AuthForm } from "../../class-registration/types"

export interface PublicClass {
  id: string
  title: string
  description: string
  instructor: string
  schedule: string
  totalSpots: number
  spotsLeft: number
  price: number
  sessions: ClassSession[]
}

export type PublicRegistrationStep = 
  | 'class-selection'
  | 'auth'
  | 'info'
  | 'sessions'
  | 'payment'

export interface PublicRegistrationState {
  currentStep: PublicRegistrationStep
  selectedClass: string | null
  authForm: AuthForm
  sessions: ClassSession[]
  selectedPayment: PaymentMethod | null
} 