export type WeekSchedule = {
  [key: string]: {
    isOpen: boolean
    timeRanges: Array<{
      openTime: string
      closeTime: string
    }>
  }
}

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          name: string
          business_name: string | null
          tax_id: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          logo_url: string | null
          is_active: boolean
          settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          business_name?: string | null
          tax_id?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          logo_url?: string | null
          is_active?: boolean
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          business_name?: string | null
          tax_id?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          logo_url?: string | null
          is_active?: boolean
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      sedes: {
        Row: {
          id: string
          organization_id: string
          name: string
          address: string | null
          phone: string | null
          manager_id: string | null
          opening_hours: WeekSchedule
          is_active: boolean
          settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          address?: string | null
          phone?: string | null
          manager_id?: string | null
          opening_hours?: WeekSchedule
          is_active?: boolean
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          address?: string | null
          phone?: string | null
          manager_id?: string | null
          opening_hours?: WeekSchedule
          is_active?: boolean
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 