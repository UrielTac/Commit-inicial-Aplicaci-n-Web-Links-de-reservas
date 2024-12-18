import { supabase } from '@/lib/supabase'
import { type Database } from '@/types/supabase'
import { type BookingCreationData } from '@/types/bookings'
import type { BookingParticipant, SelectedBooking } from '@/types/bookings'

interface ServiceResponse<T> {
  data?: T
  error?: {
    message: string
    code?: string
    details?: string
  }
}

export const bookingService = {
  async checkAvailability(data: BookingCreationData): Promise<boolean> {
    try {
      if (!data.courtId || !data.date || !data.startTime || !data.endTime) {
        console.error('Datos incompletos para verificar disponibilidad:', data)
        return false
      }

      // Verificar si hay reservas existentes que se superpongan
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('court_id', data.courtId)
        .eq('date', data.date)
        .or(
          `and(start_time.lt.${data.endTime},end_time.gt.${data.startTime})`
        )

      if (error) {
        console.error('Error al verificar disponibilidad:', error)
        return false
      }

      return !existingBookings || existingBookings.length === 0
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error)
      return false
    }
  },

  async createPaymentRecord(bookingId: string, data: BookingCreationData) {
    try {
      if (data.depositAmount && data.depositAmount > 0) {
        await supabase.from('payments').insert({
          booking_id: bookingId,
          amount: data.depositAmount,
          payment_type: 'deposit',
          payment_method: data.paymentMethod === 'card' ? 'stripe' : data.paymentMethod,
          payment_status: data.paymentStatus as 'pending' | 'partial' | 'completed',
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error al crear registros de pago:', error);
      throw error;
    }
  },

  async createBooking(data: BookingCreationData): Promise<ServiceResponse<any>> {
    try {
      // Log inicial
      console.log('Datos recibidos en createBooking:', data)

      // Validaciones detalladas
      if (!data.courtId) throw new Error('El ID de la cancha es requerido')
      if (!data.date) throw new Error('La fecha es requerida')
      if (!data.startTime) throw new Error('La hora de inicio es requerida')
      if (!data.endTime) throw new Error('La hora de fin es requerida')
      if (!data.totalPrice) throw new Error('El precio total es requerido')

      // Crear la reserva (el trigger se encargará de crear el payment)
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          court_id: data.courtId,
          date: data.date,
          start_time: data.startTime,
          end_time: data.endTime,
          title: data.title || null,
          description: data.description || null,
          total_price: data.totalPrice,
          payment_status: data.paymentStatus,
          payment_method: data.paymentMethod,
          deposit_amount: data.depositAmount || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Si hay participantes, crear los registros correspondientes
      if (data.participants && data.participants.length > 0 && booking) {
        const { error: participantsError } = await supabase
          .from('booking_participants')
          .insert(
            data.participants.map(p => ({
              booking_id: booking.id,
              member_id: p.memberId,
              role: p.role
            }))
          )

        if (participantsError) {
          console.error('Error al crear los participantes:', participantsError)
        }
      }

      // Si hay items rentados, crear los registros correspondientes
      if (data.rentalItems && data.rentalItems.length > 0 && booking) {
        const { error: rentalsError } = await supabase
          .from('booking_rentals')
          .insert(
            data.rentalItems.map(rental => ({
              booking_id: booking.id,
              item_id: rental.itemId,
              quantity: rental.quantity,
              price_per_unit: rental.pricePerUnit,
              total_price: rental.pricePerUnit * rental.quantity
            }))
          )

        if (rentalsError) {
          console.error('Error al crear los rentals:', rentalsError)
        }
      }

      // Refrescar los datos
      const { data: updatedBooking, error: refreshError } = await supabase
        .from('bookings')
        .select(`
          *,
          court:courts(id, name),
          booking_participants(
            id,
            member:members(
              id,
              first_name,
              last_name
            )
          ),
          booking_rentals(
            id,
            item:items(id, name),
            quantity,
            price_per_unit,
            total_price
          )
        `)
        .eq('id', booking.id)
        .single()

      if (refreshError) {
        console.error('Error al refrescar los datos:', refreshError)
      }

      return { data: updatedBooking || booking }
    } catch (error: any) {
      console.error('Error en createBooking:', error)
      return {
        error: {
          message: error.message || 'Error al crear la reserva',
          details: error.details || error.toString()
        }
      }
    }
  },

  async getBookingsByDate(date: string, branchId?: string): Promise<ServiceResponse<any>> {
    try {
      // Validaciones básicas
      if (!date) {
        return {
          error: {
            message: 'La fecha es requerida',
            code: 'MISSING_DATE'
          }
        }
      }

      let query = supabase
        .from('bookings')
        .select(`
          id,
          court_id,
          date,
          start_time,
          end_time,
          total_price,
          payment_status,
          payment_method,
          deposit_amount,
          courts (
            id,
            name
          ),
          booking_participants (
            id,
            member_id,
            members (
              id,
              first_name,
              last_name
            )
          )
        `)
        .eq('date', date)

      if (branchId) {
        query = query.eq('courts.branch_id', branchId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error al obtener reservas:', error)
        return {
          error: {
            message: 'Error al obtener las reservas',
            code: 'FETCH_ERROR',
            details: error.message
          }
        }
      }

      // Log detallado de la respuesta
      console.log('Respuesta completa de Supabase:', {
        data,
        error,
        hayDatos: !!data && data.length > 0
      })

      const transformedData = data?.map(booking => {
        console.log('Procesando reserva:', booking)

        // Extraer participantes correctamente de la estructura anidada
        const participants = booking.booking_participants?.map(bp => {
          if (bp.members) {
            return {
              id: bp.members.id,
              first_name: bp.members.first_name,
              last_name: bp.members.last_name,
              role: 'player'
            }
          }
          return null
        }).filter(Boolean) || []

        console.log('Participantes procesados:', participants)

        const transformedBooking = {
          id: booking.id,
          courtId: booking.court_id,
          court: booking.court_id,
          date: booking.date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          price: booking.total_price,
          totalAmount: booking.total_price,
          paymentStatus: booking.payment_status,
          paymentMethod: booking.payment_method,
          depositAmount: booking.deposit_amount || 0,
          participants,
          title: booking.title || undefined,
          description: booking.description || undefined
        }

        // Debug para verificar la transformación
        console.log('Datos de pago transformados:', {
          original: {
            payment_method: booking.payment_method,
            deposit_amount: booking.deposit_amount,
            payment_status: booking.payment_status
          },
          transformed: {
            paymentMethod: transformedBooking.paymentMethod,
            depositAmount: transformedBooking.depositAmount,
            paymentStatus: transformedBooking.paymentStatus
          }
        })

        console.log('Reserva transformada:', transformedBooking)
        return transformedBooking
      })

      console.log('Datos transformados:', transformedData)

      return { data: transformedData }
    } catch (error: any) {
      console.error('Error inesperado al obtener reservas:', error)
      return {
        error: {
          message: 'Error inesperado al obtener las reservas',
          code: 'UNEXPECTED_ERROR',
          details: error.message
        }
      }
    }
  },

  async saveBookingParticipants(bookingId: string, participants: BookingParticipant[]) {
    const { data, error } = await supabase
      .from('booking_participants')
      .insert(
        participants.map(participant => ({
          booking_id: bookingId,
          member_id: participant.id,
          role: 'player'
        }))
      )

    if (error) {
      throw new Error('Error al guardar los participantes: ' + error.message)
    }

    return data
  },

  async saveBookingRentals(bookingId: string, rentals: Array<{ itemId: string; quantity: number; pricePerUnit: number }>) {
    const { data, error } = await supabase
      .from('booking_rentals')
      .insert(
        rentals.map(rental => ({
          booking_id: bookingId,
          item_id: rental.itemId,
          quantity: rental.quantity,
          price_per_unit: rental.pricePerUnit,
          total_price: rental.pricePerUnit * rental.quantity
        }))
      )

    if (error) {
      return { error }
    }

    return { data }
  },

  transformBookingResponse(booking: any): SelectedBooking {
    console.log('BookingService - Transformando reserva:', {
      id: booking.id,
      participantes: booking.participants,
      hayParticipantes: !!booking.participants
    })
    
    const participants: BookingParticipant[] = []
    
    if (booking.booking_participants && Array.isArray(booking.booking_participants)) {
      booking.booking_participants.forEach((participant: any) => {
        if (participant?.members) {
          const member = participant.members
          console.log('BookingService - Datos de miembro:', {
            participantId: participant.id,
            memberId: member.id,
            memberData: member
          })
          
          if (member && member.first_name && member.last_name) {
            participants.push({
              id: member.id,
              firstName: member.first_name,
              lastName: member.last_name,
              email: member.email || '',
              phone: member.phone || '',
              role: participant.role || 'player'
            })
          } else {
            participants.push({
              id: '',
              firstName: 'Usuario',
              lastName: 'No Registrado'
            })
          }
        } else {
          participants.push({
            id: '',
            firstName: 'Usuario',
            lastName: 'No Registrado'
          })
        }
      })
    } else {
      participants.push({
        id: '',
        firstName: 'Usuario',
        lastName: 'No Registrado'
      })
    }

    const transformedBooking: SelectedBooking = {
      ...booking,
      participants,
      title: booking.title || undefined,
      description: booking.description || undefined
    }

    console.log('BookingService - Reserva transformada:', transformedBooking)
    
    return transformedBooking
  },

  async addPayment(bookingId: string, paymentData: {
    amount: number;
    paymentType: 'remaining' | 'refund';
    paymentMethod: string;
    notes?: string;
  }) {
    try {
      // Validar que los datos sean correctos
      if (!bookingId || !paymentData.amount || !paymentData.paymentMethod) {
        throw new Error('Datos de pago incompletos');
      }

      // Validar que el método de pago sea válido
      const validMethods = ['cash', 'stripe', 'transfer'] as const;
      if (!validMethods.includes(paymentData.paymentMethod as any)) {
        throw new Error(`Método de pago inválido. Debe ser uno de: ${validMethods.join(', ')}`);
      }

      // Asegurar que el tipo de pago sea válido
      const validTypes = ['booking', 'deposit', 'remaining', 'refund'] as const;
      if (!validTypes.includes(paymentData.paymentType)) {
        throw new Error(`Tipo de pago inválido. Debe ser uno de: ${validTypes.join(', ')}`);
      }

      const { data, error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: paymentData.amount,
          payment_type: paymentData.paymentType,
          payment_method: paymentData.paymentMethod,
          payment_status: 'completed',
          notes: paymentData.notes || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23514') { // Violation of check constraint
          throw new Error('Error de validación en la base de datos. Verifique los datos.');
        }
        throw error;
      }

      return { data };
    } catch (error: any) {
      console.error('Error al agregar pago:', error);
      throw error;
    }
  }
} 