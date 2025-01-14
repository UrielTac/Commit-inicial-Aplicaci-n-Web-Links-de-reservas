"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ClassBooking } from "./components/Class/ClassBooking"
import { ModalHeader } from "./components/ModalHeader"
import { ModalFooter } from "./components/ModalFooter"
import { useBookingState } from "@/hooks/useBookingState"
import type { BookingStep } from "./types"

interface NewBookingModalProps {
  isOpen: boolean
  onClose: () => void
  initialBookingType?: 'class'
  disableTypeSelection?: boolean
}

export function NewBookingModal({ 
  isOpen, 
  onClose,
  initialBookingType = 'class',
  disableTypeSelection = true
}: NewBookingModalProps) {
  const [mounted, setMounted] = useState(false)
  
  // Inicializar el estado de reserva con configuración memoizada
  const bookingState = useBookingState({
    initialBookingType: 'class',
    initialStep: 'class-details',
    disableTypeSelection: true
  })

  const {
    currentStep,
    selectedBookingType,
    selectedDate,
    selectedCourts,
    timeSelection,
    classDetails,
    classPaymentConfig,
    isStepValid,
    updateState,
    resetState,
    handleContinue,
    handleBack
  } = bookingState

  // Manejar montaje/desmontaje
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Manejar reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      resetState()
    }
  }, [isOpen, resetState])

  // Manejar cambios en classDetails de forma optimizada
  const handleClassDetailsChange = useCallback((details: typeof classDetails) => {
    updateState({ classDetails: details })
  }, [updateState])

  // Manejar cambios en la configuración de pago de forma optimizada
  const handlePaymentConfigChange = useCallback((config: Partial<typeof classPaymentConfig>) => {
    updateState({
      classPaymentConfig: { ...classPaymentConfig, ...config }
    })
  }, [updateState, classPaymentConfig])

  // Manejar cambios en la configuración del horario de forma optimizada
  const handleScheduleConfigChange = useCallback((config: typeof bookingState.scheduleConfig) => {
    updateState({ scheduleConfig: config })
  }, [updateState])

  if (!mounted) return null

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
                selectedBookingType={selectedBookingType}
              />

              <div className="flex-1 overflow-y-auto">
                <ClassBooking
                  currentStep={currentStep}
                  selectedDate={selectedDate}
                  selectedCourts={selectedCourts}
                  timeSelection={timeSelection}
                  classDetails={classDetails}
                  scheduleConfig={bookingState.scheduleConfig}
                  paymentConfig={classPaymentConfig}
                  onDateSelect={(date) => updateState({ selectedDate: date })}
                  onCourtSelect={(courts) => updateState({ selectedCourts: courts })}
                  onTimeSelect={(time) => updateState({ timeSelection: time })}
                  onClassDetailsChange={handleClassDetailsChange}
                  onScheduleConfigChange={handleScheduleConfigChange}
                  onPaymentConfigChange={handlePaymentConfigChange}
                  onValidationChange={(isValid) => {
                    updateState({ isStepValid: isValid })
                  }}
                />
              </div>

              <ModalFooter
                currentStep={currentStep}
                onBack={handleBack}
                onContinue={handleContinue}
                isValid={isStepValid}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
} 