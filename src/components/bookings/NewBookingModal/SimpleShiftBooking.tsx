import { motion } from "framer-motion"
import type { BookingStep } from "./types"

interface SimpleShiftBookingProps {
  currentStep: BookingStep
  // ... props necesarias
}

export function SimpleShiftBooking({ currentStep, ...props }: SimpleShiftBookingProps) {
  // Renderiza los pasos específicos de reserva simple
  return (
    <div className="space-y-8 px-8 py-2">
      {/* ... contenido según el paso actual */}
    </div>
  )
} 