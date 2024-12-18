"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { 
  IconPlus, 
  IconPencil, 
  IconClock, 
  IconX, 
  IconUsers, 
  IconInfoCircle, 
  IconSearch,
  IconSettings,
  IconBulb,
  IconCreditCard,
  IconCheck,
  IconReceipt2,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { format, addMinutes, parse } from "date-fns"
import { es } from "date-fns/locale"
import { v4 as uuidv4 } from 'uuid'
import { ClassDescriptionModal } from "./ClassDescriptionModal"
import { ConfirmationModal } from "./ConfirmationModal"
import { ConfigurationMenu } from "./ConfigurationMenu"
import { NewBookingModal } from "./NewBookingModal/NewBookingModal"
import { SimpleShiftBookingModal } from "./NewBookingModal/SimpleShiftBookingModal"
import { DateSelector } from "./DateSelector"
import { useBusinessHours } from "@/hooks/useBusinessHours"
import { useBranches } from '@/hooks/useBranches'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  GuestForm, 
  ConfirmedBooking, 
  PaymentDetails, 
  RentalSelection,
  ExistingBooking,
  SelectedBooking
} from '@/types/bookings'
import { useCourts } from "@/hooks/useCourts"
import { TableNavigationButtons } from "./TableNavigationButtons"
import { bookingService } from '@/services/bookingService'
import { toast } from 'sonner'
import { ViewBookingModal } from "./ViewBookingModal"
import { BookingBlock } from "./BookingBlock"

interface Booking {
  id?: string
  courtId: string
  startTime: string
  endTime: string
  date: string
  title?: string
  description?: string
  price?: number
  paymentStatus?: 'pending' | 'partial' | 'completed'
  participants?: string[]
  type?: 'shift' | 'class'
}

interface TimeSlot {
  hour: string
  subSlots: {
    time: string
    minutes: number
    isAvailable: boolean
  }[]
}

interface Selection {
  selections: {
    courtId: string
    startTime: string
    endTime: string
    slots: number
  }[]
  startCourtId: string
  endCourtId: string
  startTime: string
  endTime: string
  slots: number
}

interface BlockedSlot {
  courtId: string
  startTime: string
  endTime: string
  reason?: string
}

// Actualizar la interfaz Court para que coincida con Supabase
interface Court {
  id: string
  name: string
  branch_id: string
  sport: 'padel' | 'tennis' | 'badminton' | 'pickleball' | 'squash'
  court_type: 'indoor' | 'outdoor' | 'covered'
  surface: string
  is_active: boolean
}

// Constantes globales del componente
const MAX_VISIBLE_COURTS = 4
const TIME_COLUMN_WIDTH = 60
const CELL_HEIGHT = 48
const SUBSLOT_HEIGHT = CELL_HEIGHT / 4
const BORDER_WIDTH = 1

// Constantes para el manejo de tiempo
const TIME_INTERVAL = 15 // 15 minutos
const SLOTS_PER_HOUR = 4 // 4 slots de 15 minutos por hora

// Función mejorada para convertir tiempo a minutos
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours * 60) + minutes
}

// Función para redondear minutos al intervalo más cercano
function roundToNearestInterval(minutes: number): number {
  return Math.floor(minutes / TIME_INTERVAL) * TIME_INTERVAL
}

// Función para convertir minutos a tiempo
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Función para formatear la duración entre dos tiempos
function formatDuration(startTime: string, endTime: string): string {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const durationInMinutes = end - start

  const hours = Math.floor(durationInMinutes / 60)
  const minutes = durationInMinutes % 60

  if (hours === 0) {
    return `${minutes} minutos`
  } else if (minutes === 0) {
    return hours === 1 ? '1 hora' : `${hours} horas`
  } else {
    return `${hours}h ${minutes}min`
  }
}

