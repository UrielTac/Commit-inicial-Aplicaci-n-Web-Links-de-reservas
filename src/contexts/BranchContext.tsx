"use client"

import { createContext, useContext, useState, useEffect } from 'react'
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

// Función para obtener las sedes
const fetchBranches = async () => {
  const { data, error } = await supabase
    .from('sedes')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)

  // Usar React Query para manejar el estado y caché de las sedes
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    onSuccess: (data) => {
      // Si no hay sede seleccionada y hay sedes disponibles, seleccionar la primera
      if (!currentBranch && data.length > 0) {
        setCurrentBranch(data[0])
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
  })

  // Persistir la sede seleccionada en localStorage
  useEffect(() => {
    const savedBranch = localStorage.getItem('currentBranch')
    if (savedBranch && !currentBranch) {
      const branch = JSON.parse(savedBranch)
      setCurrentBranch(branch)
    }
  }, [])

  useEffect(() => {
    if (currentBranch) {
      localStorage.setItem('currentBranch', JSON.stringify(currentBranch))
    }
  }, [currentBranch])

  return (
    <BranchContext.Provider value={{ 
      currentBranch, 
      setCurrentBranch, 
      branches, 
      isLoading 
    }}>
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