"use client"

import React from 'react'
import { Sidebar } from '@/components/sidebar'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const isFormBuilder = pathname === '/dashboard/forms-a/new' || pathname?.startsWith('/dashboard/forms-a/edit/')

  return (
    <div className="relative flex min-h-screen">
      <div className={cn(
        "fixed inset-0 transition-opacity duration-300",
        isFormBuilder ? "opacity-100 z-50" : "opacity-0 -z-10"
      )}>
        <div className="absolute inset-0 bg-[#F0F0F3]">
          <main className="h-full">
            {isFormBuilder && children}
          </main>
        </div>
      </div>

      <Sidebar />
      <main className={cn(
        "flex-1",
        "lg:pl-[240px]"
      )}>
        <div className="container p-8">
          {!isFormBuilder && children}
        </div>
      </main>
    </div>
  )
}
