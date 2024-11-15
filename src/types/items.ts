export interface Item {
  id: string
  name: string
  type: 'equipment' | 'accessory' | 'consumable'
  pricing: {
    [duration: number]: number // duración en minutos: precio
  }
  defaultDuration: number
  stock: number
  requiresDeposit: boolean
  depositAmount?: number
  isActive: boolean
} 