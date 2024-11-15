import { useState, useCallback } from 'react'
import { DEFAULT_CLASS_DETAILS, DEFAULT_AVAILABILITY } from '../constants'
import type { 
  ClassBookingState, 
  ClassDetails, 
  ClassAvailability,
  ClassSession,
  ValidationErrors,
  BookingStep 
} from '../types'

export function useClassBookingState(): ClassBookingState {
  const [classDetails, setClassDetails] = useState<ClassDetails>(DEFAULT_CLASS_DETAILS)
  const [availability, setAvailability] = useState<ClassAvailability>(DEFAULT_AVAILABILITY)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const validateClassDetails = useCallback(() => {
    const errors: ValidationErrors = {}
    if (!classDetails.name.trim()) {
      errors.name = 'El nombre es requerido'
    }
    if (!classDetails.description.trim()) {
      errors.description = 'La descripción es requerida'
    }
    if (!classDetails.duration || classDetails.duration < 15) {
      errors.duration = 'La duración debe ser al menos 15 minutos'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [classDetails])

  const validateAvailability = useCallback(() => {
    const errors: ValidationErrors = {}
    if (!availability.selectedCourts.length) {
      errors.courts = 'Selecciona al menos una cancha'
    }
    if (!availability.maxParticipants || availability.maxParticipants < 1) {
      errors.maxParticipants = 'El número de participantes debe ser mayor a 0'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [availability])

  const validateSessions = useCallback(() => {
    const errors: ValidationErrors = {}
    if (sessions.length === 0) {
      errors.sessions = 'Debe agregar al menos una sesión'
    } else if (sessions.some(session => !session.date)) {
      errors.sessions = 'Todas las sesiones deben tener una fecha asignada'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [sessions])

  const validateStep = useCallback((step: BookingStep): boolean => {
    switch (step) {
      case 'class-details':
        return validateClassDetails()
      case 'class-availability':
        return validateAvailability()
      case 'sessions':
        return validateSessions()
      default:
        return true
    }
  }, [validateClassDetails, validateAvailability, validateSessions])

  const handleAddSession = useCallback(() => {
    setSessions(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Clase ${prev.length + 1}`,
        date: null,
      }
    ])
  }, [])

  const handleRemoveSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId))
  }, [])

  const handleUpdateSession = useCallback((
    sessionId: string, 
    updates: Partial<ClassSession>
  ) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates }
        : session
    ))
  }, [])

  const resetState = useCallback(() => {
    setClassDetails(DEFAULT_CLASS_DETAILS)
    setAvailability(DEFAULT_AVAILABILITY)
    setSessions([])
    setValidationErrors({})
  }, [])

  return {
    classDetails,
    availability,
    sessions,
    validationErrors,
    setClassDetails,
    setAvailability,
    addSession: handleAddSession,
    removeSession: handleRemoveSession,
    updateSession: handleUpdateSession,
    validateStep,
    resetState
  }
}