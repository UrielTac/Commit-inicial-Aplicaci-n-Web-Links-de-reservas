import { getSupabaseClient } from '@/lib/supabase/client'
import { type Database } from '@/types/supabase'
import { type Item, type ItemType } from '@/types/items'

// Usamos una clase para mejor organización y encapsulamiento
class ItemService {
  private static instance: ItemService | null = null
  private supabase = getSupabaseClient()

  private constructor() {}

  public static getInstance(): ItemService {
    if (!ItemService.instance) {
      ItemService.instance = new ItemService()
    }
    return ItemService.instance
  }

  async getItemsByBranch(branchId: string): Promise<Item[]> {
    try {
      console.log('📍 Obteniendo items para sede:', branchId)
      
      const { data, error } = await this.supabase
        .from('items')
        .select(`
          id,
          name,
          type,
          duration_pricing,
          default_duration,
          stock,
          requires_deposit,
          deposit_amount,
          is_active,
          sede_id,
          empresa_id,
          created_at,
          updated_at
        `)
        .eq('sede_id', branchId)
        .eq('is_active', true)

      if (error) {
        console.error('❌ Error al obtener items:', error)
        throw new Error(`Error al obtener items: ${error.message}`)
      }

      if (!data) {
        console.log('ℹ️ No se encontraron items')
        return []
      }

      // Transformar los datos al formato esperado por la interfaz Item
      const items = data.map(item => ({
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        type: item.type as ItemType,
        price: Number(item.price) || 0,
        stock: Number(item.stock) || 0,
        duration_pricing: item.duration_pricing || {},
        default_duration: item.default_duration || 60,
        requiresDeposit: item.requires_deposit,
        depositAmount: item.deposit_amount,
        isActive: item.is_active,
        sede_id: item.sede_id,
        empresa_id: item.empresa_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))

      console.log('✅ Items transformados:', items)
      return items
    } catch (error) {
      console.error('❌ Error en getItemsByBranch:', error)
      throw error
    }
  }

  async createItem(item: Omit<Item, 'id'>, sedeId: string) {
    try {
      console.log('📍 Iniciando creación de item:', { item, sedeId })

      if (!sedeId) throw new Error('El ID de la sede es requerido')

      // Obtener la sede y verificar empresa_id
      const { data: sede, error: sedeError } = await this.supabase
        .from('sedes')
        .select('id, empresa_id, name')
        .eq('id', sedeId)
        .single()

      if (sedeError) throw sedeError
      if (!sede) throw new Error('Sede no encontrada')
      if (!sede.empresa_id) throw new Error('La sede no tiene una empresa asociada')

      // Validaciones
      const { stock, defaultDuration } = this.validateItemData(item)
      const duration_pricing = this.validatePricing(item.pricing)

      // Crear item
      const { data, error } = await this.supabase
        .from('items')
        .insert([{
          name: item.name,
          type: item.type,
          duration_pricing,
          default_duration: defaultDuration,
          stock,
          requires_deposit: item.requiresDeposit,
          deposit_amount: item.depositAmount,
          is_active: true,
          empresa_id: sede.empresa_id,
          sede_id: sedeId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No se pudo crear el item')

      console.log('✅ Item creado exitosamente:', data)
      return this.dbItemToAppItem(data)
    } catch (error: any) {
      console.error('❌ Error en createItem:', error)
      throw new Error(`Error al crear item: ${error.message}`)
    }
  }

  async updateItem(id: string, item: Omit<Item, 'id'>, sedeId: string) {
    try {
      console.log('📍 Iniciando actualización de item:', { id, item, sedeId })

      if (!sedeId) throw new Error('El ID de la sede es requerido')
      if (!id) throw new Error('El ID del item es requerido')

      // Validaciones
      const { stock, defaultDuration } = this.validateItemData(item)
      const duration_pricing = this.validatePricing(item.pricing)

      // Obtener la sede y verificar empresa_id
      const { data: sede, error: sedeError } = await this.supabase
        .from('sedes')
        .select('id, empresa_id')
        .eq('id', sedeId)
        .single()

      if (sedeError) throw sedeError
      if (!sede) throw new Error('Sede no encontrada')

      // Actualizar el item
      const { data, error } = await this.supabase
        .from('items')
        .update({
          name: item.name,
          type: item.type,
          duration_pricing,
          default_duration: defaultDuration,
          stock,
          requires_deposit: item.requiresDeposit,
          deposit_amount: item.depositAmount,
          is_active: item.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('sede_id', sedeId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No se pudo actualizar el item')

      console.log('✅ Item actualizado exitosamente:', data)
      return this.dbItemToAppItem(data)
    } catch (error: any) {
      console.error('❌ Error en updateItem:', error)
      throw new Error(`Error al actualizar item: ${error.message}`)
    }
  }

  async deleteItem(id: string, sedeId: string) {
    try {
      console.log('📍 Eliminando item:', { id, sedeId })

      if (!id) throw new Error('El ID del item es requerido')
      if (!sedeId) throw new Error('El ID de la sede es requerido')

      // Eliminación real del item
      const { error } = await this.supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('sede_id', sedeId)

      if (error) throw error

      console.log('✅ Item eliminado exitosamente')
    } catch (error: any) {
      console.error('❌ Error en deleteItem:', error)
      throw new Error(`Error al eliminar item: ${error.message}`)
    }
  }

  private dbItemToAppItem(dbItem: Database['public']['Tables']['items']['Row']): Item {
    return {
      id: dbItem.id,
      name: dbItem.name,
      type: dbItem.type,
      pricing: dbItem.duration_pricing || {},
      defaultDuration: dbItem.default_duration || 60,
      stock: dbItem.stock,
      requiresDeposit: dbItem.requires_deposit,
      depositAmount: dbItem.deposit_amount || undefined,
      isActive: dbItem.is_active
    }
  }

  private validateItemData(item: Omit<Item, 'id'>) {
    if (!item.name?.trim()) throw new Error('El nombre es requerido')
    if (!item.type) throw new Error('El tipo es requerido')
    if (item.stock === undefined || item.stock === null) throw new Error('El stock es requerido')
    
    const stock = Number(item.stock)
    if (isNaN(stock) || stock < 0) throw new Error('El stock debe ser un número válido no negativo')

    const defaultDuration = Number(item.defaultDuration) || 60
    if (isNaN(defaultDuration) || defaultDuration <= 0) {
      throw new Error('La duración por defecto debe ser un número válido mayor a 0')
    }

    return { stock, defaultDuration }
  }

  private validatePricing(pricing: Record<string, number> = {}) {
    const duration_pricing: Record<string, number> = {}
    
    Object.entries(pricing).forEach(([duration, price]) => {
      const numDuration = Number(duration)
      const numPrice = Number(price)
      
      if (isNaN(numDuration) || isNaN(numPrice)) {
        throw new Error('Los precios y duraciones deben ser números válidos')
      }
      if (numPrice < 0) {
        throw new Error('Los precios no pueden ser negativos')
      }
      
      duration_pricing[numDuration] = numPrice
    })

    return duration_pricing
  }
}

// Exportamos una instancia única del servicio
export const itemService = ItemService.getInstance() 