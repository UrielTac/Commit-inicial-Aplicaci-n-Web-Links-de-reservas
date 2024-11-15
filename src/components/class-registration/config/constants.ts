import { IconCash, IconCreditCard, IconBuildingBank } from "@tabler/icons-react"

export const STEPS = {
  AUTH: 'auth',
  INFO: 'info',
  CLASSES: 'classes',
  PAYMENT: 'payment'
} as const

export type Step = typeof STEPS[keyof typeof STEPS]
export type PaymentMethod = 'cash' | 'card' | 'transfer'

export const PAYMENT_OPTIONS = [
  {
    id: 'cash' as const,
    label: 'Efectivo',
    description: 'Pago en efectivo al llegar a la clase',
    iconType: 'cash'
  },
  {
    id: 'card' as const,
    label: 'Mercado Pago',
    description: 'Pago con tarjeta a través de Mercado Pago',
    iconType: 'card'
  },
  {
    id: 'transfer' as const,
    label: 'Transferencia',
    description: 'Transferencia bancaria',
    iconType: 'transfer'
  }
] as const 