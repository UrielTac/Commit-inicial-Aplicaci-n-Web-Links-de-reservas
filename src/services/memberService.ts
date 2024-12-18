import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

interface CreateMemberData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  gender?: 'male' | 'female' | 'not_specified'
  status: string
}

type Member = Database['public']['Tables']['members']['Row']

export const memberService = {
  async searchMembers(searchTerm: string) {
    try {
      if (!searchTerm.trim()) return { data: [], error: null }

      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(5)

      if (error) throw error

      return { 
        data: data.map(member => ({
          id: member.id,
          fullName: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
          email: member.email,
          phone: member.phone
        })), 
        error: null 
      }
    } catch (error: any) {
      console.error('Error buscando miembros:', error)
      return { 
        data: null, 
        error: error.message 
      }
    }
  },

  async createMember(data: CreateMemberData) {
    try {
      const { data: member, error } = await supabase
        .from('members')
        .insert([{
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || null,
          gender: data.gender || null,
          status: data.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      return member
    } catch (error: any) {
      console.error('Error creando miembro:', error)
      throw new Error(error.message || 'Error al crear el miembro')
    }
  }
}