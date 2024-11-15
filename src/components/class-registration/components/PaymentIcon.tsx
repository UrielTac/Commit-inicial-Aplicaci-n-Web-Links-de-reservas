import { IconCash, IconCreditCard, IconBuildingBank } from "@tabler/icons-react"

interface PaymentIconProps {
  type: 'cash' | 'card' | 'transfer'
  className?: string
}

export function PaymentIcon({ type, className = "w-5 h-5" }: PaymentIconProps) {
  switch (type) {
    case 'cash':
      return <IconCash className={className} strokeWidth={1.5} />
    case 'card':
      return <IconCreditCard className={className} strokeWidth={1.5} />
    case 'transfer':
      return <IconBuildingBank className={className} strokeWidth={1.5} />
  }
} 