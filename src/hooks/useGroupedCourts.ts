import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useBranches } from '@/hooks/useBranches'
import { courtService } from '@/services/courtService'

interface Court {
  id: string
  name: string
  branch_id: string
  is_active: boolean
}

interface UseGroupedCourtsProps {
  selectedBranchIds?: string[]
}

export function useGroupedCourts({ selectedBranchIds }: UseGroupedCourtsProps = {}) {
  const { 
    branches = [], 
    isLoading: isLoadingBranches, 
    error: branchesError,
    currentBranch
  } = useBranches()
  
  // Filtrar sedes seleccionadas si se proporcionan
  const filteredBranches = useMemo(() => {
    if (!selectedBranchIds?.length) return branches
    return branches.filter(branch => selectedBranchIds.includes(branch.id))
  }, [branches, selectedBranchIds])
  
  // Obtener las canchas de todas las sedes
  const branchQueries = useQueries({
    queries: filteredBranches.map(branch => ({
      queryKey: ['courts', branch.id],
      queryFn: () => courtService.getCourtsByBranch(branch.id),
      enabled: !!branch.id
    }))
  })

  const isLoadingCourts = branchQueries.some(query => query.isLoading)
  const courtsError = branchQueries.find(query => query.error)?.error

  const courts = useMemo(() => {
    return branchQueries
      .filter(query => !query.isLoading && !query.error && query.data?.data)
      .flatMap(query => query.data?.data || [])
      // Filtrar solo canchas activas
      .filter(court => court.is_active)
  }, [branchQueries])

  console.log('useGroupedCourts - Estado:', {
    branches: filteredBranches.length,
    courts: courts.length,
    isLoadingBranches,
    isLoadingCourts,
    branchesError,
    courtsError,
    selectedBranchIds,
    currentBranch: currentBranch?.id
  })

  const courtOptions = useMemo(() => {
    // Si está cargando o hay error, retornar array vacío
    if (isLoadingBranches || isLoadingCourts) {
      console.log('useGroupedCourts - Cargando datos...')
      return []
    }

    if (branchesError || courtsError) {
      console.error('useGroupedCourts - Error:', { branchesError, courtsError })
      return []
    }

    // Si no hay sedes o canchas, retornar array vacío
    if (!filteredBranches.length || !courts.length) {
      console.log('useGroupedCourts - No hay datos disponibles')
      return []
    }

    // Crear un mapa de canchas por sede
    const courtsByBranch = new Map<string, Court[]>()
    
    // Agrupar las canchas por sede
    courts.forEach((court: Court) => {
      if (!courtsByBranch.has(court.branch_id)) {
        courtsByBranch.set(court.branch_id, [])
      }
      const branchCourts = courtsByBranch.get(court.branch_id)
      if (branchCourts) {
        branchCourts.push(court)
      }
    })

    // Mapear las sedes a las opciones del multi-select
    const options = filteredBranches
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
      // Solo incluir sedes con canchas activas
      .filter(group => group.options.length > 0)

    console.log('useGroupedCourts - Opciones generadas:', options)
    return options
  }, [filteredBranches, courts, isLoadingBranches, isLoadingCourts, branchesError, courtsError])

  return {
    courtOptions,
    isLoading: isLoadingBranches || isLoadingCourts,
    error: branchesError || courtsError
  }
}       