'use client'

import { useEffect } from 'react'
import { OnboardingProvider } from "./context/OnboardingContext"
import { organizationService } from '@/services/organizationService'
import { toast } from 'sonner'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const initializeCompanyData = async () => {
      try {
        const { error } = await organizationService.getCurrentOrganization()
        if (error) {
          console.error('Error al obtener/inicializar empresa:', error)
          toast.error('Error al inicializar los datos de la empresa')
        }
      } catch (error) {
        console.error('Error en la inicialización:', error)
      }
    }

    initializeCompanyData()
  }, [])

  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  )
} 