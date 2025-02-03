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
      empresas: {
        Row: {
          id: string
          name: string
          business_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          is_active: boolean | null
          settings: Json | null
          created_at: string | null
          updated_at: string | null
          auth_user_id: string | null
          plan_type: 'Free' | 'Pro Mensual' | 'Pro Trimestral' | null
          onboarding: 'Empresa' | 'Sedes' | 'Integración' | 'Planes' | 'Completo' | null
          country: string | null
        }
        Insert: {
          id?: string
          name: string
          business_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          is_active?: boolean | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
          auth_user_id?: string | null
          plan_type?: 'Free' | 'Pro Mensual' | 'Pro Trimestral' | null
          onboarding?: 'Empresa' | 'Sedes' | 'Integración' | 'Planes' | 'Completo' | null
          country?: string | null
        }
        Update: {
          id?: string
          name?: string
          business_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          is_active?: boolean | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
          auth_user_id?: string | null
          plan_type?: 'Free' | 'Pro Mensual' | 'Pro Trimestral' | null
          onboarding?: 'Empresa' | 'Sedes' | 'Integración' | 'Planes' | 'Completo' | null
          country?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          empresa_id: string
          subscription_id: string
          plan_status: 'active' | 'cancelled' | 'suspended' | 'expired'
          subscription_expires_at: string
          last_payment_date: string | null
          next_payment_date: string | null
          payment_status: 'paid' | 'pending' | 'failed' | 'refunded' | null
          payment_amount: number | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          subscription_id: string
          plan_status?: 'active' | 'cancelled' | 'suspended' | 'expired'
          subscription_expires_at: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_status?: 'paid' | 'pending' | 'failed' | 'refunded' | null
          payment_amount?: number | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          subscription_id?: string
          plan_status?: 'active' | 'cancelled' | 'suspended' | 'expired'
          subscription_expires_at?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_status?: 'paid' | 'pending' | 'failed' | 'refunded' | null
          payment_amount?: number | null
          currency?: string
          updated_at?: string
        }
      },
      stripe_connections: {
        Row: {
          id: string
          empresa_id: string
          stripe_account_id: string
          stripe_account_email: string | null
          account_status: 'pending' | 'active' | 'restricted' | 'disabled'
          charges_enabled: boolean
          payouts_enabled: boolean
          requirements: Record<string, any> | null
          created_at: string
          updated_at: string
          last_webhook_received_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          stripe_account_id: string
          stripe_account_email?: string | null
          account_status?: 'pending' | 'active' | 'restricted' | 'disabled'
          charges_enabled?: boolean
          payouts_enabled?: boolean
          requirements?: Record<string, any> | null
          created_at?: string
          updated_at?: string
          last_webhook_received_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          stripe_account_id?: string
          stripe_account_email?: string | null
          account_status?: 'pending' | 'active' | 'restricted' | 'disabled'
          charges_enabled?: boolean
          payouts_enabled?: boolean
          requirements?: Record<string, any> | null
          updated_at?: string
          last_webhook_received_at?: string | null
        }
      }
    }
  }
} 