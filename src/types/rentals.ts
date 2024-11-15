export interface RentalItem {
  id: string
  name: string
  description?: string
  price: number
  available: number
  image?: string
  category: 'equipment' | 'accessories' | 'other'
}

export interface RentalSelection {
  itemId: string
  quantity: number
} 