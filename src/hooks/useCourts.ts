import { useQuery } from '@tanstack/react-query'
import { courtService } from '@/services/courtService'
import { Court } from '@/types/court'

interface UseCourtOptions {
  branchId?: string
  onlyActive?: boolean
}

export function useCourts({ branchId, onlyActive = false }: UseCourtOptions) {
  return useQuery({
    queryKey: ['courts', branchId, onlyActive],
    queryFn: () => courtService.getCourtsByBranch(branchId || ''),
    enabled: !!branchId,
    select: (response) => {
      if (!response?.data) return []

      let courts = response.data

      // Filtrar por canchas activas si es necesario
      if (onlyActive) {
        courts = courts.filter(court => court.is_active)
      }

      return courts.map(court => {
        // Asegurarse de que los campos críticos existan y tengan el formato correcto
        const available_durations = Array.isArray(court.available_durations)
          ? [...court.available_durations]
              .map(d => Number(d))
              .filter(d => !isNaN(d))
              .sort((a, b) => a - b)
          : []

        // Asegurarse de que duration_pricing sea un objeto válido y los valores sean números
        const duration_pricing: Record<string, number> = {}
        if (typeof court.duration_pricing === 'object' && court.duration_pricing) {
          Object.entries(court.duration_pricing).forEach(([key, value]) => {
            const numValue = Number(value)
            if (!isNaN(numValue)) {
              duration_pricing[key] = numValue
            }
          })
        }

        // Asegurarse de que cada duración disponible tenga un precio
        available_durations.forEach(duration => {
          const key = duration.toString()
          if (!(key in duration_pricing)) {
            duration_pricing[key] = 0
          }
        })

        // Asegurarse de que custom_pricing sea un objeto válido
        const custom_pricing = typeof court.custom_pricing === 'object' && court.custom_pricing
          ? court.custom_pricing
          : {}

        console.log('Procesando cancha en hook:', {
          name: court.name,
          available_durations,
          duration_pricing,
          custom_pricing
        })

        return {
          ...court,
          available_durations,
          duration_pricing,
          custom_pricing
        } as Court
      })
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  })
} 