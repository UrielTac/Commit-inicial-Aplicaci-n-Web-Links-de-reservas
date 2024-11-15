import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IconCalendar, IconClock } from "@tabler/icons-react"
import { CustomCalendar } from "@/components/ui/custom-calendar"
import { cn } from "@/lib/utils"
import { TimeSlotSelector } from "@/components/bookings/TimeSlotSelector"
import { CourtSelector } from "../CourtSelector"
import type { BookingStep, TimeSelection, Participant } from "../../types"
import { ParticipantStep } from "./ParticipantStep"
import { RentalStep } from "./RentalStep"
import type { RentalSelection, RentalItem } from "@/types/rentals"
import { PaymentStep } from "./PaymentStep"
import { ConfirmationStep } from "./ConfirmationStep"
import { courts } from "@/lib/data"
import { useState, useEffect } from "react"

// Datos de ejemplo para los artículos
const sampleRentalItems: RentalItem[] = [
  {
    id: '1',
    name: 'Paleta Profesional',
    description: 'Paleta de alta calidad para jugadores avanzados',
    price: 1500,
    available: 10,
    category: 'equipment'
  },
  {
    id: '2',
    name: 'Paleta Intermedia',
    description: 'Paleta ideal para jugadores intermedios',
    price: 1000,
    available: 15,
    category: 'equipment'
  },
  {
    id: '3',
    name: 'Pelotas (Pack x3)',
    description: 'Pack de 3 pelotas de pádel',
    price: 500,
    available: 20,
    category: 'accessories'
  }
]

interface SimpleShiftBookingProps {
  currentStep: BookingStep
  selectedDate: Date | undefined
  selectedCourts: string[]
  timeSelection?: TimeSelection
  participants: Participant[]
  rentals: RentalSelection[]
  onDateSelect: (date: Date | undefined) => void
  onCourtSelect: (courts: string[]) => void
  onTimeSelect: (time: TimeSelection) => void
  onParticipantAdd: (participant: Participant) => void
  onParticipantRemove: (participantId: string) => void
  onRentalChange: (rentals: RentalSelection[]) => void
  selectedPaymentMethods: ('cash' | 'card' | 'transfer')[]
  onPaymentMethodsChange: (methods: ('cash' | 'card' | 'transfer')[]) => void
  onValidationChange: (isValid: boolean) => void
}

export function SimpleShiftBooking({
  currentStep,
  selectedDate,
  selectedCourts,
  timeSelection,
  participants,
  rentals = [],
  onDateSelect,
  onCourtSelect,
  onTimeSelect,
  onParticipantAdd,
  onParticipantRemove,
  onRentalChange,
  selectedPaymentMethods,
  onPaymentMethodsChange,
  onValidationChange
}: SimpleShiftBookingProps) {
  const [isPaymentValid, setIsPaymentValid] = useState(false)

  const calculateTotalAmount = () => {
    // Calcular el total de la reserva (canchas + alquileres)
    const rentalTotal = rentals.reduce((total, rental) => {
      const item = sampleRentalItems.find(i => i.id === rental.itemId)
      return total + (item?.price || 0) * rental.quantity
    }, 0)
    
    // Aquí podrías agregar el costo de las canchas también
    const courtTotal = selectedCourts.length * 1500 // Ejemplo: $1500 por cancha
    
    return rentalTotal + courtTotal
  }

  // Validar el paso actual y notificar cambios
  useEffect(() => {
    let isValid = false

    switch (currentStep) {
      case 'booking-type':
        isValid = true
        break
      case 'date':
        isValid = Boolean(selectedDate)
        break
      case 'time':
        isValid = selectedCourts.length > 0 && timeSelection !== undefined
        break
      case 'participants':
        isValid = participants.length > 0
        break
      case 'rentals':
        isValid = true
        break
      case 'payment':
        isValid = isPaymentValid
        break
      case 'confirmation':
        isValid = true
        break
    }

    // Notificar el cambio de validación solo si la función existe
    onValidationChange?.(isValid)
  }, [
    currentStep,
    selectedDate,
    selectedCourts,
    timeSelection,
    participants,
    isPaymentValid,
    onValidationChange
  ])

  const renderStep = () => {
    switch (currentStep) {
      case 'date':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Fecha de la Reserva
              </h3>
              <CustomCalendar
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onDateSelect(date)
                  }
                }}
                className="rounded-md border shadow-sm"
              />
            </div>

            {selectedDate ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      Fecha seleccionada
                    </p>
                    <p className="text-sm text-gray-600 leading-tight">
                      {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { 
                        locale: es 
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[13px] text-gray-400 text-center"
              >
                Selecciona una fecha para continuar
              </motion.p>
            )}
          </div>
        )

      case 'time':
        return (
          <div className="space-y-6">
            {/* Selector de Canchas */}
            <CourtSelector
              selectedCourts={selectedCourts}
              onCourtToggle={(courtId) => {
                onCourtSelect(
                  selectedCourts.includes(courtId)
                    ? selectedCourts.filter(id => id !== courtId)
                    : [...selectedCourts, courtId]
                )
              }}
            />

            {/* Selector de Horario */}
            {selectedCourts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-medium text-gray-700">
                  Horario Disponible
                </h3>
                <TimeSlotSelector
                  selectedCourts={selectedCourts}
                  onTimeSelect={onTimeSelect}
                />
              </motion.div>
            )}
          </div>
        )

      case 'participants':
        return (
          <ParticipantStep
            participants={participants}
            onParticipantAdd={onParticipantAdd}
            onParticipantRemove={onParticipantRemove}
          />
        )

      case 'rentals':
        return (
          <RentalStep
            rentals={rentals || []}
            onRentalChange={onRentalChange}
          />
        )

      case 'payment':
        return (
          <PaymentStep
            totalAmount={calculateTotalAmount()}
            selectedMethods={selectedPaymentMethods}
            onMethodsChange={onPaymentMethodsChange}
            onValidationChange={(isValid) => {
              setIsPaymentValid(isValid)
            }}
          />
        )

      case 'confirmation':
        return (
          <ConfirmationStep
            selectedDate={selectedDate}
            selectedCourts={selectedCourts}
            courts={courts}
            totalAmount={calculateTotalAmount()}
            rentals={rentals}
            sampleRentalItems={sampleRentalItems}
          />
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6"
    >
      {renderStep()}
    </motion.div>
  )
} 