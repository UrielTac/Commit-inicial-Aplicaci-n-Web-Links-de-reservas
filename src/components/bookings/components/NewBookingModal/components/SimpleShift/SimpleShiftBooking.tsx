import { motion } from "framer-motion"
import { ParticipantStep } from "./ParticipantStep"
import { RentalStep } from "./RentalStep"
import { PaymentStep } from "./PaymentStep"
import { ConfirmationStep } from "./ConfirmationStep"
import { useState, useEffect, useCallback } from "react"
import { useBranchContext } from "@/contexts/BranchContext"
import { useCourts } from "@/hooks/useCourts"
import { useItems } from "@/hooks/useItems"
import { timeToMinutes } from "@/lib/time-utils"
import type { BookingStep, TimeSelection } from "../../types"
import type { PaymentDetails } from "@/types/bookings"

interface SimpleShiftBookingProps {
  currentStep: BookingStep
  selectedCourts: string[]
  timeSelection?: TimeSelection
  onCourtSelect: (courtId: string) => void
  onTimeSelect: (time: TimeSelection) => void
  onValidationChange: (isValid: boolean) => void
  onPaymentChange: (details: PaymentDetails) => void
  onRentalChange: (rentals: any[]) => void
}

export function SimpleShiftBooking({
  currentStep,
  selectedCourts,
  timeSelection,
  onCourtSelect,
  onTimeSelect,
  onValidationChange,
  onPaymentChange,
  onRentalChange,
  rentals = []
}: SimpleShiftBookingProps) {
  const [isPaymentValid, setIsPaymentValid] = useState(false)
  const { currentBranch } = useBranchContext()
  const { data: courts = [] } = useCourts({ branchId: currentBranch?.id })
  const { data: items = [] } = useItems(currentBranch?.id)
  const [totalAmount, setTotalAmount] = useState(0)

  const calculateTotalAmount = useCallback(() => {
    if (!timeSelection || !selectedCourts.length) return 0

    // Calcular duración en minutos
    const startMinutes = timeToMinutes(timeSelection.startTime)
    const endMinutes = timeToMinutes(timeSelection.endTime)
    const duration = endMinutes - startMinutes

    // Calcular precio de las canchas
    const courtPrice = selectedCourts.reduce((total, courtId) => {
      const court = courts.find(c => c.id === courtId)
      if (!court?.duration_pricing) return total

      const durationKey = duration.toString()
      const price = Number(court.duration_pricing[durationKey]) || 0
      return total + price
    }, 0)

    // Calcular precio de los rentals
    const rentalPrice = rentals.reduce((total, rental) => {
      const item = items.find(i => i.id === rental.itemId)
      if (!item?.duration_pricing) return total

      const durationKey = duration.toString()
      const price = Number(item.duration_pricing[durationKey]) || 0
      return total + (price * rental.quantity)
    }, 0)

    return courtPrice + rentalPrice
  }, [timeSelection, selectedCourts, courts, rentals, items])

  // Actualizar el total cuando cambian los datos relevantes
  useEffect(() => {
    const newTotal = calculateTotalAmount()
    setTotalAmount(newTotal)
  }, [calculateTotalAmount])

  // Validar el paso actual y notificar cambios
  useEffect(() => {
    let isValid = false
    switch (currentStep) {
      case 'payment':
        const total = calculateTotalAmount()
        isValid = total > 0
        break
      default:
        isValid = true
    }
    onValidationChange(isValid)
  }, [currentStep, calculateTotalAmount, onValidationChange])

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
                  selectedDate={selectedDate || new Date()}
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
            rentals={rentals}
            onRentalChange={onRentalChange}
            startTime={timeSelection?.startTime}
            endTime={timeSelection?.endTime}
            duration={timeSelection?.duration}
          />
        )

      case 'payment':
        return (
          <PaymentStep
            totalAmount={totalAmount}
            selectedRentals={rentals || []}
            selectedCourts={selectedCourts}
            startTime={timeSelection?.startTime || '00:00'}
            endTime={timeSelection?.endTime || '00:00'}
            onPaymentChange={(details) => {
              onPaymentChange(details)
              // Actualizar el total cuando cambia el pago
              setTotalAmount(details.totalAmount)
            }}
            onNext={() => onValidationChange(true)}
            onBack={() => onValidationChange(false)}
          />
        )

      case 'confirmation':
        return (
          <ConfirmationStep
            selectedDate={selectedDate}
            selectedCourts={selectedCourts}
            courts={courts}
            totalAmount={totalAmount} // Usar el mismo total que en PaymentStep
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