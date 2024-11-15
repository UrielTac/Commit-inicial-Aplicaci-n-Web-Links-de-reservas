"use client"

import { useState, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { PAYMENT_OPTIONS } from "./config/constants"
import { mockClassData } from "./config/mock-data"
import { PaymentStep } from "./components/PaymentStep"
import { SessionStep } from "./components/SessionStep"
import { InfoStep } from "./components/InfoStep"
import type { Step, PaymentMethod, ClassSession } from "./types"

interface ClassRegistrationFormProps {
  classId: string
}

// Tipos
type Step = 'info' | 'classes' | 'payment'

const PRICE_PER_SESSION = 5000

export function ClassRegistrationForm({ classId }: ClassRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info')
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [sessions, setSessions] = useState<ClassSession[]>(() => {
    return Array.from({ length: mockClassData.details.totalSessions }, (_, index) => ({
      date: new Date(2024, 3, 15 + (index * 7)),
      selected: index === 0
    }))
  })

  const totalSelectedSessions = sessions.filter(s => s.selected).length
  const totalAmount = totalSelectedSessions * PRICE_PER_SESSION

  const handleSessionToggle = useCallback((index: number) => {
    setSessions(prev => prev.map((session, i) => ({
      ...session,
      selected: i === index ? !session.selected : false
    })))
  }, [])

  const handleStepChange = useCallback((step: Step) => {
    setCurrentStep(step)
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center">
      <AnimatePresence mode="wait">
        {currentStep === 'info' && (
          <InfoStep
            classData={mockClassData}
            onNext={() => handleStepChange('classes')}
          />
        )}
        {currentStep === 'classes' && (
          <SessionStep
            sessions={sessions}
            onToggle={handleSessionToggle}
            onPrevious={() => handleStepChange('info')}
            onNext={() => handleStepChange('payment')}
            pricePerSession={PRICE_PER_SESSION}
          />
        )}
        {currentStep === 'payment' && (
          <PaymentStep
            options={PAYMENT_OPTIONS}
            selected={selectedPayment}
            onSelect={setSelectedPayment}
            onPrevious={() => handleStepChange('classes')}
            onNext={() => console.log('Finalizar inscripción')}
            totalAmount={totalAmount}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 