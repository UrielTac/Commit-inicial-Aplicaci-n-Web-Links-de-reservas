import type { STEPS } from "../config/constants"

export type Step = typeof STEPS[keyof typeof STEPS]
export type PaymentMethod = 'cash' | 'card' | 'transfer'

export interface ClassSession {
  date: Date
  selected: boolean
  totalSpots: number
  spotsLeft: number
}

export interface AuthForm {
  email: string
  password: string
  phone?: string
  dni?: string
}

export interface ClassRegistrationState {
  currentStep: Step
  authForm: AuthForm
  sessions: ClassSession[]
  selectedPayment: PaymentMethod | null
  errors: Record<string, string>
}

export interface ClassRegistrationActions {
  setStep: (step: Step) => void
  updateAuthForm: (data: Partial<AuthForm>) => void
  toggleSession: (index: number) => void
  selectPaymentMethod: (method: PaymentMethod) => void
} 