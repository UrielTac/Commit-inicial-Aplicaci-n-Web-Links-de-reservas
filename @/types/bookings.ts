export interface StatusHistoryEntry {
  status: 'pending' | 'partial' | 'completed'
  date: string
}

export interface BookingParticipant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface SelectedBooking {
  id: string
  date: string
  startTime: string
  endTime: string
  court: string
  price: number
  totalAmount: number
  participants: BookingParticipant[]
  rentedItems?: {
    name: string
    quantity: number
    pricePerUnit: number
  }[]
  paymentStatus: 'pending' | 'partial' | 'completed'
  depositAmount: number
  paymentMethod: string
  statusHistory?: StatusHistoryEntry[]
  title?: string
  description?: string
} 