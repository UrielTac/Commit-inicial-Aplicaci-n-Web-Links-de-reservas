import { useState } from "react"
import type { BookingStep, BookingType, TimeSelection, ClassPaymentConfig } from "../types"

interface UseBookingStateConfig {
  initialBookingType?: BookingType
  disableTypeSelection?: boolean
  initialStep?: BookingStep
}

export function useBookingState(config?: UseBookingStateConfig) {
  const [currentStep, setCurrentStep] = useState<BookingStep>(
    config?.initialStep || (config?.initialBookingType === 'class' ? 'class-details' : 'time')
  )
  const [selectedBookingType, setSelectedBookingType] = useState<BookingType | undefined>(
    config?.initialBookingType
  )
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [timeSelection, setTimeSelection] = useState<TimeSelection>()
  const [classPaymentConfig, setClassPaymentConfig] = useState<ClassPaymentConfig>({
    availableMethods: [],
    depositAmount: 0
  })

  const getNextStep = (currentStep: BookingStep): BookingStep => {
    switch (currentStep) {
      case 'booking-type':
        return selectedBookingType === 'class' ? 'class-details' : 'time'
      case 'class-details':
        return 'class-schedule'
      case 'class-schedule':
        return 'class-payment-methods'
      case 'class-payment-methods':
        return 'confirmation'
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
    if (config?.initialBookingType === 'shift' && currentStep === 'participants') {
      return
    }

    switch (currentStep) {
      case 'class-details':
        setCurrentStep(config?.disableTypeSelection ? currentStep : 'booking-type')
        break
      case 'class-schedule':
        setCurrentStep('class-details')
        break
      case 'class-payment-methods':
        setCurrentStep('class-schedule')
        break
      case 'confirmation':
        setCurrentStep(selectedBookingType === 'class' ? 'class-payment-methods' : 'payment')
        break
      case 'time':
        setCurrentStep(config?.disableTypeSelection ? currentStep : 'booking-type')
        break
      case 'participants':
        setCurrentStep('time')
        break
      case 'rentals':
        setCurrentStep('participants')
        break
      case 'payment':
        setCurrentStep('rentals')
        break
      default:
        setCurrentStep(config?.disableTypeSelection ? currentStep : 'booking-type')
    }
  }

  const resetState = () => {
    setCurrentStep(config?.initialStep || (config?.initialBookingType === 'class' ? 'class-details' : 'time'))
    setSelectedBookingType(config?.initialBookingType)
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
