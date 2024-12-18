import { useState, useCallback } from 'react'
import { type BookingType } from '@/types/bookings'

interface BookingState {
  currentStep: 'booking-type' | 'date' | 'class-details' | 'class-schedule' | 'class-availability'
  selectedBookingType: BookingType | null
  selectedDate: Date | null
  selectedCourts: string[]
  timeSelection: {
    startTime: string
    endTime: string
  } | null
  classPaymentConfig: {
    price: number
    deposit: number
    paymentMethods: ('cash' | 'card' | 'transfer')[]
  }
}

const initialState: BookingState = {
  currentStep: 'booking-type',
  selectedBookingType: null,
  selectedDate: null,
  selectedCourts: [],
  timeSelection: null,
  classPaymentConfig: {
    price: 0,
    deposit: 0,
    paymentMethods: ['cash']
  }
}

export function useBookingState() {
  const [state, setState] = useState<BookingState>(initialState)

  const resetState = useCallback(() => {
    setState(initialState)
  }, [])

  const setSelectedBookingType = useCallback((type: BookingType | null) => {
    setState(prev => ({ ...prev, selectedBookingType: type }))
  }, [])

  const setSelectedDate = useCallback((date: Date | null) => {
    setState(prev => ({ ...prev, selectedDate: date }))
  }, [])

  const setSelectedCourts = useCallback((courts: string[]) => {
    setState(prev => ({ ...prev, selectedCourts: courts }))
  }, [])

  const setTimeSelection = useCallback((time: { startTime: string; endTime: string } | null) => {
    setState(prev => ({ ...prev, timeSelection: time }))
  }, [])

  const setClassPaymentConfig = useCallback((config: Partial<BookingState['classPaymentConfig']>) => {
    setState(prev => {
      const newConfig = { ...prev.classPaymentConfig, ...config }
      if (config.price !== undefined) {
        newConfig.deposit = newConfig.price
      }
      return {
        ...prev,
        classPaymentConfig: newConfig
      }
    })
  }, [])

  const handleContinue = useCallback(() => {
    setState(prev => {
      const nextStep = getNextStep(prev.currentStep, prev.selectedBookingType)
      return { ...prev, currentStep: nextStep }
    })
  }, [])

  const handleBack = useCallback(() => {
    setState(prev => {
      const prevStep = getPreviousStep(prev.currentStep, prev.selectedBookingType)
      return { ...prev, currentStep: prevStep }
    })
  }, [])

  return {
    ...state,
    resetState,
    setSelectedBookingType,
    setSelectedDate,
    setSelectedCourts,
    setTimeSelection,
    setClassPaymentConfig,
    handleContinue,
    handleBack
  }
}

function getNextStep(currentStep: BookingState['currentStep'], bookingType: BookingType | null): BookingState['currentStep'] {
  switch (currentStep) {
    case 'booking-type':
      return bookingType === 'class' ? 'class-details' : 'date'
    case 'class-details':
      return 'class-schedule'
    case 'class-schedule':
      return 'class-availability'
    default:
      return currentStep
  }
}

function getPreviousStep(currentStep: BookingState['currentStep'], bookingType: BookingType | null): BookingState['currentStep'] {
  switch (currentStep) {
    case 'class-availability':
      return 'class-schedule'
    case 'class-schedule':
      return 'class-details'
    case 'class-details':
      return 'booking-type'
    default:
      return 'booking-type'
  }
} 