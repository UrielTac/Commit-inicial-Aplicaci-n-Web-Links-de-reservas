import { motion } from "framer-motion"
import type { BookingStep, BookingType } from "../types"

interface ModalHeaderProps {
  currentStep: BookingStep
  selectedBookingType?: BookingType
}

export function ModalHeader({ currentStep, selectedBookingType }: ModalHeaderProps) {
  const getStepTitle = () => {
    switch (currentStep) {
      case 'booking-type':
        return 'Tipo de Reserva'
      case 'class-details':
        return 'Detalles de la Clase'
      case 'class-availability':
        return 'Disponibilidad'
      case 'sessions':
        return 'Sesiones'
      case 'date':
        return 'Seleccionar Fecha'
      case 'time':
        return 'Seleccionar Horario'
      case 'participants':
        return 'Participantes'
      case 'rentals':
        return 'Alquiler de Artículos'
      case 'payment':
        return 'Método de Pago'
      case 'confirmation':
        return selectedBookingType === 'class' 
          ? 'Clase Creada'
          : 'Reserva Confirmada'
      case 'class-schedule':
        return "Horarios y Capacidad"
      case 'class-payment-methods':
        return 'Métodos de Pago'
      default:
        return ''
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'booking-type':
        return 'Selecciona el tipo de reserva que deseas realizar'
      case 'class-details':
        return 'Ingresa los detalles básicos de la clase'
      case 'class-availability':
        return 'Configura la disponibilidad y capacidad'
      case 'sessions':
        return 'Programa las sesiones de la clase'
      case 'date':
        return 'Elige la fecha para tu reserva'
      case 'time':
        return 'Selecciona el horario disponible'
      case 'participants':
        return 'Agrega los participantes que asistirán a la reserva'
      case 'rentals':
        return 'Selecciona los artículos que deseas alquilar para tu reserva'
      case 'payment':
        return 'Configura el método y estado del pago'
      case 'confirmation':
        return selectedBookingType === 'class'
          ? '¡Tu clase ha sido creada exitosamente!'
          : 'Tu reserva ha sido confirmada'
      case 'class-schedule':
        return "Configura los horarios, capacidad y profesores para cada sesión de la clase"
      case 'class-payment-methods':
        return 'Configura las opciones de pago disponibles para tu clase'
      default:
        return ''
    }
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-6 border-b"
    >
      <motion.h2 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-semibold text-gray-900"
      >
        {getStepTitle()}
      </motion.h2>
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-gray-500 mt-1"
      >
        {getStepDescription()}
      </motion.p>
    </motion.div>
  )
} 