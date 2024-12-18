import { useQuery } from '@tanstack/react-query'
import { supabase } from "@/lib/supabase"
import { useBranches } from "./useBranches"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useCallback, useMemo } from 'react'

interface TimeRange {
  openTime: string
  closeTime: string
}

interface DaySchedule {
  isOpen: boolean
  timeRanges: TimeRange[]
}

interface BusinessHours {
  [key: string]: DaySchedule
}

export function useBusinessHours(selectedDate?: Date) {
  const { currentBranch } = useBranches()
  const currentDate = selectedDate || new Date()
  
  // Mapeo inverso de días en español a inglés
  const dayMap: { [key: string]: string } = {
    'lunes': 'monday',
    'martes': 'tuesday',
    'miércoles': 'wednesday',
    'jueves': 'thursday',
    'viernes': 'friday',
    'sábado': 'saturday',
    'domingo': 'sunday'
  }
  
  // Obtener el día en español y convertirlo a inglés
  const spanishDay = format(currentDate, 'EEEE', { locale: es }).toLowerCase()
  const dayOfWeek = dayMap[spanishDay]

  console.log('📅 Día actual:', {
    spanishDay,
    dayOfWeek,
    date: format(currentDate, 'dd/MM/yyyy')
  })

  const timeToMinutes = useCallback((time: string) => {
    if (!time) return 0
    const [hours, minutes] = time.split(':').map(Number)
    return (hours * 60) + (minutes || 0)
  }, [])

  const minutesToTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }, [])

  const businessHoursQuery = useQuery({
    queryKey: ['businessHours', currentBranch?.id, dayOfWeek],
    queryFn: async () => {
      if (!currentBranch?.id) {
        throw new Error('No hay sede seleccionada')
      }

      console.log('🔍 Consultando horarios para:', {
        sede: currentBranch.id,
        dia: dayOfWeek,
        fecha: format(currentDate, 'dd/MM/yyyy')
      })

      const { data: branch, error } = await supabase
        .from('sedes')
        .select('opening_hours')
        .eq('id', currentBranch.id)
        .single()

      if (error) {
        console.error('❌ Error al obtener horarios:', error)
        throw error
      }

      if (!branch?.opening_hours) {
        console.error('❌ No hay horarios configurados para la sede')
        throw new Error('No hay horarios configurados para esta sede')
      }

      const hours = branch.opening_hours as BusinessHours
      console.log('📅 Horarios de la sede:', hours)

      const todaySchedule = hours[dayOfWeek]
      if (!todaySchedule) {
        console.error('❌ No se encontró configuración para el día:', dayOfWeek)
        console.log('Días disponibles:', Object.keys(hours))
        throw new Error(`No hay horarios configurados para ${dayOfWeek}`)
      }

      // Calcular el rango total del día
      let earliestMinutes = Number.MAX_SAFE_INTEGER
      let latestMinutes = 0

      todaySchedule.timeRanges.forEach(range => {
        const startMinutes = timeToMinutes(range.openTime)
        const endMinutes = timeToMinutes(range.closeTime)
        
        earliestMinutes = Math.min(earliestMinutes, startMinutes)
        latestMinutes = Math.max(latestMinutes, endMinutes)

        console.log('⏰ Procesando rango:', {
          range,
          startMinutes,
          endMinutes
        })
      })

      const result = {
        isOpen: true, // Siempre true ya que mostraremos todo el rango
        timeRanges: todaySchedule.timeRanges,
        fullRange: {
          openTime: minutesToTime(earliestMinutes),
          closeTime: minutesToTime(latestMinutes)
        }
      }

      console.log('✅ Resultado final:', result)
      return result
    },
    enabled: !!currentBranch?.id && !!dayOfWeek,
    staleTime: 0,
    gcTime: 0,
    retry: 1
  })

  const businessHours = useMemo(() => {
    if (!businessHoursQuery.data?.fullRange) {
      return null
    }

    const result = {
      start: businessHoursQuery.data.fullRange.openTime,
      end: businessHoursQuery.data.fullRange.closeTime
    }

    console.log('📊 Horario calculado:', result)
    return result
  }, [businessHoursQuery.data])

  return {
    ...businessHoursQuery,
    businessHours,
    isOpen: true, // Siempre true
    timeRanges: businessHoursQuery.data?.timeRanges || [],
    isTimeInRange: useCallback((time: string) => {
      if (!businessHoursQuery.data?.timeRanges?.length) return true
      const timeMinutes = timeToMinutes(time)
      return businessHoursQuery.data.timeRanges.some(range => {
        const startMinutes = timeToMinutes(range.openTime)
        const endMinutes = timeToMinutes(range.closeTime)
        return timeMinutes >= startMinutes && timeMinutes < endMinutes
      })
    }, [businessHoursQuery.data?.timeRanges, timeToMinutes])
  }
} 