"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { OrganizationProvider } from "@/contexts/OrganizationContext"
import { BranchProvider } from "@/contexts/BranchContext"
import { Toaster } from 'sonner'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider>
        <BranchProvider>
          {children}
          <Toaster richColors position="top-center" />
        </BranchProvider>
      </OrganizationProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
} 