export interface Database {
  public: {
    Tables: {
      courts: {
        Row: {
          id: string
          name: string
          branch_id: string
          sport: 'padel' | 'tennis' | 'badminton' | 'pickleball' | 'squash'
          court_type: 'indoor' | 'outdoor' | 'covered'
          surface: 'crystal' | 'synthetic' | 'clay' | 'grass' | 'rubber' | 'concrete' | 'panoramic' | 'premium'
          features: string[]
          is_active: boolean
          available_durations: number[]
          duration_pricing: Record<string, number>
          custom_pricing: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          branch_id: string
          sport: 'padel' | 'tennis' | 'badminton' | 'pickleball' | 'squash'
          court_type: 'indoor' | 'outdoor' | 'covered'
          surface: 'crystal' | 'synthetic' | 'clay' | 'grass' | 'rubber' | 'concrete' | 'panoramic' | 'premium'
          features?: string[]
          is_active?: boolean
          available_durations?: number[]
          duration_pricing?: Record<string, number>
          custom_pricing?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          branch_id?: string
          sport?: 'padel' | 'tennis' | 'badminton' | 'pickleball' | 'squash'
          court_type?: 'indoor' | 'outdoor' | 'covered'
          surface?: 'crystal' | 'synthetic' | 'clay' | 'grass' | 'rubber' | 'concrete' | 'panoramic' | 'premium'
          features?: string[]
          is_active?: boolean
          available_durations?: number[]
          duration_pricing?: Record<string, number>
          custom_pricing?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      },
      bookings: {
        Row: {
          id: string
          court_id: string
          date: string
          start_time: string
          end_time: string
          title: string
          description: string | null
          total_price: number
          rental_items: {
            item_id: string
            quantity: number
            price: number
          }[]
          participants: {
            member_id: string
            role: 'player' | 'guest'
          }[]
          payment_status: 'pending' | 'partial' | 'completed'
          payment_method: 'cash' | 'stripe' | 'transfer' | null
          deposit_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          court_id: string
          date: string
          start_time: string
          end_time: string
          title: string
          description?: string
          total_price: number
          rental_items?: {
            item_id: string
            quantity: number
            price: number
          }[]
          participants: {
            member_id: string
            role: 'player' | 'guest'
          }[]
          payment_status: 'pending' | 'partial' | 'completed'
          payment_method?: 'cash' | 'stripe' | 'transfer'
          deposit_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          court_id?: string
          date?: string
          start_time?: string
          end_time?: string
          title?: string
          description?: string
          total_price?: number
          rental_items?: {
            item_id: string
            quantity: number
            price: number
          }[]
          participants?: {
            member_id: string
            role: 'player' | 'guest'
          }[]
          payment_status?: 'pending' | 'partial' | 'completed'
          payment_method?: 'cash' | 'stripe' | 'transfer'
          deposit_amount?: number
          updated_at?: string
        }
      }
      // ... resto de las tablas
    }
  }
} 