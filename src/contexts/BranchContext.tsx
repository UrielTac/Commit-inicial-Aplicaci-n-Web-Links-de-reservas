"use client"

import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { Branch } from '@/types/database.types'
import { supabase } from '@/services/supabase'
import { useQuery } from '@tanstack/react-query'

interface BranchContextType {
  currentBranch: Branch | null
  setCurrentBranch: (branch: Branch | null) => void
  branches: Branch[]
  isLoading: boolean
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(() => {
    if (typeof window === 'undefined') return null
    
    try {
      const saved = localStorage.getItem('currentBranch')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Error al cargar la sede desde localStorage:', error)
      return null
    }
  })

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('sedes')
          .select('*')
          .order('name')

        if (error) throw error
        
        if (!data?.length) {
          throw new Error('No hay sedes disponibles')
        }

        return data
      } catch (error) {
        console.error('Error al cargar sedes:', error)
        throw error
      }
    },
    retry: 3,
    onSuccess: (data) => {
      if (!currentBranch && data.length > 0) {
        setCurrentBranch(data[0])
      }
    }
  })

  useEffect(() => {
    if (currentBranch) {
      try {
        localStorage.setItem('currentBranch', JSON.stringify(currentBranch))
      } catch (error) {
        console.error('Error al guardar la sede en localStorage:', error)
      }
    }
  }, [currentBranch])

  const value = useMemo(() => ({
    currentBranch,
    setCurrentBranch,
    branches,
    isLoading
  }), [currentBranch, branches, isLoading])

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranchContext() {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error('useBranchContext must be used within a BranchProvider')
  }
  return context
} 