"use client"

import { createContext, ReactNode, useEffect, useState } from 'react'
import { organizationService } from '@/services/organizationService'
import { toast } from "@/components/ui/use-toast"

interface OrganizationContextType {
  organizationId: string | null
  isLoading: boolean
  error: string | null
}

export const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ 
  children 
}: { 
  children: ReactNode
}) {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrganization() {
      try {
        const { data, error } = await organizationService.getCurrentOrganization()
        
        if (error) {
          setError(error.message)
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
          return
        }

        if (!data) {
          setError('No se encontró ninguna organización')
          return
        }

        setOrganizationId(data.id)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrganization()
  }, [])

  return (
    <OrganizationContext.Provider value={{ organizationId, isLoading, error }}>
      {children}
    </OrganizationContext.Provider>
  )
} 