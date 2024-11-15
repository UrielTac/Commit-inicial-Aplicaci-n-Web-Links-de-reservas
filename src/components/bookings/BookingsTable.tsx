"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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

} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { format, addMinutes, parse } from "date-fns"
import { es } from "date-fns/locale"
import { v4 as uuidv4 } from 'uuid'
import { ClassDescriptionModal } from "./ClassDescriptionModal"
import { ConfirmationModal } from "./ConfirmationModal"
import { ConfigurationMenu } from "./ConfigurationMenu"
import { BookingPopup } from "./BookingPopup"
import { NewBookingModal } from "./NewBookingModal"
import { DateSelector } from "./DateSelector"
import { PaymentConfirmationPopup } from "./PaymentConfirmationPopup"
import { OverlapWarningPopup } from "./OverlapWarningPopup"

interface Booking {
  id: string
  courtId: string
  time: string
  clientName: string
  status: 'confirmed' | 'pending' | 'cancelled'
  type: 'single' | 'double' | 'class'
}

interface TimeSlot {
  hour: string
  subSlots: {
    time: string
    minutes: number
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

// Datos de ejemplo para las canchas
const courts = [
  { id: '1', name: 'Cancha Principal' },
  { id: '2', name: 'Cancha 2' },
  { id: '3', name: 'Cancha 3' },
  { id: '4', name: 'Cancha 4' },
]

// Generar horarios de 7:00 AM a 11:00 PM con subslots de 15 minutos
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = []
  for (let hour = 7; hour < 23; hour++) {
    const hourString = `${hour.toString().padStart(2, '0')}:00`
    const subSlots = []
    
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      subSlots.push({
        time,
        minutes: hour * 60 + minutes
      })
    }
    
    slots.push({
      hour: hourString,
      subSlots
    })
  }
  return slots
}

const timeSlots = generateTimeSlots()

// Datos de ejemplo para las reservaciones
const bookings: Booking[] = [
  // Puedes agregar reservaciones de ejemplo aquí
]

// Agregar nuevo tipo para las acciones del popup
type PopupView = 'actions' | 'blocking' | 'clearing' | 'booking-type' | 'shift-info' | 'shift-details' | 'shift-payment' | 'class-info' | 'class-details' | 'class-payment'

// Agregar tipo para los tipos de reserva
type BookingType = 'shift' | 'class'

// Actualizar la interfaz GuestForm para incluir un ID
interface GuestForm {
  id: string
  fullName: string
  dni: string
  email: string
}

// Agregar nuevo tipo para las reservas confirmadas
interface ConfirmedBooking {
  courtId: string
  startTime: string
  endTime: string
  guests: GuestForm[]
  type: 'shift' | 'class'
  maxParticipants?: number
  isWaitingList?: boolean
  title?: string
  description?: string
  payment?: PaymentDetails
}

// Agregar nuevas interfaces para el manejo de pagos
interface PaymentDetails {
  totalAmount: number
  deposit: number
  isPaid: boolean
  paymentMethod?: 'cash' | 'card' | 'transfer'
  paymentStatus: 'pending' | 'partial' | 'completed'
}

// Actualizar la interfaz ClassBooking
interface ClassBooking extends ConfirmedBooking {
  type: 'class'
  maxParticipants?: number
  isWaitingList: boolean
  title?: string
  description?: string
}

// Agregar esta función helper para convertir tiempo a minutos
const timeToMinutes = (time: string): number => {
  if (!time) return 0
  const [hours, minutes] = time.split(':').map(Number)
  return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes)
}

// Agregar esta función helper para calcular la duración
const formatDuration = (startTime: string, endTime: string): string => {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const duration = end - start
  return `${duration} minutos`
}

