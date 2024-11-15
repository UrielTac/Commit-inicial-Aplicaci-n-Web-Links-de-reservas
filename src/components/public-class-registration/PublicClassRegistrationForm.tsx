"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { PAYMENT_OPTIONS } from "./config/constants"
import { ClassSelectionStep } from "./components/ClassSelectionStep"
import { PublicInfoStep } from "./components/PublicInfoStep"
import { SessionStep } from "../class-registration/components/SessionStep"
import { AuthStep } from "../class-registration/components/AuthStep"
import { PaymentStep } from "../class-registration/components/PaymentStep"
import type { PublicClass, PublicRegistrationStep } from "./types"
import type { AuthForm, ClassSession } from "../class-registration/types"
import type { PaymentMethod } from "./config/constants"

interface PublicClassRegistrationFormProps {
  classes: PublicClass[]
}

export function PublicClassRegistrationForm({ classes }: PublicClassRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<PublicRegistrationStep>('class-selection')
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [authForm, setAuthForm] = useState<AuthForm>({ email: '', password: '' })
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)

  const currentClass = selectedClass ? classes.find(c => c.id === selectedClass) : null

  const handleStepChange = (step: PublicRegistrationStep) => {
    if (currentStep === 'payment' && step === 'auth') {
      setCurrentStep('sessions')
      return
    }
    setCurrentStep(step)
  }

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId)
    const selectedClassData = classes.find(c => c.id === classId)
    if (selectedClassData) {
      setSessions(selectedClassData.sessions)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center">
      <AnimatePresence mode="wait">
        {currentStep === 'class-selection' && (
          <ClassSelectionStep
            classes={classes}
            selectedClass={selectedClass}
            onSelect={handleClassSelect}
            onNext={() => handleStepChange('info')}
          />
        )}
        {currentStep === 'info' && currentClass && (
          <PublicInfoStep
            classData={currentClass}
            onNext={() => handleStepChange('sessions')}
            onPrevious={() => handleStepChange('class-selection')}
          />
        )}
        {currentStep === 'sessions' && (
          <SessionStep
            sessions={sessions}
            onToggle={(index) => {
              setSessions(prev => prev.map((s, i) => ({
                ...s,
                selected: i === index ? !s.selected : false
              })))
            }}
            onPrevious={() => handleStepChange('info')}
            onNext={() => handleStepChange('auth')}
            pricePerSession={currentClass?.price || 0}
          />
        )}
        {currentStep === 'auth' && (
          <AuthStep
            isLogin={false}
            authForm={authForm}
            onSubmit={(e) => {
              e.preventDefault()
              handleStepChange('payment')
            }}
            onPrevious={() => handleStepChange('sessions')}
            onToggleMode={() => {}}
            onUpdateForm={(data) => setAuthForm({ ...authForm, ...data })}
          />
        )}
        {currentStep === 'payment' && (
          <PaymentStep
            options={PAYMENT_OPTIONS}
            selected={selectedPayment}
            onSelect={setSelectedPayment}
            onPrevious={() => handleStepChange('sessions')}
            onNext={() => console.log('Finalizar inscripción')}
            totalAmount={(currentClass?.price || 0) * sessions.filter(s => s.selected).length}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 