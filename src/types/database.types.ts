export interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  gender?: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
  reservation_stats?: ReservationStats
} 