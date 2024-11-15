import React, { useState } from 'react'

// Crear un hook personalizado para la lógica del formulario
export function useClassRegistration(classId: string) {
  const [currentStep, setCurrentStep] = useState<Step>('auth')
  const [authForm, setAuthForm] = useState<AuthForm>(initialAuthForm)
  const [sessions, setSessions] = useState<ClassSession[]>(generateInitialSessions())
  
  // Mover toda la lógica aquí
  const handleNext = () => {/* ... */}
  const handleSelectAll = () => {/* ... */}
  const toggleSession = (index: number) => {/* ... */}
  
  return {
    currentStep,
    authForm,
    sessions,
    handleNext,
    handleSelectAll,
    toggleSession,
    // ... otros valores y métodos
  }
} 