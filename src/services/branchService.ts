import { supabase } from '@/lib/supabase'
import { BranchFormData, BranchInsert, Branch } from '@/types/branch'

function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export const branchService = {
  transformFormDataToDbFormat(formData: BranchFormData, organizationId: string): BranchInsert {
    if (!organizationId) {
      throw new Error('El ID de la organización es requerido')
    }

    if (!isValidUUID(organizationId)) {
      throw new Error('El formato del ID de la organización no es válido')
    }

    const opening_hours = formData.schedule.reduce((acc, day) => ({
      ...acc,
      [day.day]: {
        isOpen: day.isOpen,
        timeRanges: day.timeRanges
      }
    }), {})

    return {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      manager_id: formData.manager || null,
      is_active: formData.isActive,
      opening_hours,
      settings: {},
      empresa_id: organizationId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },

  async createBranch(formData: BranchFormData, organizationId: string): Promise<{ data: Branch | null, error: any }> {
    try {
      console.log('📍 Iniciando creación de sede:', { formData, organizationId })
      
      const branchData = this.transformFormDataToDbFormat(formData, organizationId)
      console.log('📍 Datos transformados:', branchData)

      const { data, error } = await supabase
        .from('sedes')
        .insert([branchData])
        .select(`
          id,
          name,
          address,
          phone,
          manager_id,
          is_active,
          opening_hours,
          settings,
          created_at,
          updated_at
        `)
        .single()

      if (error) {
        console.error('❌ Error de Supabase al crear sede:', error)
        throw error
      }

      if (!data) {
        throw new Error('No se recibieron datos después de crear la sede')
      }

      console.log('✅ Sede creada exitosamente:', data)
      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Error al crear sede:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return { 
        data: null, 
        error: {
          message: error.message || 'Error al crear la sede',
          details: error.details,
          hint: error.hint
        }
      }
    }
  },

  async getBranches(organizationId: string): Promise<{ data: Branch[] | null, error: any }> {
    try {
      console.log('📍 Consultando sedes para organización:', organizationId)
      
      if (!organizationId) {
        throw new Error('El ID de la organización es requerido')
      }

      if (!isValidUUID(organizationId)) {
        throw new Error('El formato del ID de la organización no es válido')
      }

      const { data, error } = await supabase
        .from('sedes')
        .select(`
          id,
          name,
          address,
          phone,
          manager_id,
          is_active,
          opening_hours,
          settings,
          empresa_id,
          created_at,
          updated_at
        `)
        .eq('empresa_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error al obtener sedes:', error)
        throw error
      }

      const validBranches = data?.filter(branch => branch.empresa_id)
      if (data && data.length !== validBranches?.length) {
        console.warn('⚠️ Algunas sedes no tienen empresa_id asociada')
      }

      console.log('✅ Sedes obtenidas:', validBranches)
      return { data: validBranches || [], error: null }
    } catch (error: any) {
      console.error('❌ Error al obtener sedes:', error)
      return { 
        data: null, 
        error: {
          message: error.message || 'Error al obtener las sedes',
          details: error.details,
          hint: error.hint
        }
      }
    }
  },

  async deleteBranch(branchId: string): Promise<{ error: any }> {
    try {
      console.log('📍 Iniciando eliminación de sede:', branchId)
      
      const { error } = await supabase
        .from('sedes')
        .delete()
        .eq('id', branchId)

      if (error) {
        console.error('❌ Error de Supabase al eliminar sede:', error)
        throw error
      }

      console.log('✅ Sede eliminada exitosamente')
      return { error: null }
    } catch (error: any) {
      console.error('❌ Error al eliminar sede:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return { 
        error: {
          message: error.message || 'Error al eliminar la sede',
          details: error.details,
          hint: error.hint
        }
      }
    }
  },

  async updateBranch(branchId: string, formData: BranchFormData, organizationId: string): Promise<{ data: Branch | null, error: any }> {
    try {
      console.log('📍 Iniciando actualización de sede:', { branchId, formData })
      
      const branchData = this.transformFormDataToDbFormat(formData, organizationId)
      console.log('📍 Datos transformados:', branchData)

      const { data, error } = await supabase
        .from('sedes')
        .update(branchData)
        .eq('id', branchId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error de Supabase al actualizar sede:', error)
        throw error
      }

      console.log('✅ Sede actualizada exitosamente:', data)
      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Error al actualizar sede:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return { 
        data: null, 
        error: {
          message: error.message || 'Error al actualizar la sede',
          details: error.details,
          hint: error.hint
        }
      }
    }
  }
} 