// Agregar la interfaz ConfirmationModal
interface ConfirmationModal {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

// Agregar el tipo BookingType
type BookingType = 'shift' | 'class'

// Función para formatear el tiempo en formato HH:mm
const formatTime = (time: string) => {
  return time.split(':').slice(0, 2).join(':')
}

// Función para calcular el índice del subslot dentro de una hora
function getSubslotIndex(cellRect: DOMRect, mouseY: number): number {
  const relativeY = mouseY - cellRect.top
  const percentageY = relativeY / cellRect.height
  return Math.floor(percentageY * 4) // 4 subslots por hora
}

// Agregar esta constante para los estilos de las celdas deshabilitadas
const DISABLED_CELL_STYLES = {
  background: "repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 4px, #f9fafb 4px, #f9fafb 8px)",
  opacity: "0.6",
  borderColor: "transparent"
}

interface ExistingBooking {
  id: string
  courtId: string
  startTime: string
  endTime: string
  title?: string
  description?: string
  paymentStatus: 'pending' | 'completed'
}

interface GuestForm {
  id: string
  fullName: string
  dni: string
  email: string
  phone?: string
}

export function BookingsTable() {
  // Estados y hooks principales
  const { currentBranch } = useBranches()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { businessHours, isOpen, timeRanges, isTimeInRange } = useBusinessHours(selectedDate)
  
  // Estados para la selección y arrastre
  const [selection, setSelection] = useState<Selection | null>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const selectionStartRef = useRef<{ courtId: string; startTime: string } | null>(null)
  const [showSimpleShiftModal, setShowSimpleShiftModal] = useState(false)
  const [showNewBookingModal, setShowNewBookingModal] = useState(false)
  
  // Estados para manejo de invitados
  const [guests, setGuests] = useState<GuestForm[]>([])
  const [currentGuest, setCurrentGuest] = useState<GuestForm>({
    id: uuidv4(),
    fullName: '',
    dni: '',
    email: '',
    phone: ''
  })
  const [isGuestBooking, setIsGuestBooking] = useState(true)
  const [memberSearch, setMemberSearch] = useState('')
  const [blockReason, setBlockReason] = useState('')
  
  // Query para obtener las canchas
  const courtsQuery = useCourts({ 
    branchId: currentBranch?.id,
    onlyActive: true
  })

  // Efecto para refrescar los datos cuando cambie la fecha o la sede
  useEffect(() => {
    if (currentBranch?.id) {
      // Invalidar la caché con el formato correcto
      queryClient.invalidateQueries({
        queryKey: ['bookings', selectedDate.toISOString().split('T')[0], currentBranch.id]
      })
    }
  }, [selectedDate, currentBranch?.id, queryClient])

  // Query para obtener las reservas con configuración mejorada
  const {
    data: bookingsResponse,
    isLoading: isLoadingBookings,
    isError: hasBookingsError,
    refetch: refetchBookings
  } = useQuery({
    queryKey: ['bookings', selectedDate.toISOString().split('T')[0], currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) {
        console.log('No hay branch_id seleccionado')
        return []
      }

      console.log('Consultando reservas para:', {
        fecha: selectedDate.toISOString().split('T')[0],
        sede: currentBranch.id
      })

      const response = await bookingService.getBookingsByDate(
        selectedDate.toISOString().split('T')[0],
        currentBranch.id
      )
      
      if (response.error) {
        console.error('Error en la consulta:', response.error)
        throw new Error(response.error.message)
      }
      
      return response.data
    },
    enabled: !!currentBranch?.id,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 segundos antes de considerar los datos obsoletos
    cacheTime: 1000 * 60 * 5, // Mantener en caché por 5 minutos
    retry: 2 // Intentar 2 veces antes de mostrar error
  })

  // Log del estado de la consulta
  useEffect(() => {
    console.log('Estado de la consulta:', {
      isLoading: isLoadingBookings,
      hasError: hasBookingsError,
      hasData: !!bookingsResponse,
      branchId: currentBranch?.id,
      enabled: !!currentBranch?.id
    })
  }, [isLoadingBookings, hasBookingsError, bookingsResponse, currentBranch?.id])

  // Función para manejar la creación exitosa de una reserva
  const handleBookingCreated = useCallback(() => {
    // Refrescar los datos inmediatamente
    refetchBookings()
    
    // Mostrar mensaje de éxito
    toast.success('Reserva creada exitosamente')
  }, [refetchBookings])

  // Transformar las reservas al formato que necesitamos
  const existingBookings = useMemo(() => {
    if (!bookingsResponse) {
      console.log('No hay respuesta de reservas')
      return []
    }
    
    console.log('Transformando reservas:', bookingsResponse)
    
    return bookingsResponse.map(booking => {
      console.log('Procesando reserva:', booking)
      
      return {
        id: booking.id,
        courtId: booking.courtId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        title: booking.title,
        description: booking.description,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        depositAmount: booking.depositAmount,
        participants: booking.participants,
        price: booking.price,
        totalAmount: booking.totalAmount
      }
    })
  }, [bookingsResponse])

  // Función para verificar si una celda tiene una reserva existente
  const getExistingBooking = useCallback((courtId: string, time: string): ExistingBooking | null => {
    const booking = existingBookings.find(booking => 
      booking.courtId === courtId &&
      timeToMinutes(time) >= timeToMinutes(booking.startTime) &&
      timeToMinutes(time) < timeToMinutes(booking.endTime)
    )

    if (booking) {
      console.log('Reserva encontrada:', booking)
    }

    return booking || null
  }, [existingBookings])

  // Extraer los datos de la respuesta
  const bookings = bookingsResponse || []

