import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useBranches } from '@/hooks/useBranches'
import { courtService } from '@/services/courtService'
import { useCourts } from '@/hooks/useCourts'

interface Court {
  id: string
  name: string
  branch_id: string
  is_active: boolean
}

export function useGroupedCourts() {
  const { branches = [], isLoading: isLoadingBranches, error: branchesError } = useBranches()
  
  const { data: courts = [], isLoading: isLoadingCourts, error: courtsError } = useCourts({ 
    onlyActive: true 
  })

  const courtOptions = useMemo(() => {
    // Si no hay sedes o canchas, retornar array vacío
    if (!branches.length || !courts.length) return []

    // Crear un mapa de canchas por sede
    const courtsByBranch = new Map<string, Court[]>()
    
    // Agrupar las canchas por sede
    courts.forEach((court: Court) => {
      if (!courtsByBranch.has(court.branch_id)) {
        courtsByBranch.set(court.branch_id, [])
      }
      courtsByBranch.get(court.branch_id)?.push(court)
    })

    // Mapear las sedes a las opciones del multi-select
    return branches
      .map(branch => {
        const branchCourts = courtsByBranch.get(branch.id) || []
        return {
          id: branch.id,
          name: branch.name,
          options: branchCourts.map(court => ({
            id: court.id,
            name: court.name
          }))
        }
      })
      .filter(group => group.options.length > 0) // Solo incluir sedes con canchas
  }, [branches, courts])

  return {
    courtOptions,
    isLoading: isLoadingBranches || isLoadingCourts,
    error: branchesError || courtsError
  }
}       