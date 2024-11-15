"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { BookingTypeSelector } from "./components/BookingTypeSelector"
import { SimpleShiftBooking } from "./components/SimpleShift/SimpleShiftBooking"
import { ClassBooking } from "./components/Class/ClassBooking"
import { ModalHeader } from "./components/ModalHeader"
import { ModalFooter } from "./components/ModalFooter"
import { useBookingState } from "./hooks/useBookingState"
import type { Participant } from "./types"

interface NewBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewBookingModal({ isOpen, onClose }: NewBookingModalProps) {
  const [mounted, setMounted] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [rentals, setRentals] = useState([])
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<('cash' | 'card' | 'transfer')[]>([])
  const [isStepValid, setIsStepValid] = useState(false)
  const [classDetails, setClassDetails] = useState<ClassDetails>({ name: '', description: '' })
  const [scheduleConfig, setScheduleConfig] = useState<ClassScheduleConfig>({
    isRecurring: false,
    startDate: undefined,
    endDate: undefined,
    weekDays: [],
    timeSlots: []
  })

  const {
    currentStep,
    selectedBookingType,
    selectedDate,
    selectedCourts,
    timeSelection,
    handleContinue,
    handleBack,
    resetState,
    setSelectedBookingType,
    setSelectedDate,
    setSelectedCourts,
    setTimeSelection,
    classPaymentConfig,
    setClassPaymentConfig,
  } = useBookingState()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      resetState()
      setParticipants([])
      setRentals([])
      setSelectedPaymentMethods([])
    }
  }, [isOpen, resetState])

  const handleParticipantAdd = (participant: Participant) => {
    setParticipants(prev => [...prev, participant])
  }

  const handleParticipantRemove = (participantId: string) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId))
  }

  const handleRentalChange = (newRentals: any[]) => {
    setRentals(newRentals)
  }

  const handlePaymentMethodsChange = (methods: ('cash' | 'card' | 'transfer')[]) => {
    setSelectedPaymentMethods(methods)
  }

  const getNextStep = (currentStep: BookingStep): BookingStep => {
    switch (currentStep) {
      case 'booking-type':
        return selectedBookingType === 'class' ? 'class-details' : 'date'
      case 'class-details':
        return 'class-schedule'
      case 'class-schedule':
        return 'class-availability'
      default:
        return currentStep
    }
  }

  const handleNext = () => {
    const nextStep = getNextStep(currentStep)
    setCurrentStep(nextStep)
    setIsStepValid(false)
  }

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
                {currentStep === 'booking-type' ? (
                  <BookingTypeSelector
                    selectedType={selectedBookingType}
                    onSelect={setSelectedBookingType}
                    onValidationChange={setIsStepValid}
                  />
                ) : selectedBookingType === 'class' ? (
                  <ClassBooking
                    currentStep={currentStep}
                    selectedDate={selectedDate}
                    selectedCourts={selectedCourts}
                    timeSelection={timeSelection}
                    classDetails={classDetails}
                    scheduleConfig={scheduleConfig}
                    paymentConfig={classPaymentConfig}
                    onDateSelect={setSelectedDate}
                    onCourtSelect={setSelectedCourts}
                    onTimeSelect={setTimeSelection}
                    onClassDetailsChange={setClassDetails}
                    onScheduleConfigChange={setScheduleConfig}
                    onPaymentConfigChange={setClassPaymentConfig}
                    onValidationChange={setIsStepValid}
                  />
                ) : (
                  <SimpleShiftBooking
                    currentStep={currentStep}
                    selectedDate={selectedDate}
                    selectedCourts={selectedCourts}
                    timeSelection={timeSelection}
                    participants={participants}
                    rentals={rentals}
                    onDateSelect={setSelectedDate}
                    onCourtSelect={setSelectedCourts}
                    onTimeSelect={setTimeSelection}
                    onParticipantAdd={handleParticipantAdd}
                    onParticipantRemove={handleParticipantRemove}
                    onRentalChange={handleRentalChange}
                    selectedPaymentMethods={selectedPaymentMethods}
                    onPaymentMethodsChange={handlePaymentMethodsChange}
                    onValidationChange={setIsStepValid}
                  />
                )}
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