  // Estados principales
  const [visibleCourtsStart, setVisibleCourtsStart] = useState(0)
  const [tableWidth, setTableWidth] = useState(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    onCancel: () => {}
  })
  const [selectedBooking, setSelectedBooking] = useState<SelectedBooking | null>(null)
  const [configMenuOpen, setConfigMenuOpen] = useState(false)
  const [configButtonPosition, setConfigButtonPosition] = useState({ x: 0, y: 0 })
  const configButtonRef = useRef<HTMLButtonElement>(null)
  const [tableConfig, setTableConfig] = useState({
    colors: {
      shift: '#FBD950',
      class: '#60A5FA',
      blocked: '#EF4444',
    }
  })

  // Estados para pagos
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    totalAmount: 0,
    deposit: 0,
    isPaid: false,
    paymentStatus: 'pending'
  })

  // Estados para manejo de errores y reservas
  const [timeError, setTimeError] = useState<string | null>(null)
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBooking[]>([])

  // Estados para clases
  const [classMaxParticipants, setClassMaxParticipants] = useState<number>(10)
  const [isWaitingListClass, setIsWaitingListClass] = useState(false)
  const [classTitle, setClassTitle] = useState('')
  const [classDescription, setClassDescription] = useState('')

  // Estados para turnos
  const [shiftTitle, setShiftTitle] = useState('')
  const [shiftDescription, setShiftDescription] = useState('')

  // Estado para el modal de descripción
  const [descriptionModal, setDescriptionModal] = useState<{
    isOpen: boolean
    title?: string
    description?: string
    type: 'class' | 'shift'
  }>({
    isOpen: false,
    title: undefined,
    description: undefined,
    type: 'class'
  })

  // Constante para el intervalo fijo
  const TIME_INTERVAL = 15

  // Función mejorada para generar slots de tiempo
  const generateTimeSlots = useCallback(() => {
    if (!businessHours?.start || !businessHours?.end) {
      console.log('⚠️ No hay horarios definidos')
      return []
    }

    console.log('📍 Generando slots para horario:', businessHours)
    
    const slots: TimeSlot[] = []
    const [startHour] = businessHours.start.split(':').map(Number)
    const [endHour] = businessHours.end.split(':').map(Number)

    for (let hour = startHour; hour <= endHour; hour++) {
      const hourString = `${hour.toString().padStart(2, '0')}:00`
      const subSlots = []

      for (let minutes = 0; minutes < 60; minutes += TIME_INTERVAL) {
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        subSlots.push({
          time,
          minutes: hour * 60 + minutes,
          isAvailable: isTimeInRange(time)
        })
      }

      if (subSlots.length > 0) {
        slots.push({
          hour: hourString,
          subSlots
        })
      }
    }

    return slots
  }, [businessHours, isTimeInRange])

  // Estado para los slots de tiempo
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  // Actualizar slots cuando cambien los horarios o la fecha
  useEffect(() => {
    const newSlots = generateTimeSlots()
    if (JSON.stringify(newSlots) !== JSON.stringify(timeSlots)) {
      console.log('🔄 Actualizando slots por cambio significativo')
      setTimeSlots(newSlots)
    }
  }, [generateTimeSlots])

  // Renderizado condicional para sede cerrada
  // if (!isOpen) {
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <p className="text-gray-500">Esta sede está cerrada en el día seleccionado</p>
  //     </div>
  //   )
  // }

  // Función mejorada para redondear al intervalo más cercano
  const roundToNearestInterval = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const interval = TIME_INTERVAL
    
    // Calcular el número de intervalos desde el inicio del día
    const intervalsFromStart = Math.round((totalMinutes - 7 * 60) / interval)
    const roundedMinutes = 7 * 60 + (intervalsFromStart * interval)
    
    // Asegurar que el tiempo est dentro de los límites del día
    const adjustedMinutes = Math.min(Math.max(roundedMinutes, 7 * 60), 23 * 60)
    
    const newHours = Math.floor(adjustedMinutes / 60)
    const newMinutes = adjustedMinutes % 60
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
  }

  // Función para calcular el siguiente intervalo de tiempo
  const getNextIntervalTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + TIME_INTERVAL
    
    const newHours = Math.floor(totalMinutes / 60)
    const newMinutes = totalMinutes % 60
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
  }

  // Función para limpiar bloques
  const handleClearBlocks = () => {
    if (!selection) return

    setBlockedSlots(prev => {
      const newBlockedSlots: BlockedSlot[] = []
      
      prev.forEach(block => {
        // Verificar si el bloque actual se superpone con la selección
        const blockStart = timeToMinutes(block.startTime)
        const blockEnd = timeToMinutes(block.endTime)
        const selectionStart = timeToMinutes(selection.startTime)
        const selectionEnd = timeToMinutes(selection.endTime)

        // Si hay superposición, dividir el bloque según sea necesario
        if (block.courtId === selection.startCourtId &&
            blockEnd > selectionStart && blockStart < selectionEnd) {
          
          // Si queda espacio antes de la selección
          if (blockStart < selectionStart) {
            newBlockedSlots.push({
              ...block,
              endTime: selection.startTime
            })
          }
          
          // Si queda espacio después de la selección
          if (blockEnd > selectionEnd) {
            newBlockedSlots.push({
              ...block,
              startTime: selection.endTime
            })
          }
        } else {
          // Si no hay superposición, mantener el bloque original
          newBlockedSlots.push(block)
        }
      })

      return newBlockedSlots
    })
  }

  const getBookingForSlot = (courtId: string, time: string) => {
    // Primero verificar si hay una reserva confirmada
    const confirmedBooking = confirmedBookings.find(booking => 
      booking.courtId === courtId && 
      timeToMinutes(time) >= timeToMinutes(booking.startTime) &&
      timeToMinutes(time) < timeToMinutes(booking.endTime)
    )

    if (confirmedBooking) {
      // Buscar cualquier tipo de reserva o bloqueo adyacente
      const hasAdjacentTop = [...confirmedBookings, ...blockedSlots].some(item => 
        item.courtId === courtId &&
        item !== confirmedBooking &&
        timeToMinutes(item.endTime) === timeToMinutes(confirmedBooking.startTime)
      )

      const hasAdjacentBottom = [...confirmedBookings, ...blockedSlots].some(item => 
        item.courtId === courtId &&
        item !== confirmedBooking &&
        timeToMinutes(item.startTime) === timeToMinutes(confirmedBooking.endTime)
      )

      return {
        type: 'confirmed' as const,
        bookingType: confirmedBooking.type,
        startTime: confirmedBooking.startTime,
        endTime: confirmedBooking.endTime,
        isStart: time === confirmedBooking.startTime,
        title: confirmedBooking.title,
        description: confirmedBooking.description,
        hasAdjacentTop,
        hasAdjacentBottom,
        booking: confirmedBooking // Agregar la reserva completa aquí
      }
    }

    // Luego verificar bloqueos
    const blockedSlot = blockedSlots.find(block => 
      block.courtId === courtId && 
      timeToMinutes(time) >= timeToMinutes(block.startTime) &&
      timeToMinutes(time) < timeToMinutes(block.endTime)
    )

    if (blockedSlot) {
      // Buscar cualquier tipo de reserva o bloqueo adyacente
      const hasAdjacentTop = [...confirmedBookings, ...blockedSlots].some(item => 
        item.courtId === courtId &&
        item !== blockedSlot &&
        timeToMinutes(item.endTime) === timeToMinutes(blockedSlot.startTime)
      )

      const hasAdjacentBottom = [...confirmedBookings, ...blockedSlots].some(item => 
        item.courtId === courtId &&
        item !== blockedSlot &&
        timeToMinutes(item.startTime) === timeToMinutes(blockedSlot.endTime)
      )

      return {
        type: 'blocked' as const,
        reason: blockedSlot.reason,
        startTime: blockedSlot.startTime,
        endTime: blockedSlot.endTime,
        isStart: time === blockedSlot.startTime,
        hasAdjacentTop,
        hasAdjacentBottom
      }
    }

    return null
  }

  const minutesToTime = (minutes: number): string => {
    if (isNaN(minutes)) return '00:00'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Función helper para obtener el porcentaje de posición dentro de una celda
  const getPositionInCell = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const cellStart = Math.floor(totalMinutes / TIME_INTERVAL) * TIME_INTERVAL
    return ((totalMinutes - cellStart) / TIME_INTERVAL) * 100
  }

  // Función helper para determinar si un tiempo está dentro de una celda
  const isTimeInCell = (cellTime: string, time: string): boolean => {
    const cellMinutes = timeToMinutes(cellTime)
    const timeMinutes = timeToMinutes(time)
    return timeMinutes >= cellMinutes && timeMinutes < cellMinutes + TIME_INTERVAL
  }

  // Función para calcular el índice del slot basado en la posición del mouse
  const getSlotIndexFromMousePosition = (rect: DOMRect, clientY: number): number => {
    const relativeY = clientY - rect.top
    const slotHeight = rect.height / 4
    return Math.floor(relativeY / slotHeight)
  }

  // Función para calcular el tiempo exacto de un slot
  const getSlotTime = (baseHour: string, slotIndex: number): string => {
    const baseMinutes = timeToMinutes(baseHour)
    const slotMinutes = baseMinutes + (slotIndex * 15)
    return minutesToTime(slotMinutes)
  }

  // Función mejorada para verificar si un slot está seleccionado
  const isSlotSelected = useCallback((courtId: string, hour: string, slotIndex: number): boolean => {
    if (!selection) return false

    return selection.selections.some(sel => {
      if (sel.courtId !== courtId) return false

      const slotStartMinutes = timeToMinutes(hour) + (slotIndex * 15)
      const slotEndMinutes = slotStartMinutes + 15
      const selStartMinutes = timeToMinutes(sel.startTime)
      const selEndMinutes = timeToMinutes(sel.endTime)

      return slotStartMinutes >= selStartMinutes && slotStartMinutes < selEndMinutes
    })
  }, [selection])

  // Función para manejar el inicio de la selección
  const handleCellMouseDown = (courtId: string, hour: string, slotIndex: number, event: React.MouseEvent) => {
    event.preventDefault()
    
    resetFormStates()
    setIsMouseDown(true)
    setIsDragging(true)

    const startMinutes = timeToMinutes(hour) + (slotIndex * 15)
    const endMinutes = startMinutes + 15

    const initialSelection: Selection = {
      selections: [{
        courtId,
        startTime: minutesToTime(startMinutes),
        endTime: minutesToTime(endMinutes),
        slots: 1
      }],
      startCourtId: courtId,
      endCourtId: courtId,
      startTime: minutesToTime(startMinutes),
      endTime: minutesToTime(endMinutes),
      slots: 1
    }
    
    setSelection(initialSelection)
    selectionStartRef.current = { courtId, startTime: minutesToTime(startMinutes) }
  }

  // Función mejorada para manejar el movimiento durante la selección
  const handleCellMouseMove = (courtId: string, hour: string, slotIndex: number, event: React.MouseEvent) => {
    if (!isMouseDown || !isDragging || !selectionStartRef.current) return

    const startTime = selectionStartRef.current.startTime
    const currentTime = getSlotTime(hour, slotIndex)
    
    const startCourtIndex = visibleCourts.findIndex(c => c.id === selectionStartRef.current?.courtId)
    const currentCourtIndex = visibleCourts.findIndex(c => c.id === courtId)
    
    const [minCourtIndex, maxCourtIndex] = [
      Math.min(startCourtIndex, currentCourtIndex),
      Math.max(startCourtIndex, currentCourtIndex)
    ]

    const startMinutes = timeToMinutes(startTime)
    const currentMinutes = timeToMinutes(currentTime)
    
    const [minTime, maxTime] = [
      Math.min(startMinutes, currentMinutes),
      Math.max(startMinutes, currentMinutes) + 15
    ]

    const selectedCourts = visibleCourts.slice(minCourtIndex, maxCourtIndex + 1)
    
    const tempSelection: Selection = {
      selections: selectedCourts.map(court => ({
        courtId: court.id,
        startTime: minutesToTime(minTime),
        endTime: minutesToTime(maxTime),
        slots: Math.ceil((maxTime - minTime) / 15)
      })),
      startCourtId: selectionStartRef.current.courtId,
      endCourtId: courtId,
      startTime: minutesToTime(minTime),
      endTime: minutesToTime(maxTime),
      slots: Math.ceil((maxTime - minTime) / 15)
    }

    setSelection(tempSelection)
  }

  const handleMouseUp = (event: MouseEvent) => {
    if (isMouseDown && selection && tableContainerRef.current) {
      // Abrir el modal de reserva simple
      setShowSimpleShiftModal(true)
    }
    
    setIsMouseDown(false)
    setIsDragging(false)
  }

  const handleGlobalMouseMove = useCallback((event: MouseEvent) => {
    if (isMouseDown) {
      setIsDragging(true)
    }
  }, [isMouseDown])

  // Efecto para manejar eventos globales
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseleave', handleMouseUp)
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [isMouseDown, selection, handleGlobalMouseMove])

  // Agregar función para reiniciar estados del formulario
  const resetFormStates = () => {
    setIsGuestBooking(true)
    setGuests([])
    setCurrentGuest({
      id: uuidv4(),
      fullName: '',
      dni: '',
      email: ''
    })
    setMemberSearch('')
    setBlockReason('')
    setShiftTitle('')
    setShiftDescription('')
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (isMouseDown) {
      setIsDragging(true)
    }
  }

  // Actualizar handleMouseEnter para usar el intervalo configurado
  const handleMouseEnter = (courtId: string, time: string) => {
    if (!isMouseDown || !isDragging || !selectionStartRef.current) return
    
    try {
      const startTime = selectionStartRef.current.startTime
      const startMinutes = timeToMinutes(startTime)
      const currentMinutes = timeToMinutes(time)
      
      const startCourtIndex = visibleCourts.findIndex(court => court.id === selectionStartRef.current?.courtId)
      const currentCourtIndex = visibleCourts.findIndex(court => court.id === courtId)
      const [minCourtIndex, maxCourtIndex] = [
        Math.min(startCourtIndex, currentCourtIndex),
        Math.max(startCourtIndex, currentCourtIndex)
      ]

      // Calcular la duración considerando el límite de las 23:00
      const timeDiff = Math.abs(currentMinutes - startMinutes)
      const intervals = Math.ceil(timeDiff / TIME_INTERVAL)
      const adjustedDuration = intervals * TIME_INTERVAL

      // Determinar el tiempo de inicio y fin
      let [minTime, maxTime] = [
        Math.min(startMinutes, currentMinutes),
        Math.min(startMinutes, currentMinutes) + adjustedDuration
      ]

      // Ajustar si se excede el límite de las 23:00
      if (maxTime > timeToMinutes("23:00")) {
        maxTime = timeToMinutes("23:00")
      }

      const tempSelection = {
        selections: visibleCourts
          .slice(minCourtIndex, maxCourtIndex + 1)
          .map(court => ({
            courtId: court.id,
            startTime: minutesToTime(minTime),
            endTime: minutesToTime(maxTime),
            slots: Math.ceil((maxTime - minTime) / TIME_INTERVAL)
          })),
        startCourtId: selectionStartRef.current.courtId,
        endCourtId: courtId,
        startTime: minutesToTime(minTime),
        endTime: minutesToTime(maxTime),
        slots: Math.ceil((maxTime - minTime) / TIME_INTERVAL)
      }

      setSelection(tempSelection)
    } catch (error) {
      console.error('Error handling mouse enter:', error)
    }
  }

  // Manejar el caso cuando el mouse sale del navegador
  const handleMouseLeave = () => {
    if (isMouseDown) {
      setIsMouseDown(false)
      setIsDragging(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isMouseDown, selection])

  // Agregar función para verificar si hay bloques en la selección actual
  const hasBlockedSlots = (selection: Selection): boolean => {
    return selection.selections.some(sel => {
      const selectionStart = timeToMinutes(sel.startTime)
      const selectionEnd = timeToMinutes(sel.endTime)
      
      return blockedSlots.some(block => 
        block.courtId === sel.courtId &&
        timeToMinutes(block.endTime) > selectionStart &&
        timeToMinutes(block.startTime) < selectionEnd
      )
    })
  }

  // Función para manejar la selección del tipo de reserva
  const handleBookingTypeSelect = (type: BookingType) => {
    // Aquí implementaremos la lógica específica para cada tipo de reserva
    console.log(`Reserva de tipo: ${type}`)
  }

  // Función para formatear la fecha
  const formatBookingDateTime = (date: Date, startTime: string, endTime: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
    
    const dateStr = date.toLocaleDateString('es-ES', options)
    const timeStr = `${startTime} - ${endTime}`
    
    return `${dateStr}, ${timeStr}`
  }

  // Modificar la función para aceptar un guest opcional
  const handleAddGuest = (newGuest?: GuestForm) => {
    if (newGuest) {
      // Si recibimos un guest directamente, lo agregamos
      setGuests(prev => {
        // Verificar si el guest ya existe
        const exists = prev.some(g => g.id === newGuest.id)
        if (exists) return prev
        
        // Agregar el nuevo guest
        return [...prev, newGuest]
      })
    } else {
      // Caso original para el formulario manual
      if (currentGuest.fullName.trim()) {
        setGuests(prev => {
          const exists = prev.some(g => g.id === currentGuest.id)
          if (exists) return prev
          return [...prev, currentGuest]
        })

        // Resetear el guest actual
        setCurrentGuest({
          id: uuidv4(),
          fullName: '',
          dni: '',
          email: '',
          phone: ''
        })
      }
    }
  }

  // Función para remover un invitado
  const handleRemoveGuest = (id: string) => {
    setGuests(prev => prev.filter(guest => guest.id !== id))
  }

  // Función para formatear las canchas seleccionadas
  const formatSelectedCourts = (selection: Selection, visibleCourts: Court[]): string => {
    if (!selection || !selection.selections.length) return ''
    
    const courtNames = selection.selections.map(s => {
      const court = visibleCourts.find(c => c.id === s.courtId)
      return court?.name || s.courtId
    })
    
    const uniqueCourtNames = [...new Set(courtNames)]
    
    return uniqueCourtNames.length === 1 
      ? `Cancha ${uniqueCourtNames[0]}`
      : `Canchas ${uniqueCourtNames.join(', ')}`
  }

  // También deberíamos aplicar la misma lógica a handleConfirmClass
  const handleConfirmClass = () => {
    if (!selection) return

    // Verificar superposición con reservas existentes
    const overlappingBookings = confirmedBookings.filter(booking => 
      selection.selections.some(sel => 
        sel.courtId === booking.courtId &&
        timeToMinutes(sel.startTime) < timeToMinutes(booking.endTime) &&
        timeToMinutes(sel.endTime) > timeToMinutes(booking.startTime)
      )
    )

    if (overlappingBookings.length > 0) {
      setConfirmationModal({
        isOpen: true,
        title: "Modificar reserva existente?",
        description: `Esta selección modificará ${overlappingBookings.length > 1 ? 'reservas existentes' : 'una reserva existente'}. ¿Deseas continuar?`,
        onConfirm: () => {
          // Eliminar las partes superpuestas de las reservas existentes
          setConfirmedBookings(prev => {
            const updatedBookings = prev.map(booking => {
              const overlappingSelection = selection.selections.find(sel =>
                sel.courtId === booking.courtId &&
                timeToMinutes(sel.startTime) < timeToMinutes(booking.endTime) &&
                timeToMinutes(sel.endTime) > timeToMinutes(booking.startTime)
              )

              if (!overlappingSelection) return booking

              if (timeToMinutes(overlappingSelection.startTime) <= timeToMinutes(booking.startTime)) {
                return {
                  ...booking,
                  startTime: overlappingSelection.endTime
                }
              } else {
                return {
                  ...booking,
                  endTime: overlappingSelection.startTime
                }
              }
            }).filter(booking => 
              timeToMinutes(booking.endTime) > timeToMinutes(booking.startTime)
            );

            return updatedBookings;
          });

          // Crear la nueva clase
          const newClassBookings = selection.selections.map(sel => ({
            courtId: sel.courtId,
            startTime: sel.startTime,
            endTime: sel.endTime,
            guests: [...guests],
            type: 'class' as const,
            maxParticipants: isWaitingListClass ? classMaxParticipants : undefined,
            isWaitingList: isWaitingListClass,
            title: classTitle.trim() || undefined,
            description: classDescription.trim() || undefined,
            payment: {
              ...paymentDetails,
              timestamp: new Date().toISOString()
            }
          }))

          setConfirmedBookings(prev => [...prev, ...newClassBookings])
          setConfirmationModal(prev => ({ ...prev, isOpen: false }))
        },
        onCancel: () => {
          setConfirmationModal(prev => ({ ...prev, isOpen: false }))
        }
      })
    }
  }

  // Actualizar el manejador del botón de configuración
  const handleConfigButtonClick = () => {
    if (configButtonRef.current) {
      const rect = configButtonRef.current.getBoundingClientRect()
      setConfigButtonPosition({ x: rect.left, y: rect.bottom })
      setConfigMenuOpen(true)
    }
  }

  // Obtener las canchas visibles y el total
  const allCourts = courtsQuery.data || []
  const visibleCourts = allCourts.slice(
    visibleCourtsStart,
    visibleCourtsStart + MAX_VISIBLE_COURTS
  )
  const totalCourts = allCourts.length

  // Función para navegar entre canchas
  const handleCourtNavigation = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setVisibleCourtsStart(prev => Math.max(0, prev - 1))
    } else {
      setVisibleCourtsStart(prev => 
        Math.min(allCourts.length - MAX_VISIBLE_COURTS, prev + 1)
      )
    }
  }

  // Efecto para el ResizeObserver
  useEffect(() => {
    if (!tableContainerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setTableWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(tableContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Agregar el estado para los rentals
  const [selectedRentals, setSelectedRentals] = useState<RentalSelection[]>([])

  // Mostrar mensaje de error si existe
  useEffect(() => {
    if (timeError) {
      console.error(timeError)
      // Aquí podrías mostrar un toast o notificación al usuario
    }
  }, [timeError])

  // Todos los useCallback y useEffect deben ir aquí, antes de cualquier renderizado condicional
  const handleBookingConfirmed = useCallback(async () => {
    try {
      if (!selection || !currentBranch) {
        toast.error('No hay una selección válida para crear la reserva')
        return
      }

      // Validar datos requeridos
      if (!paymentDetails.totalAmount) {
        toast.error('El monto total es requerido')
        return
      }

      // Log para debugging
      console.log('Datos de pago antes de crear reserva:', {
        status: paymentDetails.paymentStatus,
        deposit: paymentDetails.deposit,
        total: paymentDetails.totalAmount
      })

      // Crear la reserva en la base de datos con validaciones
      const bookingData: BookingCreationData = {
        courtId: selection.startCourtId,
        date: selectedDate.toISOString().split('T')[0],
        startTime: selection.startTime,
        endTime: selection.endTime,
        title: shiftTitle || undefined,
        description: shiftDescription || undefined,
        totalPrice: paymentDetails.totalAmount,
        paymentStatus: paymentDetails.paymentStatus,
        paymentMethod: paymentDetails.paymentMethod,
        // Asegurar que el depósito sea correcto
        depositAmount: paymentDetails.paymentStatus === 'completed' 
          ? paymentDetails.totalAmount 
          : paymentDetails.deposit,
        participants: guests.map(guest => ({
          memberId: guest.id,
          role: 'player'
        })),
        rentalItems: selectedRentals.map(rental => ({
          itemId: rental.itemId,
          quantity: rental.quantity,
          pricePerUnit: rental.pricePerUnit || 0
        }))
      }

      // Log para debugging
      console.log('Datos finales de la reserva:', {
        paymentStatus: bookingData.paymentStatus,
        depositAmount: bookingData.depositAmount,
        totalPrice: bookingData.totalPrice
      })

      const response = await bookingService.createBooking(bookingData)

      if (response.error) {
        throw new Error(response.error.message)
      }

      // Log para verificar la respuesta
      console.log('Respuesta de creación de reserva:', response.data)

    } catch (error) {
      console.error('Error al crear la reserva:', error)
      toast.error('Error al crear la reserva')
    }
  }, [selection, paymentDetails, guests, selectedRentals])

  // Agregar manejador para el cierre del modal
  const handleSimpleShiftModalClose = () => {
    setShowSimpleShiftModal(false)
    setSelection(null)
    resetFormStates()
  }

  // Renderizado condicional después de todos los hooks
  if (!currentBranch) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Selecciona una sede para ver las canchas disponibles</p>
      </div>
    )
  }

  if (courtsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Cargando canchas...</p>
      </div>
    )
  }

  if (courtsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error al cargar las canchas</p>
      </div>
    )
  }

  // Función mejorada para calcular el ancho de las columnas de canchas
  const getCourtColumnWidth = () => {
    if (!tableContainerRef.current) return '0px'
    const containerWidth = tableContainerRef.current.clientWidth
    const availableWidth = containerWidth - TIME_COLUMN_WIDTH
    const columnWidth = Math.floor(availableWidth / Math.min(MAX_VISIBLE_COURTS, visibleCourts.length))
    return `${Math.max(columnWidth, 150)}px` // Mínimo 150px por columna
  }

  // Función para manejar la navegación
  const handleTableNavigation = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setVisibleCourtsStart(prev => Math.max(0, prev - 1))
    } else {
      const maxStart = Math.max(0, (allCourts.length - MAX_VISIBLE_COURTS))
      setVisibleCourtsStart(prev => Math.min(maxStart, prev + 1))
    }
  }

  // Agregar loading y error states en el render
  if (isLoadingBookings) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Cargando reservas...</p>
      </div>
    )
  }

  if (hasBookingsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error al cargar las reservas</p>
      </div>
    )
  }

  // Modificar la sección de la tabla para incluir los controles de navegación
  return (
    <div className="w-full">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-xl font-medium">Lista de Reservaciones</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* DateSelector */}
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            className="shadow-none"
          />

          {/* Botón de Configuración */}
          <Button
            ref={configButtonRef}
            variant="outline"
            size="icon"
            className="p-2 bg-white hover:bg-gray-50 rounded-md border border-gray-200"
            onClick={handleConfigButtonClick}
          >
            <IconSettings className="h-5 w-5 text-gray-600" stroke={1.5} />
          </Button>

          {/* Botón de Crear Clase */}
          <Button 
            onClick={() => setShowNewBookingModal(true)}
            variant="outline"
            className="px-4 py-2 bg-white hover:bg-gray-50 rounded-md border border-gray-200"
          >
            Crear Clase
          </Button>
        </div>
      </div>

      {/* Menú de configuración */}
      <ConfigurationMenu
        isOpen={configMenuOpen}
        onClose={() => setConfigMenuOpen(false)}
        position={configButtonPosition}
        currentConfig={tableConfig}
        onConfigChange={setTableConfig}
      />

      <div className="p-4 overflow-x-auto select-none">
        {timeSlots.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay horarios configurados para este día. Se muestra horario por defecto.</p>
          </div>
        ) : (
          <div ref={tableContainerRef} className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse">
              <colgroup>
                <col style={{ width: `${TIME_COLUMN_WIDTH}px`, minWidth: `${TIME_COLUMN_WIDTH}px` }} />
                {visibleCourts.map(court => (
                  <col 
                    key={court.id} 
                    style={{ 
                      width: getCourtColumnWidth(),
                      minWidth: "150px"
                    }} 
                  />
                ))}
              </colgroup>
              
              {/* Encabezado de la tabla */}
              <thead>
                <tr className="bg-gray-50">
                  <th 
                    className={cn(
                      "sticky left-0 z-10 text-left font-semibold text-sm text-gray-900 p-3",
                      // Suavizamos el borde del encabezado
                      "border-b border-r border-gray-200/60 bg-gray-50"
                    )}
                  >
                    Horario
                  </th>
                  {visibleCourts.map((court, index) => (
                    <th 
                      key={court.id}
                      className={cn(
                        "text-center font-semibold text-sm text-gray-900 p-3 border-b border-gray-200",
                        index < visibleCourts.length - 1 && "border-r"
                      )}
                    >
                      {court.name}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Cuerpo de la tabla */}
              <tbody>
                {timeSlots.map((slot, rowIndex) => (
                  <tr key={slot.hour}>
                    <td className="sticky left-0 z-10 text-sm font-medium text-gray-900 p-3 border-r border-gray-200 bg-white">
                      {slot.hour}
                    </td>
                    {visibleCourts.map((court, colIndex) => (
                      <td 
                        key={`${court.id}-${slot.hour}`}
                        className={cn(
                          "p-0 relative",
                          slot.subSlots.some(subSlot => !subSlot.isAvailable) 
                            ? "cursor-not-allowed" 
                            : "cursor-pointer"
                        )}
                        style={{ height: `${CELL_HEIGHT}px` }}
                      >
                        {/* Capa base para los bordes */}
                        <div className="absolute inset-0 pointer-events-none">
                          {colIndex < visibleCourts.length - 1 && (
                            <div className="absolute right-0 inset-y-0 border-r border-gray-200/60" />
                          )}
                          {rowIndex < timeSlots.length - 1 && (
                            <div className="absolute bottom-0 inset-x-0 border-b border-gray-200/60" />
                          )}
                        </div>

                        {/* Contenedor principal con z-index superior */}
                        <div className="absolute inset-0" style={{ zIndex: 1 }}>
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 grid grid-rows-4">
                              {[...Array(4)].map((_, slotIndex) => {
                                const isSlotAvailable = slot.subSlots[slotIndex]?.isAvailable
                                const slotTime = getSlotTime(slot.hour, slotIndex)
                                const existingBooking = getExistingBooking(court.id, slotTime)
                                
                                return (
                                  <div 
                                    key={slotIndex}
                                    className={cn(
                                      "relative",
                                      isSlotAvailable && !existingBooking && "hover:bg-gray-50/50 transition-colors duration-150"
                                    )}
                                    style={!isSlotAvailable ? DISABLED_CELL_STYLES : undefined}
                                    // Restauramos los event handlers para la selección por arrastre
                                    onMouseDown={(e) => {
                                      if (isSlotAvailable && !existingBooking) {
                                        handleCellMouseDown(court.id, slot.hour, slotIndex, e)
                                      }
                                    }}
                                    onMouseMove={(e) => {
                                      if (isSlotAvailable && !existingBooking) {
                                        handleCellMouseMove(court.id, slot.hour, slotIndex, e)
                                      }
                                    }}
                                    onMouseEnter={(e) => {
                                      if (isMouseDown && isDragging && isSlotAvailable && !existingBooking) {
                                        handleCellMouseMove(court.id, slot.hour, slotIndex, e)
                                      }
                                    }}
                                  >
                                    {existingBooking && (
                                      <BookingBlock
                                        startTime={existingBooking.startTime}
                                        endTime={existingBooking.endTime}
                                        currentTime={slotTime}
                                        paymentStatus={existingBooking.paymentStatus}
                                        participants={existingBooking.participants}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedBooking({
                                            id: existingBooking.id,
                                            date: selectedDate.toISOString(),
                                            startTime: existingBooking.startTime,
                                            endTime: existingBooking.endTime,
                                            court: existingBooking.courtId,
                                            price: existingBooking.price || 0,
                                            totalAmount: existingBooking.totalAmount || existingBooking.price || 0,
                                            depositAmount: existingBooking.depositAmount || 0,
                                            paymentMethod: existingBooking.paymentMethod || '',
                                            participants: existingBooking.participants || [],
                                            paymentStatus: existingBooking.paymentStatus || 'pending',
                                            rentedItems: existingBooking.rentedItems || []
                                          })
                                        }}
                                      />
                                    )}

                                    {!isSlotAvailable && (
                                      <div className="absolute inset-0 flex items-center justify-center border-0">
                                        <div className="w-full border-t border-gray-200/10" />
                                      </div>
                                    )}
                                    
                                    {isSlotSelected(court.id, slot.hour, slotIndex) && (
                                      <>
                                        {/* Capa de fondo con opacidad */}
                                        <div className="absolute inset-0 bg-gray-100 opacity-50 transition-all duration-75 z-[1]" />
                                        
                                        {/* Texto en capa superior */}
                                        {selection && 
                                         timeToMinutes(selection.startTime) === timeToMinutes(getSlotTime(slot.hour, slotIndex)) && (
                                          <div className={cn(
                                            "absolute left-1 text-xs font-medium text-gray-900 z-[30]",
                                            // Si es el último intervalo (índice 3), mover el texto hacia arriba
                                            slotIndex === 3 ? "-top-3" : "top-0.5"
                                          )}>
                                            {selection.startTime} - {selection.endTime}
                                            <span className="ml-1">
                                              ({formatDuration(selection.startTime, selection.endTime)})
                                            </span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TableNavigationButtons
        totalItems={allCourts.length}
        visibleItems={MAX_VISIBLE_COURTS}
        currentStart={visibleCourtsStart}
        onNavigate={handleTableNavigation}
        className="border-t border-gray-200 bg-white py-3"
      />

      <NewBookingModal 
        isOpen={showNewBookingModal}
        onClose={() => setShowNewBookingModal(false)}
        initialBookingType="class"
        disableTypeSelection
      />

      <SimpleShiftBookingModal
        isOpen={showSimpleShiftModal}
        onClose={handleSimpleShiftModalClose}
        selection={selection}
      />

      <ViewBookingModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
      />

      {/* En la sección de renderizado condicional */}
      {(!visibleCourts.length) && (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay canchas activas disponibles en esta sede</p>
        </div>
      )}
    </div>
  )
}