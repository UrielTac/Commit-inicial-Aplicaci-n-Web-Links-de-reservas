export const PAYMENT_OPTIONS = [
  {
    id: 'cash',
    label: 'Pagar en sede',
    description: 'Realiza el pago directamente en nuestras instalaciones',
    iconType: 'cash'
  },
  {
    id: 'card',
    label: 'Mercado Pago',
    description: 'Paga de forma segura con tarjeta o dinero en cuenta',
    iconType: 'card'
  },
  {
    id: 'transfer',
    label: 'Transferencia bancaria',
    description: 'Realiza una transferencia a nuestra cuenta',
    iconType: 'transfer'
  }
] as const

export type PaymentMethod = typeof PAYMENT_OPTIONS[number]['id'] 