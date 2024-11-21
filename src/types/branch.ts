import { Database } from '@/types/supabase'

export type WeekSchedule = Database['public']['Tables']['sedes']['Row']['opening_hours']

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  manager_id: string
  is_active: boolean
  opening_hours: Record<string, any>
  settings: Record<string, any>
  empresa_id: string
  created_at?: string
  updated_at?: string
}

export type BranchInsert = Database['public']['Tables']['sedes']['Insert']
export type BranchUpdate = Database['public']['Tables']['sedes']['Update']

export interface BranchFormData {
  name: string
  address: string
  phone: string
  manager?: string
  isActive: boolean
  schedule: Array<{
    day: string
    isOpen: boolean
    timeRanges: Array<{
      openTime: string
      closeTime: string
    }>
  }>
} 