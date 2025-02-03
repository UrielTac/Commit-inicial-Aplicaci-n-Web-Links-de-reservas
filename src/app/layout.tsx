import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import { DateProvider } from "@/contexts/DateContext"
import { BranchProvider } from '@/contexts/BranchContext'
import { OrganizationProvider } from '@/contexts/OrganizationContext'
import { FormProvider } from "@/contexts/FormContext"
import { PayPalProvider } from "@/components/providers/paypal-provider"
import { StripeProvider } from "@/components/providers/stripe-provider"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Panel Admin - Padel',
  description: 'Panel administrativo para gestión de canchas de padel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <FormProvider>
            <OrganizationProvider>
              <BranchProvider>
                <DateProvider>
                  <PayPalProvider>
                    <StripeProvider>
                      {children}
                    </StripeProvider>
                  </PayPalProvider>
                  <Toaster />
                </DateProvider>
              </BranchProvider>
            </OrganizationProvider>
          </FormProvider>
        </Providers>
      </body>
    </html>
  )
}
