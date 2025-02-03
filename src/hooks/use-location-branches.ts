import { useBranches } from './useBranches'
import { useEffect, useState } from 'react'
import { Branch } from '@/types/branch'
import { LocationStepSettings } from '@/components/steps/location/types'

export function useLocationBranches(settings: LocationStepSettings) {
  const { branches, isLoading, error } = useBranches()
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([])

  useEffect(() => {
    if (!branches || error) {
      setFilteredBranches([])
      return
    }

    const filtered = branches.filter(branch => {
      if (!settings.showBranches) return false
      if (!branch.is_active) return false
      return true
    })

    setFilteredBranches(filtered)
  }, [branches, settings, error])

  return {
    branches: filteredBranches,
    isLoading,
    error
  }
} 