// Agregar nueva interfaz para el modal de confirmación
interface ConfirmationModal {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

// Agregar la interfaz RentalSelection
interface RentalSelection {
  itemId: string
  quantity: number
}

export function BookingsTable() {
  const [selection, setSelection] = useState<Selection | null>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const selectionStartRef = useRef<{ courtId: string, startTime: string } | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [isBlocking, setIsBlocking] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [showNewBookingModal, setShowNewBookingModal] = useState(false)

  // Simplificar el estado del popup
  const [popupState, setPopupState] = useState<{
    isOpen: boolean
    view: PopupView
    position: { x: number, y: number }
  }>({
    isOpen: false,
    view: 'actions',
    position: { x: 0, y: 0 }
  })

  // Nuevos estados para el formulario
  const [isGuestBooking, setIsGuestBooking] = useState(true)
  const [guests, setGuests] = useState<GuestForm[]>([])
  const [currentGuest, setCurrentGuest] = useState<GuestForm>({
    id: uuidv4(),
    fullName: '',
    dni: '',
    email: ''
  })
  const [memberSearch, setMemberSearch] = useState('')

  // Agregar estado para las reservas confirmadas
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBooking[]>([])

  // Agregar nuevos estados para las clases
  const [classMaxParticipants, setClassMaxParticipants] = useState<number>(10)
  const [isWaitingListClass, setIsWaitingListClass] = useState(false)

  // Agregar nuevos estados para título y descripción de clase
  const [classTitle, setClassTitle] = useState('')
  const [classDescription, setClassDescription] = useState('')

  // Agregar estado para el modal
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

  // Agregar estados para título y descripción de turno
  const [shiftTitle, setShiftTitle] = useState('')
  const [shiftDescription, setShiftDescription] = useState('')

  // Agregar este estado junto a los demás
  const [showNewUserForm, setShowNewUserForm] = useState(false)

  // Agregar este estado junto a los demás
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    onCancel: () => {}
  })

  // Agregar este estado junto a los demás
  const [selectedBooking, setSelectedBooking] = useState<ConfirmedBooking | null>(null)

  // Agregar nuevos estados para la configuración
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

  // Dentro del componente BookingsTable, agregar nuevos estados para el pago
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    totalAmount: 0,
    deposit: 0,
    isPaid: false,
    paymentStatus: 'pending'
  })

  // Constante para el intervalo fijo
  const TIME_INTERVAL = 15

  // Actualizar generateTimeSlots para usar el intervalo fijo
  const generateTimeSlots = useCallback(() => {
    const slots: TimeSlot[] = []
    for (let hour = 7; hour < 23; hour++) {
      const hourString = `${hour.toString().padStart(2, '0')}:00`
      const subSlots = []
      
      for (let minutes = 0; minutes < 60; minutes += TIME_INTERVAL) {
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        subSlots.push({
          time,
          minutes: hour * 60 + minutes
        })
      }
      
      slots.push({
        hour: hourString,
        subSlots
      })
    }
    return slots
  }, [])

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => generateTimeSlots())

  // Actualizar timeSlots cuando cambie el intervalo
  useEffect(() => {
    setTimeSlots(generateTimeSlots())
  }, [generateTimeSlots])

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

    closePopup()
  }

  // Actualizar la función closePopup para reiniciar todos los estados
  const closePopup = () => {
    // Reiniciar estado del popup
    setPopupState({
      isOpen: false,
      view: 'actions',
      position: { x: 0, y: 0 }
    })
    
    // Reiniciar selección
    setSelection(null)
    
    // Reiniciar estados del formulario
    setBlockReason('')
    setIsGuestBooking(true)
    setGuests([])
    setCurrentGuest({
      id: uuidv4(),
      fullName: '',
      dni: '',
      email: ''
    })
    setMemberSearch('')
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

  // Modificar el renderizado de las selecciones para mostrar marcadores precisos
  const renderSelectionMarkers = (courtId: string, time: string) => {
    if (!selection) return null

    const isStart = isTimeInCell(time, selection.startTime)
    const isEnd = isTimeInCell(time, selection.endTime)
    
    if (!isStart && !isEnd) return null

    return (
      <div className="absolute inset-0 pointer-events-none">
        {isStart && (
          <div 
            className="absolute w-1 bg-black h-full"
            style={{ 
              left: `${getPositionInCell(selection.startTime)}%`,
              zIndex: 50 
            }}
          />
        )}
        {isEnd && (
          <div 
            className="absolute w-1 bg-black h-full"
            style={{ 
              left: `${getPositionInCell(selection.endTime)}%`,
              zIndex: 50 
            }}
          />
        )}
      </div>
    )
  }

  // Actualizar handleMouseDown para capturar la posición exacta dentro de la celda
  const handleMouseDown = (courtId: string, time: string, event: React.MouseEvent) => {
    event.preventDefault()
    
    resetFormStates()
    
    setIsMouseDown(true)
    setIsDragging(true)

    // Calcular el tiempo exacto basado en la posición del mouse
    const cellRect = (event.target as HTMLElement).getBoundingClientRect()
    const relativeX = event.clientX - cellRect.left
    const percentageInCell = relativeX / cellRect.width
    
    const [hours, minutes] = time.split(':').map(Number)
    const cellStartMinutes = hours * 60 + minutes
    const exactMinutes = cellStartMinutes + (TIME_INTERVAL * percentageInCell)
    
    // Redondear al intervalo más cercano
    const roundedTime = roundToNearestInterval(minutesToTime(Math.round(exactMinutes)))
    const nextIntervalTime = getNextIntervalTime(roundedTime)
    
    const initialSelection: Selection = {
      selections: [{
        courtId,
        startTime: roundedTime,
        endTime: nextIntervalTime,
        slots: 1
      }],
      startCourtId: courtId,
      endCourtId: courtId,
      startTime: roundedTime,
      endTime: nextIntervalTime,
      slots: 1
    }
    
    setSelection(initialSelection)
    selectionStartRef.current = { courtId, startTime: roundedTime }

    // Calcular la posición del popup
    if (tableContainerRef.current) {
      const tableRect = tableContainerRef.current.getBoundingClientRect()
      const mouseX = event.clientX - tableRect.left
      const mouseY = event.clientY - tableRect.top
      
      // Obtener dimensiones
      const popupWidth = parseInt(getPopupWidth('actions'))
      const popupHeight = 150
      const SPACING = 2 // Espacio consistente

      // Calcular posición base - Siempre a la derecha del click
      let popupX = mouseX + SPACING
      let popupY = mouseY - (popupHeight / 2) // Centrado vertical

      // Ajustar si se sale por la derecha, pero mantener una distancia menor
      if (popupX + popupWidth > tableRect.width - SPACING) {
        // Colocar a la izquierda pero con una distancia menor
        popupX = mouseX - (popupWidth / 2) // Reducir la distancia a la mitad del ancho del popup
      }

      // Asegurar que no se salga de los límites horizontales
      popupX = Math.max(SPACING, Math.min(popupX, tableRect.width - popupWidth - SPACING))

      // Ajustar posición vertical
      popupY = Math.max(SPACING, Math.min(popupY, tableRect.height - popupHeight - SPACING))

      setPopupState({
        isOpen: true,
        view: 'actions',
        position: { 
          x: popupX,
          y: popupY
        }
      })
    }
  }

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
    setPopupState(prev => ({
      ...prev,
      view: 'actions'
    }))
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
      
      const startCourtIndex = courts.findIndex(court => court.id === selectionStartRef.current?.courtId)
      const currentCourtIndex = courts.findIndex(court => court.id === courtId)
      const [minCourtIndex, maxCourtIndex] = [
        Math.min(startCourtIndex, currentCourtIndex),
        Math.max(startCourtIndex, currentCourtIndex)
      ]

      // Calcular la duración basada en el intervalo configurado
      const timeDiff = Math.abs(currentMinutes - startMinutes)
      const intervals = Math.ceil(timeDiff / TIME_INTERVAL)
      const adjustedDuration = intervals * TIME_INTERVAL

      // Determinar el tiempo de inicio y fin
      const [minTime, maxTime] = [
        Math.min(startMinutes, currentMinutes),
        Math.min(startMinutes, currentMinutes) + adjustedDuration
      ]

      const tempSelection = {
        selections: courts
          .slice(minCourtIndex, maxCourtIndex + 1)
          .map(court => ({
            courtId: court.id,
            startTime: minutesToTime(minTime),
            endTime: minutesToTime(maxTime),
            slots: intervals
          })),
        startCourtId: selectionStartRef.current.courtId,
        endCourtId: courtId,
        startTime: minutesToTime(minTime),
        endTime: minutesToTime(maxTime),
        slots: intervals
      }

      setSelection(tempSelection)
    } catch (error) {
      console.error('Error handling mouse enter:', error)
    }
  }

  // Agregar esta función helper para calcular la posición óptima del popup
  const calculatePopupPosition = (
    clickX: number, 
    clickY: number, 
    tableRect: DOMRect,
    view: PopupView
  ): { x: number; y: number } => {
    const popupWidth = parseInt(getPopupWidth(view))
    const padding = 20 // Espacio mínimo desde los bordes
    
    // Calcular posición X inicial
    let x = clickX - tableRect.left + 20

    // Si el popup se sale por la derecha
    if (x + popupWidth > tableRect.width - padding) {
      x = Math.max(padding, tableRect.width - popupWidth - padding)
    }

    // Calcular posición Y inicial
    let y = clickY - tableRect.top - 20

    // Si el popup se sale por abajo (asumiendo una altura máxima de 500px)
    if (y + 500 > tableRect.height - padding) {
      y = Math.max(padding, tableRect.height - 500 - padding)
    }

    return { x, y }
  }

  // Modificar el handleMouseUp
  const handleMouseUp = (event: MouseEvent) => {
    if (isMouseDown && selection && tableRef.current) {
      const rect = tableRef.current.getBoundingClientRect()
      const position = calculatePopupPosition(
        event.clientX,
        event.clientY,
        rect,
        'actions'
      )

      setPopupState({
        isOpen: true,
        view: 'actions',
        position
      })
    }
    
    setIsMouseDown(false)
    setIsDragging(false)
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

  const isSlotSelected = (courtId: string, time: string): boolean => {
    if (!selection || !courtId || !time) return false
    
    try {
      // Verificar si la cancha está en el rango de selección
      const startCourtIndex = courts.findIndex(court => court.id === selection.startCourtId)
      const endCourtIndex = courts.findIndex(court => court.id === selection.endCourtId)
      const currentCourtIndex = courts.findIndex(court => court.id === courtId)
      
      const isCourtInRange = currentCourtIndex >= Math.min(startCourtIndex, endCourtIndex) &&
                            currentCourtIndex <= Math.max(startCourtIndex, endCourtIndex)
      
      if (!isCourtInRange) return false

      const timeMinutes = timeToMinutes(time)
      const startMinutes = timeToMinutes(selection.startTime)
      const endMinutes = timeToMinutes(selection.endTime)
      
      return timeMinutes >= Math.min(startMinutes, endMinutes) && 
             timeMinutes < Math.max(startMinutes, endMinutes)
    } catch (error) {
      console.error('Error checking slot selection:', error)
      return false
    }
  }

  const getSelectionPosition = (courtId: string, time: string) => {
    if (!selection || !isSlotSelected(courtId, time)) return null
    
    const currentMinutes = timeToMinutes(time)
    const startMinutes = timeToMinutes(selection.startTime)
    const endMinutes = timeToMinutes(selection.endTime) - TIME_INTERVAL // Restamos TIME_INTERVAL para obtener el último slot real
    
    if (Math.abs(endMinutes - startMinutes) === 0) {
      return 'single'
    }
    
    if (currentMinutes === Math.min(startMinutes, endMinutes)) return 'first'
    if (currentMinutes === Math.max(startMinutes, endMinutes)) return 'last'
    return 'middle'
  }

  // Actualizar handleBlock para usar el nuevo estado
  const handleBlock = () => {
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
      // Mostrar el popup de advertencia de superposición
      setOverlapWarning({
        isOpen: true,
        position: popupState.position,
        overlappingCount: overlappingBookings.length,
        onConfirm: () => {
          // Ajustar las reservas existentes
          setConfirmedBookings(prev => {
            const adjustedBookings = prev.map(booking => {
              const overlappingSelection = selection.selections.find(sel =>
                sel.courtId === booking.courtId &&
                timeToMinutes(sel.startTime) < timeToMinutes(booking.endTime) &&
                timeToMinutes(sel.endTime) > timeToMinutes(booking.startTime)
              )

              if (!overlappingSelection) return booking

              // Si la nueva reserva empieza después del inicio de la existente
              if (timeToMinutes(overlappingSelection.startTime) > timeToMinutes(booking.startTime)) {
                return {
                  ...booking,
                  endTime: overlappingSelection.startTime
                }
              }
              
              // Si la nueva reserva termina antes del fin de la existente
              if (timeToMinutes(overlappingSelection.endTime) < timeToMinutes(booking.endTime)) {
                return {
                  ...booking,
                  startTime: overlappingSelection.endTime
                }
              }

              // Si la nueva reserva cubre completamente la existente, la eliminamos
              return null
            }).filter(Boolean) as typeof prev

            // Crear los nuevos bloques
            const newBlockedSlots = selection.selections.map(sel => ({
              courtId: sel.courtId,
              startTime: sel.startTime,
              endTime: sel.endTime,
              reason: blockReason.trim() || undefined
            }))

            setBlockedSlots(prev => [...prev, ...newBlockedSlots])
            setOverlapWarning(prev => ({ ...prev, isOpen: false }))
            closePopup()

            return adjustedBookings
          })
        }
      })
    } else {
      // Si no hay superposición, crear el bloqueo directamente
      const newBlockedSlots = selection.selections.map(sel => ({
        courtId: sel.courtId,
        startTime: sel.startTime,
        endTime: sel.endTime,
        reason: blockReason.trim() || undefined
      }))

      setBlockedSlots(prev => [...prev, ...newBlockedSlots])
      closePopup()
    }
  }

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
    closePopup()
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

  // Función para agregar un nuevo invitado
  const handleAddGuest = () => {
    if (currentGuest.fullName.trim() && currentGuest.dni.trim()) {
      setGuests(prev => [...prev, currentGuest])
      setCurrentGuest({
        id: uuidv4(),
        fullName: '',
        dni: '',
        email: ''
      })
    }
  }

  // Función para remover un invitado
  const handleRemoveGuest = (id: string) => {
    setGuests(prev => prev.filter(guest => guest.id !== id))
  }

  // Función mejorada para resetear todos los estados
  const resetAllStates = () => {
    // Resetear estados del popup
    setPopupState({
      isOpen: false,
      view: 'actions',
      position: { x: 0, y: 0 }
    })
    
    // Resetear selección
    setSelection(null)
    
    // Resetear estados de clase
    setClassTitle('')
    setClassDescription('')
    setIsWaitingListClass(false)
    setClassMaxParticipants(10)
    
    // Resetear estados de invitados/usuarios
    setIsGuestBooking(true)
    setGuests([])
    setCurrentGuest({
      id: uuidv4(),
      fullName: '',
      dni: '',
      email: ''
    })
    setMemberSearch('')
    
    // Resetear otros estados
    setBlockReason('')
  }

  // Modificar handlePopupViewChange para recalcular la posición
  const handlePopupViewChange = (view: PopupView) => {
    if (view === 'shift-payment' || view === 'class-payment') {
      // Calcular el precio total basado en la duración y número de canchas
      const durationInMinutes = timeToMinutes(selection?.endTime || '') - timeToMinutes(selection?.startTime || '')
      const numberOfCourts = selection?.selections.length || 1
      const pricePerHour = 5000 // Precio por hora por cancha
      const totalAmount = Math.ceil((durationInMinutes / 60) * pricePerHour * numberOfCourts)
      
      setPaymentDetails(prev => ({
        ...prev,
        totalAmount,
        deposit: Math.ceil(totalAmount * 0.3) // 30% de seña
      }))
    }

    if (tableRef.current) {
      const rect = tableRef.current.getBoundingClientRect()
      const currentPosition = popupState.position
      const newPosition = calculatePopupPosition(
        rect.left + currentPosition.x,
        rect.top + currentPosition.y,
        rect,
        view
      )

      setPopupState(prev => ({
        ...prev,
        view,
        position: newPosition
      }))
    } else {
      setPopupState(prev => ({
        ...prev,
        view
      }))
    }
  }

  // Función para formatear las canchas seleccionadas
  const formatSelectedCourts = (selection: Selection): string => {
    if (!selection) return ''

    const startCourtIndex = courts.findIndex(court => court.id === selection.startCourtId)
    const endCourtIndex = courts.findIndex(court => court.id === selection.endCourtId)
    
    if (startCourtIndex === endCourtIndex) {
      return courts[startCourtIndex].name
    }
    
    const [minIndex, maxIndex] = [
      Math.min(startCourtIndex, endCourtIndex),
      Math.max(startCourtIndex, endCourtIndex)
    ]
    
    if (maxIndex - minIndex === 1) {
      return `${courts[minIndex].name} y ${courts[maxIndex].name}`
    }
    
    return `${courts[minIndex].name} hasta ${courts[maxIndex].name}`
  }

  // Modificar handleConfirmBooking
  const handleConfirmBooking = () => {
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
      // Mostrar el popup de advertencia
      setOverlapWarning({
        isOpen: true,
        position: popupState.position,
        overlappingCount: overlappingBookings.length,
        onConfirm: () => {
          // Proceder con la reserva ajustando las existentes
          const newBookings = selection.selections.map(sel => ({
            courtId: sel.courtId,
            startTime: sel.startTime,
            endTime: sel.endTime,
            guests: [...guests],
            type: 'shift' as const,
            title: shiftTitle.trim() || undefined,
            description: shiftDescription.trim() || undefined,
            payment: {
              ...paymentDetails,
              timestamp: new Date().toISOString()
            }
          }))

          setConfirmedBookings(prev => {
            // Ajustar las reservas existentes en lugar de eliminarlas
            const adjustedBookings = prev.map(booking => {
              const overlappingSelection = selection.selections.find(sel =>
                sel.courtId === booking.courtId &&
                timeToMinutes(sel.startTime) < timeToMinutes(booking.endTime) &&
                timeToMinutes(sel.endTime) > timeToMinutes(booking.startTime)
              )

              if (!overlappingSelection) return booking

              // Si la nueva reserva empieza después del inicio de la existente
              if (timeToMinutes(overlappingSelection.startTime) > timeToMinutes(booking.startTime)) {
                return {
                  ...booking,
                  endTime: overlappingSelection.startTime // Acortar hasta donde empieza la nueva
                }
              }
              
              // Si la nueva reserva termina antes del fin de la existente
              if (timeToMinutes(overlappingSelection.endTime) < timeToMinutes(booking.endTime)) {
                return {
                  ...booking,
                  startTime: overlappingSelection.endTime // Acortar desde donde termina la nueva
                }
              }

              // Si la nueva reserva cubre completamente la existente, la eliminamos
              return null
            }).filter(Boolean) as typeof prev // Filtrar las reservas que quedaron null

            return [...adjustedBookings, ...newBookings]
          })

          setOverlapWarning(prev => ({ ...prev, isOpen: false }))
          closePopup()
        }
      })
    } else {
      // Si no hay superposición, proceder normalmente
      const newBookings = selection.selections.map(sel => ({
        courtId: sel.courtId,
        startTime: sel.startTime,
        endTime: sel.endTime,
        guests: [...guests],
        type: 'shift' as const,
        title: shiftTitle.trim() || undefined,
        description: shiftDescription.trim() || undefined,
        payment: {
          ...paymentDetails,
          timestamp: new Date().toISOString()
        }
      }))

      setConfirmedBookings(prev => [...prev, ...newBookings])
      closePopup()
    }
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
        title: "¿Modificar reserva existente?",
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
          closePopup()
        },
        onCancel: () => {
          setConfirmationModal(prev => ({ ...prev, isOpen: false }))
        }
      })
    } else {
      // Si no hay superposición, crear la clase directamente
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
      closePopup()
    }
  }

  // Agregar esta función junto a las otras funciones helper
  const getPopupWidth = (view: PopupView): string => {
    switch (view) {
      case 'actions':
      case 'booking-type':
        return '280px'
      case 'shift-info':
      case 'shift-details':
      case 'shift-payment':
      case 'class-info':
      case 'class-details':
      case 'blocking':
        return '400px'
      default:
        return '400px'
    }
  }

  // Agregar la función de cancelación
  const handleCancelBooking = (booking: ConfirmedBooking) => {
    setConfirmedBookings(prev => prev.filter(b => 
      b.courtId !== booking.courtId || 
      b.startTime !== booking.startTime || 
      b.endTime !== booking.endTime
    ))
  }

  // Actualizar el manejador del botón de configuración
  const handleConfigButtonClick = () => {
    if (configButtonRef.current) {
      const rect = configButtonRef.current.getBoundingClientRect()
      setConfigButtonPosition({ x: rect.left, y: rect.bottom })
      setConfigMenuOpen(true)
    }
  }

  // Dentro del componente BookingsTable, agregar el estado para la fecha
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Primero, definir algunas constantes para mantener consistencia
  const CELL_HEIGHT = 48; // Altura de cada celda de hora
  const SUBSLOT_HEIGHT = CELL_HEIGHT / 4; // 12px exactos
  const TIME_COLUMN_WIDTH = 96; // Ancho de la columna de tiempo
  const BORDER_WIDTH = 1;
  const TOTAL_COURTS = courts.length;

  const [tableWidth, setTableWidth] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Usar ResizeObserver para actualizar el ancho de la tabla
  useEffect(() => {
    if (!tableContainerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setTableWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(tableContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Función para calcular el ancho exacto de cada columna
  const getCourtWidth = (totalWidth: number): string => {
    if (!totalWidth) return `calc((100% - ${TIME_COLUMN_WIDTH}px) / ${TOTAL_COURTS})`;
    const availableWidth = totalWidth - TIME_COLUMN_WIDTH;
    const courtWidth = Math.floor(availableWidth / TOTAL_COURTS);
    return `${courtWidth}px`;
  };

  // Agregar este useEffect para manejar clicks fuera de la tabla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si hay una selección activa y no se está arrastrando
      if (selection && !isMouseDown) {
        // Verificar si el click fue fuera de la tabla y del popup
        const isClickInTable = tableContainerRef.current?.contains(event.target as Node)
        const isClickInPopup = (event.target as Element)?.closest('.booking-popup')
        
        if (!isClickInTable && !isClickInPopup) {
          // Cerrar el popup y limpiar la selección
          setPopupState(prev => ({
            ...prev,
            isOpen: false
          }))
          setSelection(null)
        }
      }
    }

    // Agregar el event listener
    document.addEventListener('mousedown', handleClickOutside)

    // Limpiar el event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selection, isMouseDown]) // Dependencias del efecto

  // Agregar el estado para los rentals
  const [selectedRentals, setSelectedRentals] = useState<RentalSelection[]>([])

  // Agregar el estado para el popup de advertencia
  const [overlapWarning, setOverlapWarning] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    overlappingCount: number
    onConfirm: () => void
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    overlappingCount: 0,
    onConfirm: () => {}
  })

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

          {/* Botón de Nueva Reservación */}
          <Button 
            onClick={() => setShowNewBookingModal(true)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2 text-sm shadow-sm transition-all duration-200"
          >
            <IconPlus className="h-5 w-5" />
            <span>Nueva Reservación</span>
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
        <div 
          className="relative" 
          ref={tableContainerRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Capa para las líneas divisorias */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {/* Líneas verticales - Ajustar para que empiecen desde el header */}
            <div 
              className="absolute right-0 grid"
              style={{
                left: `${TIME_COLUMN_WIDTH}px`,
                top: 0, // Cambiar para que empiece desde arriba
                bottom: 0,
                width: `calc(100% - ${TIME_COLUMN_WIDTH}px)`,
                gridTemplateColumns: `repeat(${TOTAL_COURTS}, 1fr)`,
              }}
            >
              {courts.map((court) => (
                <div 
                  key={`line-v-${court.id}`} 
                  className="border-l border-gray-200 h-full"
                />
              ))}
            </div>

            {/* Líneas horizontales - Incluir línea superior */}
            <div 
              className="absolute right-0 left-0"
              style={{
                top: 0, // Cambiar para que empiece desde arriba
                display: 'grid',
                gridTemplateRows: `${CELL_HEIGHT}px repeat(${timeSlots.length}, ${CELL_HEIGHT}px)`, // Incluir fila del header
              }}
            >
              {[...Array(timeSlots.length + 1)].map((_, index) => (
                <div 
                  key={`line-h-${index}`}
                  className="border-b border-gray-200"
                />
              ))}
            </div>
          </div>

          {/* Tabla principal */}
          <table className="w-full relative border-separate border-spacing-0">
            <colgroup>
              <col style={{ width: `${TIME_COLUMN_WIDTH}px` }} />
              {courts.map(court => (
                <col 
                  key={`col-${court.id}`} 
                  style={{ width: getCourtWidth(tableWidth) }}
                />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="text-left font-semibold text-base text-gray-900 select-none p-3 h-12">
                  Horario
                </th>
                {courts.map(court => (
                  <th 
                    key={court.id}
                    className="text-center font-semibold text-base text-gray-900 select-none p-3 h-12"
                  >
                    {court.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((hourSlot) => (
                <tr key={hourSlot.hour}>
                  <td className="text-sm font-medium text-gray-900 align-top select-none p-3 h-12">
                    {hourSlot.hour}
                  </td>
                  {courts.map(court => (
                    <td 
                      key={`${court.id}-${hourSlot.hour}`}
                      className="relative p-0 h-12"
                      style={{ width: getCourtWidth(tableWidth) }}
                    >
                      <div 
                        className="absolute inset-0 grid"
                        style={{
                          gridTemplateRows: `repeat(4, ${SUBSLOT_HEIGHT}px)`,
                          width: '100%'
                        }}
                      >
                        {hourSlot.subSlots.map((subSlot) => {
                          const booking = getBookingForSlot(court.id, subSlot.time)
                          const isSelected = isSlotSelected(court.id, subSlot.time)
                          const selectionPosition = getSelectionPosition(court.id, subSlot.time)
                          
                          return (
                            <div
                              key={`${court.id}-${subSlot.time}`}
                              data-blocked-slot={`${court.id}-${subSlot.time}`}
                              className={cn(
                                "relative cursor-pointer transition-colors",
                                booking?.type === 'blocked' ? "cursor-not-allowed" : "",
                                isSelected && "z-[2000]"
                              )}
                              style={{
                                height: SUBSLOT_HEIGHT,
                                position: 'relative',
                                zIndex: isSelected ? 2000 : 'auto',
                                border: 'none'
                              }}
                              onClick={(e) => {
                                // Si hay una reserva confirmada, abrir el modal
                                const bookingInfo = getBookingForSlot(court.id, subSlot.time)
                                if (bookingInfo?.type === 'confirmed') {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  
                                  // Limpiar cualquier selección activa
                                  setSelection(null)
                                  setPopupState(prev => ({
                                    ...prev,
                                    isOpen: false
                                  }))
                                  
                                  // Buscar y mostrar la reserva en el modal
                                  const confirmedBooking = confirmedBookings.find(b => 
                                    b.courtId === court.id && 
                                    b.startTime === bookingInfo.startTime &&
                                    b.endTime === bookingInfo.endTime
                                  )
                                  
                                  if (confirmedBooking) {
                                    setSelectedBooking(confirmedBooking)
                                    setDescriptionModal({
                                      isOpen: true,
                                      title: bookingInfo.title || (bookingInfo.bookingType === 'class' ? 'Clase Reservada' : 'Reservado'),
                                      description: bookingInfo.description || '',
                                      type: bookingInfo.bookingType
                                    })
                                  }
                                }
                              }}
                              onMouseDown={(e) => handleMouseDown(court.id, subSlot.time, e)}
                              onMouseEnter={() => handleMouseEnter(court.id, subSlot.time)}
                            >
                              {isSelected && (
                                <div 
                                  className={cn(
                                    "absolute",
                                    (selectionPosition === 'first' || selectionPosition === 'single') && "rounded-t-xl",
                                    (selectionPosition === 'last' || selectionPosition === 'single') && "rounded-b-xl",
                                  )}
                                  style={{
                                    backgroundColor: tableConfig.colors.shift,
                                    opacity: 0.3,
                                    position: 'absolute',
                                    inset: 0,
                                    pointerEvents: 'none',
                                    zIndex: 2500,
                                    border: 'none',
                                    outline: 'none'
                                  }}
                                />
                              )}
                              {booking?.type === 'blocked' && (
                                <>
                                  {/* Contenedor principal del bloqueo */}
                                  <div 
                                    className="absolute inset-0"
                                    style={{
                                      top: booking.isStart ? '3px' : '0',
                                      bottom: timeToMinutes(booking.endTime) === timeToMinutes(booking.startTime) + TIME_INTERVAL ? '3px' : '0',
                                      zIndex: 80,
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    <div className="absolute inset-0 overflow-visible">
                                      <div 
                                        className={cn(
                                          "absolute inset-0",
                                          booking.isStart && "rounded-tr-md",
                                          timeToMinutes(booking.endTime) === timeToMinutes(booking.startTime) + TIME_INTERVAL && "rounded-br-md"
                                        )}
                                        style={{ 
                                          backgroundColor: `${tableConfig.colors.blocked}20`,
                                          zIndex: 1
                                        }}
                                      />

                                      <div 
                                        className="absolute left-0 top-0 bottom-0 w-[2px]"
                                        style={{ 
                                          backgroundColor: tableConfig.colors.blocked,
                                          zIndex: 2
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Título en un contenedor separado */}
                                  {booking.isStart && (
                                    <div 
                                      className="absolute w-full pointer-events-none"
                                      style={{
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 5000,
                                      }}
                                    >
                                      <div className="relative flex justify-center items-center">
                                        <span 
                                          className="text-sm px-2.5 py-0.5 font-medium bg-white rounded-md text-gray-600 group"
                                          style={{
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            border: '1px solid rgba(0,0,0,0.03)',
                                            lineHeight: '1.2',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            isolation: 'isolate',
                                            position: 'relative',
                                            zIndex: 5000,
                                            whiteSpace: 'nowrap',
                                            pointerEvents: 'auto'
                                          }}
                                        >
                                          {booking.reason || 'Bloqueado'}
                                          <div 
                                            className="absolute left-1/2 -translate-x-1/2 -top-8 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-600 bg-white px-2 py-1 rounded-md whitespace-nowrap"
                                            style={{
                                              zIndex: 5001,
                                              pointerEvents: 'none',
                                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                              border: '1px solid rgba(0,0,0,0.03)'
                                            }}
                                          >
                                            {`${booking.startTime} - ${booking.endTime}`}
                                          </div>
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                              {booking?.type === 'confirmed' && (
                                <>
                                  {/* Contenedor principal de la reserva */}
                                  <div 
                                    className="absolute inset-0"
                                    style={{
                                      top: booking.isStart ? '3px' : '0',
                                      bottom: timeToMinutes(booking.endTime) === timeToMinutes(booking.startTime) + TIME_INTERVAL ? '3px' : '0',
                                      zIndex: 80,
                                    }}
                                  >
                                    <div className="absolute inset-0 overflow-visible">
                                      {/* Fondo y barra lateral */}
                                      <div 
                                        className={cn(
                                          "absolute inset-0",
                                          booking.isStart && "rounded-tr-md",
                                          timeToMinutes(booking.endTime) === timeToMinutes(booking.startTime) + TIME_INTERVAL && "rounded-br-md"
                                        )}
                                        style={{ 
                                          backgroundColor: `${booking.bookingType === 'class' 
                                            ? tableConfig.colors.class 
                                            : tableConfig.colors.shift}20`,
                                          zIndex: 1
                                        }}
                                      />

                                      <div 
                                        className="absolute left-0 top-0 bottom-0 w-[2px]"
                                        style={{ 
                                          backgroundColor: booking.bookingType === 'class' 
                                            ? tableConfig.colors.class
                                            : tableConfig.colors.shift,
                                          zIndex: 2
                                        }}
                                      />

                                      {/* Indicador de estado de pago - Solo en la última celda y último subslot */}
                                      {booking.booking?.payment?.paymentStatus !== 'pending' && 
                                       timeToMinutes(booking.endTime) === timeToMinutes(booking.booking.endTime) &&
                                       timeToMinutes(subSlot.time) === timeToMinutes(booking.endTime) - TIME_INTERVAL && (
                                        <div 
                                          className={cn(
                                            "absolute h-5 px-2 flex items-center justify-center",
                                            "cursor-pointer transition-all duration-200 group",
                                            "hover:opacity-90",
                                            "bg-white border",
                                            booking.booking.payment.paymentStatus === 'completed'
                                              ? "text-emerald-600 border-white"
                                              : "text-amber-600 border-white"
                                          )}
                                          style={{ 
                                            left: '4px',
                                            bottom: '24px',
                                            transform: 'translateY(100%)',
                                            zIndex: 2000,
                                            borderRadius: '0 4px 4px 0',
                                            fontSize: '11px',
                                            letterSpacing: '0.02em',
                                            fontWeight: 500,
                                            pointerEvents: 'all'
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            e.preventDefault()
                                            if (booking.booking.payment.paymentStatus === 'partial') {
                                              const buttonRect = e.currentTarget.getBoundingClientRect()
                                              
                                              // Calcular la posición del popup relativa al botón
                                              setPopupPosition({
                                                x: buttonRect.right + 8, // 8px de separación
                                                y: buttonRect.top
                                              })
                                              
                                              // Abrir el popup de confirmación
                                              setConfirmationModal({
                                                isOpen: true,
                                                title: "Completar Pago",
                                                description: "¿Deseas marcar esta reserva como pagada completamente?",
                                                onConfirm: () => {
                                                  setConfirmedBookings(prev => prev.map(b => 
                                                    b.courtId === booking.booking.courtId && 
                                                    b.startTime === booking.booking.startTime &&
                                                    b.endTime === booking.booking.endTime
                                                      ? {
                                                          ...b,
                                                          payment: {
                                                            ...b.payment!,
                                                            paymentStatus: 'completed',
                                                            deposit: b.payment!.totalAmount
                                                          }
                                                        }
                                                      : b
                                                  ))
                                                  setConfirmationModal(prev => ({ ...prev, isOpen: false }))
                                                },
                                                onCancel: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
                                              })
                                            }
                                          }}
                                          onMouseDown={(e) => {
                                            e.stopPropagation()
                                            e.preventDefault()
                                          }}
                                        >
                                          <span className="whitespace-nowrap">
                                            {booking.booking.payment.paymentStatus === 'completed' 
                                              ? 'Pagado'
                                              : 'Señado'
                                            }
                                          </span>

                                          {/* Tooltip */}
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-gray-100 text-[11px] font-medium text-gray-600 whitespace-nowrap">
                                              {booking.booking.payment.paymentStatus === 'completed' 
                                                ? 'Pago completo' 
                                                : 'Seña pagada - Click para completar'}
                                            </div>
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border-b border-r border-gray-100 rotate-45" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Título en un contenedor separado */}
                                  {booking.isStart && (
                                    <div 
                                      className="absolute w-full pointer-events-none"
                                      style={{
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 5000,
                                      }}
                                    >
                                      <div className="relative flex justify-center items-center">
                                        <span 
                                          className="text-sm px-2.5 py-0.5 font-medium bg-white rounded-md text-gray-600 group"
                                          style={{
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            border: '1px solid rgba(0,0,0,0.03)',
                                            lineHeight: '1.2',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            isolation: 'isolate',
                                            position: 'relative',
                                            zIndex: 5000,
                                            whiteSpace: 'nowrap',
                                            pointerEvents: 'auto'
                                          }}
                                        >
                                          {booking.bookingType === 'class' 
                                            ? (booking.title || 'Clase Reservada')
                                            : (booking.title || 'Reservado')
                                          }
                                          <div 
                                            className="absolute left-1/2 -translate-x-1/2 -top-8 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-600 bg-white px-2 py-1 rounded-md whitespace-nowrap"
                                            style={{
                                              zIndex: 5001,
                                              pointerEvents: 'none',
                                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                              border: '1px solid rgba(0,0,0,0.03)'
                                            }}
                                          >
                                            {`${booking.startTime} - ${booking.endTime}`}
                                          </div>
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <BookingPopup 
            isOpen={popupState.isOpen}
            view={popupState.view}
            position={popupState.position}
            selection={selection}
            guests={guests}
            paymentDetails={paymentDetails}
            onViewChange={handlePopupViewChange}
            onClose={closePopup}
            onBlock={handleBlock}
            onClearBlocks={handleClearBlocks}
            onConfirmBooking={handleConfirmBooking}
            onPaymentUpdate={(details) => setPaymentDetails(prev => ({ ...prev, ...details }))}
            hasBlockedSlots={selection ? hasBlockedSlots(selection) : false}
            formatDuration={formatDuration}
            formatSelectedCourts={formatSelectedCourts}
            shiftTitle={shiftTitle}
            shiftDescription={shiftDescription}
            currentGuest={currentGuest}
            memberSearch={memberSearch || ''}
            showNewUserForm={showNewUserForm}
            onShiftTitleChange={(title) => setShiftTitle(title)}
            onShiftDescriptionChange={(desc) => setShiftDescription(desc)}
            onAddGuest={handleAddGuest}
            onRemoveGuest={handleRemoveGuest}
            onCurrentGuestChange={(guest) => setCurrentGuest(prev => ({ ...prev, ...guest }))}
            onMemberSearchChange={(search) => setMemberSearch(search)}
            onToggleNewUserForm={() => setShowNewUserForm(prev => !prev)}
            classTitle={classTitle}
            classDescription={classDescription}
            isWaitingListClass={isWaitingListClass}
            classMaxParticipants={classMaxParticipants}
            onClassTitleChange={(title) => setClassTitle(title)}
            onClassDescriptionChange={(desc) => setClassDescription(desc)}
            onWaitingListChange={(enabled) => setIsWaitingListClass(enabled)}
            onMaxParticipantsChange={(value) => setClassMaxParticipants(value)}
            blockReason={blockReason}
            onReasonChange={(reason) => setBlockReason(reason)}
            selectedRentals={selectedRentals}
            onRentalChange={setSelectedRentals}
          />

          <OverlapWarningPopup
            isOpen={overlapWarning.isOpen}
            onConfirm={overlapWarning.onConfirm}
            onCancel={() => setOverlapWarning(prev => ({ ...prev, isOpen: false }))}
            position={overlapWarning.position}
            overlappingCount={overlapWarning.overlappingCount}
          />
        </div>
      </div>

      <PaymentConfirmationPopup
        isOpen={confirmationModal.isOpen}
        onConfirm={confirmationModal.onConfirm}
        onCancel={confirmationModal.onCancel}
        position={popupPosition}
      />

      <ClassDescriptionModal
        isOpen={descriptionModal.isOpen}
        onClose={() => {
          setDescriptionModal(prev => ({ ...prev, isOpen: false }))
          setSelectedBooking(null)
        }}
        title={descriptionModal.title || 'Reserva'}
        description={descriptionModal.description || ''}
        type={descriptionModal.type || 'shift'}
        guests={selectedBooking?.guests || []}
        onCancelBooking={selectedBooking ? () => {
          handleCancelBooking(selectedBooking)
        } : undefined}
      />

      <NewBookingModal 
        isOpen={showNewBookingModal}
        onClose={() => setShowNewBookingModal(false)}
      />
    </div>
  )
}