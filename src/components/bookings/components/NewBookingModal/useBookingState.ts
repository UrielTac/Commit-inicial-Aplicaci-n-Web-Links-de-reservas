import { useState } from 'react'
import type { 
  BookingStep, 
  BookingType,
  ClassDetails,
  ParticipantMode,
  Participant,
  ClassSessionsConfig,
  ShiftDetails,
  ShiftPayment,
  TimeSelection,
  CourtAvailability 
} from './types'

export function useBookingState() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('booking-type')
  const [selectedBookingType, setSelectedBookingType] = useState<BookingType>()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [classDetails, setClassDetails] = useState<ClassDetails>({
    name: '',
    description: ''
  })
  // ... resto del estado

  const handleContinue = () => {
    switch (currentStep) {
      case 'booking-type':
        if (selectedBookingType) {
          setCurrentStep(selectedBookingType === 'shift' ? 'date' : 'class-details')
        }
        break
      case 'class-details':
        if (classDetails.name.trim()) {
          setCurrentStep('class-availability')
        }
        break
      // ... resto de la lógica
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'class-details':
        setCurrentStep('booking-type')
        break
      case 'class-availability':
        setCurrentStep('class-details')
        break
      // ... resto de la lógica
    }
  }

  const isStepValid = (step: BookingStep): boolean => {
    switch (step) {
      case 'booking-type':
        return !!selectedBookingType
      case 'class-details':
        return !!classDetails.name.trim()
      case 'date':
        return !!selectedDate
      case 'time':
        return selectedCourts.length > 0 && !!timeSelection
      // ... resto de validaciones
      default:
        return false
    }
  }

  return {
    // Estado
    currentStep,
    selectedBookingType,
    selectedDate,
    selectedCourts,
    classDetails,
    // ... resto del estado

    // Acciones
    setCurrentStep,
    setSelectedBookingType,
    setSelectedDate,
    setSelectedCourts,
    setClassDetails,
    // ... resto de setters

    // Métodos
    handleContinue,
    handleBack,
    isStepValid,
  }
}