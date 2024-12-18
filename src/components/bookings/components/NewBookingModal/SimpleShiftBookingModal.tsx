import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { SimpleShiftBooking } from "./SimpleShiftBooking"
import { ModalHeader } from "./components/ModalHeader"
import { ModalFooter } from "./components/ModalFooter"
import { useBookingState } from "./hooks/useBookingState"
import { bookingService } from "@/services/bookingService"
import { useDateContext } from "@/contexts/DateContext"
import { useBranchContext } from "@/contexts/BranchContext"
import { useCourts } from "@/hooks/useCourts"
import { useItems } from "@/hooks/useItems"
import { timeToMinutes } from "@/lib/time-utils"
import { toast } from "sonner"
import type { Selection, PaymentDetails } from "@/types/bookings"
import type { RentalSelection } from "@/types/items"
import { useQueryClient } from '@tanstack/react-query'

interface SimpleShiftBookingModalProps {
  isOpen: boolean
  onClose: () => void
  selection?: Selection
}

export function SimpleShiftBookingModal({ 
  isOpen, 
  onClose,
  selection
}: SimpleShiftBookingModalProps) {
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)
  const [isStepValid, setIsStepValid] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const { selectedDate } = useDateContext()
  const { currentBranch } = useBranchContext()
  const { data: courts = [] } = useCourts({ branchId: currentBranch?.id })
  const { data: items = [] } = useItems(currentBranch?.id)
  const [rentals, setRentals] = useState<RentalSelection[]>([])
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(() => {
    const durationInMinutes = selection 
      ? timeToMinutes(selection.endTime) - timeToMinutes(selection.startTime)
      : 0
    const numberOfCourts = selection?.selections.length || 0
    const courtPrice = durationInMinutes * numberOfCourts * 100

    // Calcular precio total inicial (canchas + rentals)
    const total = courtPrice

    return {
      totalAmount: total,
      deposit: total,
      paymentStatus: 'completed',
      paymentMethod: 'cash',
      isPaid: false
    }
  })

  const {
    currentStep,
    selectedCourts,
    timeSelection,
    handleContinue,
    handleBack,
    resetState,
    setSelectedCourts,
    setTimeSelection,
  } = useBookingState({
    initialBookingType: 'shift',
    disableTypeSelection: true,
    initialStep: 'participants'
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen && selection) {
      const durationInMinutes = timeToMinutes(selection.endTime) - timeToMinutes(selection.startTime)
      console.log('Calculando duración para timeSelection:', {
        startTime: selection.startTime,
        endTime: selection.endTime,
        slots: selection.slots,
        durationInMinutes,
        calculatedFromSlots: selection.slots * 15
      })

      setSelectedCourts(selection.selections.map(sel => sel.courtId))
      setTimeSelection({
        startTime: selection.startTime,
        endTime: selection.endTime,
        duration: durationInMinutes
      })
    }
  }, [isOpen, selection, setSelectedCourts, setTimeSelection])

  useEffect(() => {
    switch (currentStep) {
      case 'participants':
        setIsStepValid(participants.length > 0)
        break
      case 'rentals':
        setIsStepValid(true) // Los rentals son opcionales
        break
      case 'payment':
        setIsStepValid(true) // La validación del pago se maneja en el componente PaymentStep
        break
      case 'confirmation':
        setIsStepValid(true)
        break
      default:
        setIsStepValid(false)
    }
  }, [currentStep, participants.length])

  useEffect(() => {
    if (!isOpen) {
      resetState()
      setParticipants([])
      setIsStepValid(false)
    }
  }, [isOpen, resetState])

  useEffect(() => {
    if (selection && courts.length > 0) {
      try {
        const durationInMinutes = timeToMinutes(selection.endTime) - timeToMinutes(selection.startTime)
        if (durationInMinutes <= 0) {
          console.warn('Duración inválida:', { startTime: selection.startTime, endTime: selection.endTime })
          return
        }

        // Calcular precio de las canchas
        const courtPrice = selection.selections.reduce((total, sel) => {
          const court = courts.find(c => c.id === sel.courtId)
          if (!court?.duration_pricing) return total

          const durationKey = durationInMinutes.toString()
          const price = Number(court.duration_pricing[durationKey]) || 0
          return total + price
        }, 0)

        // Calcular precio de los rentals usando el precio base
        const rentalPrice = rentals.reduce((total, rental) => {
          const item = items.find(i => i.id === rental.itemId)
          if (!item?.duration_pricing) return total

          // Usar el precio base del item
          const defaultDuration = item.default_duration || 60
          const basePrice = Number(item.duration_pricing[defaultDuration.toString()]) || 0
          const itemTotal = basePrice * rental.quantity

          return total + itemTotal
        }, 0)

        const newTotal = courtPrice + rentalPrice

        console.log('Calculando nuevo total:', {
          durationInMinutes,
          courtPrice,
          rentalPrice,
          newTotal,
          rentals: rentals.length,
          items: items.length
        })

        setPaymentDetails(prev => ({
          ...prev,
          totalAmount: newTotal,
          deposit: prev.paymentStatus === 'completed' ? newTotal : prev.deposit
        }))
      } catch (error) {
        console.error('Error al calcular el precio:', error)
      }
    }
  }, [selection, courts, rentals, items])

  // Efecto para confirmar automáticamente en el paso de confirmación
  useEffect(() => {
    if (currentStep === 'confirmation') {
      handleConfirmBooking()
        .then(() => {
          // Refrescar las reservaciones después de crear una nueva
          queryClient.invalidateQueries(['bookings', selectedDate.toISOString().split('T')[0], currentBranch?.id])
          toast.success('Reserva creada exitosamente')
        })
        .catch((error) => {
          console.error('Error al crear la reserva:', error)
          toast.error(error.message || 'Error al crear la reserva')
          handleBack()
        })
    }
  }, [currentStep, queryClient, selectedDate, currentBranch?.id])

  const handleConfirmBooking = async () => {
    if (!selection || !selectedDate || !timeSelection) return

    if (!paymentDetails.totalAmount || paymentDetails.totalAmount <= 0) {
      throw new Error('El precio total es requerido y debe ser mayor a 0')
    }

    // Calcular precios finales como en BookingPopup
    const durationInMinutes = timeToMinutes(timeSelection.endTime) - timeToMinutes(timeSelection.startTime)
    
    // Precio de las canchas
    const courtPrice = selection.selections.reduce((total, sel) => {
      const court = courts.find(c => c.id === sel.courtId)
      if (!court?.duration_pricing) return total
      const durationKey = durationInMinutes.toString()
      return total + (Number(court.duration_pricing[durationKey]) || 0)
    }, 0)

    // Preparar items de rental exactamente como en BookingPopup
    const rentalItemsWithPrices = rentals.map(rental => {
      const item = items.find(i => i.id === rental.itemId)
      if (!item) return {
        itemId: rental.itemId,
        quantity: rental.quantity,
        pricePerUnit: 0
      }

      // Usar el precio base del item
      const defaultDuration = item.default_duration || 60
      const basePrice = Number(item.duration_pricing[defaultDuration.toString()]) || 0

      return {
        itemId: rental.itemId,
        quantity: rental.quantity,
        pricePerUnit: basePrice
      }
    })

    // Calcular el precio total de los rentals
    const rentalTotal = rentalItemsWithPrices.reduce((total, rental) => 
      total + (rental.pricePerUnit * rental.quantity), 0)

    // Total final que incluye tanto la cancha como los rentals
    const finalTotal = courtPrice + rentalTotal

    try {
      // Crear la reserva
      const bookingResult = await bookingService.createBooking({
        courtId: selectedCourts[0],
        date: selectedDate.toISOString().split('T')[0],
        startTime: timeSelection.startTime,
        endTime: timeSelection.endTime,
        totalPrice: paymentDetails.totalAmount,
        paymentStatus: paymentDetails.paymentStatus,
        paymentMethod: paymentDetails.paymentMethod === 'card' ? 'stripe' : paymentDetails.paymentMethod,
        depositAmount: paymentDetails.deposit,
        participants: [], // Campo requerido por BookingCreationData
        rentalItems: [] // Campo requerido por BookingCreationData
      })

      if (bookingResult.error) {
        throw new Error(bookingResult.error.message || 'Error al crear la reserva')
      }

      if (!bookingResult.data || !bookingResult.data.id) {
        throw new Error('No se pudo obtener el ID de la reserva')
      }

      // Si hay participantes, guardarlos
      if (participants.length > 0) {
        await bookingService.saveBookingParticipants(bookingResult.data.id, participants)
      }

      // Si hay rentals, guardarlos
      if (rentals.length > 0 && bookingResult.data.id) {
        const { error: rentalsError } = await bookingService.saveBookingRentals(
          bookingResult.data.id,
          rentalItemsWithPrices.map(rental => ({
            itemId: rental.itemId,
            quantity: rental.quantity,
            pricePerUnit: rental.pricePerUnit
          }))
        )

        if (rentalsError) {
          console.error('Error al guardar los rentals:', rentalsError)
        }
      }

      onClose()
      return bookingResult.data
    } catch (error: any) {
      console.error('Error al crear la reserva:', error)
      throw new Error(error.message || 'Error al crear la reserva')
    }
  }

  const handleBackAction = () => {
    if (currentStep === 'participants') {
      onClose()
    } else {
      handleBack()
    }
  }

  const handleContinueAction = async () => {
    if (currentStep === 'confirmation') {
      // Solo cerramos el modal cuando el usuario hace clic en Aceptar
      onClose()
    } else {
      handleContinue()
    }
  }

  if (!selection || !mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ 
              x: "100%", 
              opacity: 0,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l z-50"
          >
            <div className="h-full flex flex-col">
              <ModalHeader 
                currentStep={currentStep}
                selectedBookingType="shift"
              />

              <div className="flex-1 overflow-y-auto">
                <SimpleShiftBooking
                  currentStep={currentStep}
                  selectedCourts={selectedCourts}
                  timeSelection={timeSelection}
                  onCourtSelect={setSelectedCourts}
                  onTimeSelect={setTimeSelection}
                  onValidationChange={setIsStepValid}
                  onPaymentChange={setPaymentDetails}
                  onRentalChange={setRentals}
                  participants={participants}
                  onParticipantChange={setParticipants}
                  startTime={timeSelection?.startTime}
                  endTime={timeSelection?.endTime}
                />
              </div>

              <ModalFooter
                currentStep={currentStep}
                onBack={handleBackAction}
                onContinue={handleContinueAction}
                isValid={isStepValid}
                isSimpleShift={true}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
} 