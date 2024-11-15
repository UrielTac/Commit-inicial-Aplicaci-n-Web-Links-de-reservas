import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

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
      <body className="min-h-screen bg-background antialiased">
        <div className="relative z-0">
          {children}
        </div>
      </body>
    </html>
  )
}
