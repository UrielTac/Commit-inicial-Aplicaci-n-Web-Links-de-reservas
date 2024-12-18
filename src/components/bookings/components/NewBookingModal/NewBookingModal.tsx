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
  const [participants, setParticipants] = useState<Participant[]>([])
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
  const [step, setStep] = useState<BookingStep>('shift-info')
  const [bookingData, setBookingData] = useState<Partial<BookingFormData>>({})
  const [isValid, setIsValid] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

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
  } = useBookingState({
    initialBookingType: 'class',
    disableTypeSelection: true,
    initialStep: 'class-details'
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      resetState()
      setSelectedPaymentMethods([])
      setIsInitialized(false)
      setStep('shift-info')
      setBookingData({})
      setIsValid(false)
    }
  }, [isOpen, resetState])

  useEffect(() => {
    if (initialBookingType && !isInitialized) {
      setSelectedBookingType(initialBookingType)
      setIsInitialized(true)
    }
  }, [initialBookingType, setSelectedBookingType, isInitialized])

  useEffect(() => {
    if (participants.length > 0) {
      console.log('NewBookingModal - Participantes actualizados:', participants)
      const participantNames = participants.map(p => p.name)
      setBookingData(prev => {
        const prevParticipants = prev.participants || []
        if (JSON.stringify(prevParticipants) === JSON.stringify(participantNames)) {
          return prev
        }
        return {
          ...prev,
          participants: participantNames
        }
      })
    }
  }, [participants])

  const handleParticipantAdd = (participant: Participant) => {
    console.log('NewBookingModal - Añadiendo participante:', participant)
    setParticipants(prev => {
      const newParticipants = [...prev, participant]
      console.log('NewBookingModal - Lista actualizada de participantes:', newParticipants)
      return newParticipants
    })
  }

  const handleParticipantRemove = (participantId: string) => {
    console.log('NewBookingModal - Removiendo participante:', participantId)
    setParticipants(prev => {
      const newParticipants = prev.filter(p => p.id !== participantId)
      console.log('NewBookingModal - Lista actualizada de participantes:', newParticipants)
      return newParticipants
    })
  }

  const handlePaymentMethodsChange = (methods: ('cash' | 'card' | 'transfer')[]) => {
    setSelectedPaymentMethods(methods)
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