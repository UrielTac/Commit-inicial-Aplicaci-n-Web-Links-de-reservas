import { useState } from "react"
import type { BookingStep, BookingType, TimeSelection, ClassPaymentConfig } from "../types"

export function useBookingState() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('booking-type')
  const [selectedBookingType, setSelectedBookingType] = useState<BookingType>()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [timeSelection, setTimeSelection] = useState<TimeSelection>()
  const [classPaymentConfig, setClassPaymentConfig] = useState<ClassPaymentConfig>({
    availableMethods: [],
    requiresDeposit: false,
    depositAmount: 0
  })

  const getNextStep = (currentStep: BookingStep): BookingStep => {
    switch (currentStep) {
      case 'booking-type':
        return selectedBookingType === 'class' ? 'class-details' : 'date'
      case 'class-details':
        return 'class-schedule'
      case 'class-schedule':
        return 'class-payment-methods'
      case 'class-payment-methods':
        return 'confirmation'
      case 'date':
        return 'time'
      case 'time':
        return 'participants'
      case 'participants':
        return 'rentals'
      case 'rentals':
        return 'payment'
      case 'payment':
        return 'confirmation'
      default:
        return currentStep
    }
  }

  const handleContinue = () => {
    setCurrentStep(getNextStep(currentStep))
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'class-details':
        setCurrentStep('booking-type')
        break
      case 'class-schedule':
        setCurrentStep('class-details')
        break
      case 'class-payment-methods':
        setCurrentStep('class-schedule')
        break
      case 'class-availability':
        setCurrentStep('class-payment-methods')
        break
      case 'confirmation':
        setCurrentStep('class-availability')
        break
      default:
        setCurrentStep('booking-type')
    }
  }

  const resetState = () => {
    setCurrentStep('booking-type')
    setSelectedBookingType(undefined)
    setSelectedDate(undefined)
    setSelectedCourts([])
    setTimeSelection(undefined)
  }

  return {
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
  }
} 
