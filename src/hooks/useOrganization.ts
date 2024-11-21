import { useContext } from 'react'
import { OrganizationContext } from '@/contexts/OrganizationContext'

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization debe ser usado dentro de un OrganizationProvider')
  }
  return context
} 