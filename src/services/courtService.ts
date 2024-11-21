import { supabase } from '@/lib/supabase'
import type { Court, CreateCourtDTO } from '@/types/court'

export class CourtService {
  private validateCourtData(data: CreateCourtDTO) {
    if (!data.name?.trim()) {
      throw new Error('El nombre de la pista es requerido')
    }
    if (!data.branchId) {
      throw new Error('La sede es requerida')
    }
    if (!data.sport) {
      throw new Error('El deporte es requerido')
    }
    if (!data.courtType) {
      throw new Error('El tipo de pista es requerido')
    }
    if (!data.surface) {
      throw new Error('La superficie es requerida')
    }
  }

  async createCourt(data: CreateCourtDTO) {
    try {
      console.log('📍 Iniciando creación de pista:', data)
      
      this.validateCourtData(data)

      const courtData = {
        name: data.name.trim(),
        branch_id: data.branchId,
        sport: data.sport,
        court_type: data.courtType,
        surface: data.surface,
        features: data.features || [],
        is_active: data.isActive ?? true,
        available_durations: data.availableDurations || [60],
        duration_pricing: data.durationPricing || {},
        custom_pricing: data.customPricing || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📍 Datos preparados para inserción:', courtData)

      const { data: court, error } = await supabase
        .from('courts')
        .insert([courtData])
        .select('*')
        .single()

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }

      if (!court) {
        throw new Error('No se recibieron datos después de crear la pista')
      }

      // Transformar la respuesta al formato esperado por el cliente
      const transformedCourt: Court = {
        id: court.id,
        name: court.name,
        branchId: court.branch_id,
        sport: court.sport,
        courtType: court.court_type,
        surface: court.surface,
        features: court.features || [],
        isActive: court.is_active,
        availableDurations: court.available_durations || [60],
        durationPricing: court.duration_pricing || {},
        customPricing: court.custom_pricing || {},
        createdAt: court.created_at,
        updatedAt: court.updated_at
      }

      console.log('✅ Pista creada exitosamente:', transformedCourt)
      return { data: transformedCourt, error: null }
    } catch (error) {
      console.error('❌ Error detallado:', error)
      throw error
    }
  }

  async getCourtsByBranch(branchId: string) {
    try {
      const { data: courts, error } = await supabase
        .from('courts')
        .select(`
          id,
          name,
          branch_id,
          sport,
          court_type,
          surface,
          features,
          is_active,
          available_durations,
          duration_pricing,
          custom_pricing,
          created_at,
          updated_at
        `)
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transformar la respuesta al formato esperado por el cliente
      const transformedCourts: Court[] = courts.map(court => ({
        id: court.id,
        name: court.name,
        branchId: court.branch_id,
        sport: court.sport,
        courtType: court.court_type,
        surface: court.surface,
        features: court.features || [],
        isActive: court.is_active,
        availableDurations: court.available_durations || [60],
        durationPricing: court.duration_pricing || {},
        customPricing: court.custom_pricing || {},
        createdAt: court.created_at,
        updatedAt: court.updated_at
      }))

      return { data: transformedCourts, error: null }
    } catch (error: any) {
      console.error('❌ Error al obtener pistas:', error)
      return {
        data: null,
        error: {
          message: error.message || 'Error al obtener las pistas',
          details: error.details,
          hint: error.hint
        }
      }
    }
  }

  async deleteCourt(courtId: string) {
    try {
      console.log('📍 Iniciando eliminación de pista:', courtId)

      const { error } = await supabase
        .from('courts')
        .delete()
        .eq('id', courtId)

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }

      console.log('✅ Pista eliminada exitosamente')
      return { error: null }
    } catch (error) {
      console.error('❌ Error al eliminar pista:', error)
      return {
        error: {
          message: error.message || 'Error al eliminar la pista',
          details: error.details,
          hint: error.hint
        }
      }
    }
  }

  async updateCourt(courtId: string, data: Omit<Court, 'id'>) {
    try {
      console.log('📍 Iniciando actualización de pista:', { courtId, data })

      const courtData = {
        name: data.name.trim(),
        branch_id: data.branchId,
        sport: data.sport,
        court_type: data.courtType,
        surface: data.surface,
        features: data.features || [],
        is_active: data.isActive ?? true,
        available_durations: data.availableDurations || [60],
        duration_pricing: data.durationPricing || {},
        custom_pricing: data.customPricing || {},
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('courts')
        .update(courtData)
        .eq('id', courtId)

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }

      console.log('✅ Pista actualizada exitosamente')
      return { error: null }
    } catch (error) {
      console.error('❌ Error al actualizar pista:', error)
      return {
        error: {
          message: error.message || 'Error al actualizar la pista',
          details: error.details,
          hint: error.hint
        }
      }
    }
  }

  async updateCourtStatus(courtId: string, isActive: boolean) {
    try {
      console.log('📍 Actualizando estado de pista:', { courtId, isActive })

      const { error } = await supabase
        .from('courts')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', courtId)

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }

      console.log('✅ Estado de pista actualizado exitosamente')
      return { error: null }
    } catch (error) {
      console.error('❌ Error al actualizar estado de pista:', error)
      return {
        error: {
          message: error.message || 'Error al actualizar el estado de la pista',
          details: error.details,
          hint: error.hint
        }
      }
    }
  }
}

export const courtService = new CourtService() 