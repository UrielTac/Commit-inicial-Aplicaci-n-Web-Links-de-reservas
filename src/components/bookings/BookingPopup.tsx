"use client"

import { IconCreditCard, IconClock, IconUsers, IconSearch, IconPlus, IconX, IconShoppingBag, IconMinus, IconInfoCircle, IconCash, IconBuildingBank } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { type PaymentDetails, type Selection, type GuestForm, type PopupView } from "@/types/bookings"
import { motion } from "framer-motion"
import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { memberService } from "@/services/memberService"
import { toast } from "sonner"
import { SingleSelect } from "@/components/ui/single-select"
import { useItems } from '@/hooks/useItems'
import { useBranchContext } from '@/contexts/BranchContext'
import { timeToMinutes, minutesToTime } from "@/lib/time-utils"
import { Item, ItemWithCalculatedPrice } from '@/types/items'
import { useCourts } from '@/hooks/useCourts'
import { Court } from '@/types/court'
import { bookingService } from '@/services/bookingService'
import { type BookingCreationData } from '@/types/bookings'
import type { PaymentStatusEnum, PaymentMethodEnum } from '@/types/database.types'

interface ActionsViewProps {
  selection: Selection
  hasBlockedSlots: boolean
  onViewChange: (view: PopupView) => void
  onClearBlocks: () => void
  formatDuration: (start: string, end: string) => string
  formatSelectedCourts: (selection: Selection) => string
}

interface BookingTypeViewProps {
  selection: Selection
  onViewChange: (view: PopupView) => void
  formatDuration: (start: string, end: string) => string
  formatSelectedCourts: (selection: Selection) => string
}

interface PaymentViewProps {
  selection: Selection
  selectedRentals: RentalSelection[]
  paymentDetails: PaymentDetails
  onPaymentUpdate: (details: Partial<PaymentDetails>) => void
  onViewChange: (view: PopupView) => void
  onConfirmBooking: () => Promise<void>
  formatDuration: (start: string, end: string) => string
  formatSelectedCourts: (selection: Selection) => string
}

interface ShiftInfoViewProps {
  selection: Selection
  shiftTitle: string
  shiftDescription: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onViewChange: (view: PopupView) => void
  formatDuration: (start: string, end: string) => string
  formatSelectedCourts: (selection: Selection) => string
}

interface ShiftDetailsViewProps {
  selection: Selection
  guests: GuestForm[]
  currentGuest: GuestForm
  showNewUserForm: boolean
  onAddGuest: (guest?: GuestForm) => void
  onRemoveGuest: (id: string) => void
  onCurrentGuestChange: (guest: Partial<GuestForm>) => void
  onToggleNewUserForm: () => void
  onViewChange: (view: PopupView) => void
  formatDuration: (start: string, end: string) => string
  formatSelectedCourts: (selection: Selection) => string
}

interface BlockingViewProps {
  selection: Selection
  blockReason: string
  onReasonChange: (reason: string) => void
  onViewChange: (view: PopupView) => void
  onBlock: () => void
  formatDuration: (start: string, end: string) => string
  formatSelectedCourts: (selection: Selection) => string
}

interface BookingPopupProps {
  isOpen: boolean
  view: PopupView
  position: { x: number; y: number }
  selection: Selection | null
  guests: GuestForm[]
  paymentDetails: PaymentDetails
  onViewChange: (view: PopupView) => void
  onClose: () => void
  onBlock: () => void
  onClearBlocks: () => void
  onConfirmBooking: () => Promise<void>
  onPaymentUpdate: (details: Partial<PaymentDetails>) => void
  hasBlockedSlots: boolean
  formatDuration: (start: string, end: string) => string
  formatSelectedCourts: (selection: Selection) => string
  shiftTitle: string
  shiftDescription: string
  currentGuest: GuestForm
  memberSearch: string
  showNewUserForm: boolean
  onShiftTitleChange: (title: string) => void
  onShiftDescriptionChange: (description: string) => void
  onAddGuest: (guest?: GuestForm) => void
  onRemoveGuest: (id: string) => void
  onCurrentGuestChange: (guest: Partial<GuestForm>) => void
  onMemberSearchChange: (search: string) => void
  onToggleNewUserForm: () => void
  classTitle: string
  classDescription: string
  isWaitingListClass: boolean
  classMaxParticipants: number
  onClassTitleChange: (title: string) => void
  onClassDescriptionChange: (description: string) => void
  onWaitingListChange: (enabled: boolean) => void
  onMaxParticipantsChange: (value: number) => void
  blockReason: string
  onReasonChange: (reason: string) => void
  selectedRentals: RentalSelection[]
  onRentalChange: (rentals: RentalSelection[]) => void
}

// Primero, agregar la interfaz para los artículos de alquiler
interface RentalItem {
  id: string
  name: string
  description: string
  price: number
  available: number
  category: 'equipment' | 'accessories' | 'other'
  image?: string
}

// Datos de ejemplo para los artículos
const sampleRentalItems: RentalItem[] = [
  {
    id: '1',
    name: 'Paleta Profesional',
    description: 'Paleta de alta calidad para jugadores avanzados',
    price: 1500,
    available: 10,
    category: 'equipment'
  },
  {
    id: '2',
    name: 'Paleta Iniciación',
    description: 'Ideal para principiantes',
    price: 800,
    available: 15,
    category: 'equipment'
  },
  {
    id: '3',
    name: 'Pelotas (Pack x3)',
    description: 'Set de 3 pelotas oficiales',
    price: 500,
    available: 20,
    category: 'accessories'
  },
  {
    id: '4',
    name: 'Muñequera',
    description: 'Muñequera deportiva ajustable',
    price: 300,
    available: 25,
    category: 'accessories'
  }
]

// Agregar la interfaz RentalsViewProps
interface RentalsViewProps {
  selection: Selection
  selectedRentals: RentalSelection[]
  onRentalChange: (rentals: RentalSelection[]) => void
  onViewChange: (view: PopupView) => void
  formatDuration: (start: string, end: string) => string
  formatSelectedCourts: (selection: Selection) => string
}

// Agregar el componente RentalsView
function RentalsView({
  selection,
  selectedRentals,
  onRentalChange,
  onViewChange,
  formatDuration,
  formatSelectedCourts
}: RentalsViewProps) {
  const { currentBranch } = useBranchContext()
  const { data: items, isLoading, error } = useItems(currentBranch?.id)

  // Calcular la duración de la reserva en minutos
  const reservationDuration = useMemo(() => {
    if (!selection) return 0
    const startMinutes = timeToMinutes(selection.startTime)
    const endMinutes = timeToMinutes(selection.endTime)
    return endMinutes - startMinutes
  }, [selection])

  // Función para obtener el precio más adecuado según la duración
  const getItemPrice = useCallback((item: Item): number => {
    // Verificar que duration_pricing exista y tenga datos
    if (!item.duration_pricing || Object.keys(item.duration_pricing).length === 0) {
      console.log('No hay precios configurados para:', item.name)
      return 0
    }

    // Convertir el objeto de precios a array y ordenar por duración
    const pricingEntries = Object.entries(item.duration_pricing)
      .map(([duration, price]) => ({
        duration: parseInt(duration), // Convertir la clave a número
        price: typeof price === 'number' ? price : 0 // Asegurar que el precio sea número
      }))
      .sort((a, b) => a.duration - b.duration)

    console.log('Precios disponibles para', item.name, ':', pricingEntries)
    console.log('Duración de reserva:', reservationDuration, 'minutos')

    // Si no hay precios configurados, retornar 0
    if (pricingEntries.length === 0) {
      console.log('No hay entradas de precios válidas')
      return 0
    }

    // Si la duración es menor que la mínima configurada, usar el primer precio
    if (reservationDuration <= pricingEntries[0].duration) {
      console.log('Usando precio m��nimo:', pricingEntries[0].price)
      return pricingEntries[0].price
    }

    // Si la duración es mayor que la máxima configurada, usar el último precio
    if (reservationDuration >= pricingEntries[pricingEntries.length - 1].duration) {
      console.log('Usando precio máximo:', pricingEntries[pricingEntries.length - 1].price)
      return pricingEntries[pricingEntries.length - 1].price
    }

    // Encontrar el precio más cercano a la duración de la reserva
    for (let i = 0; i < pricingEntries.length - 1; i++) {
      if (
        reservationDuration >= pricingEntries[i].duration &&
        reservationDuration < pricingEntries[i + 1].duration
      ) {
        console.log('Usando precio intermedio:', pricingEntries[i].price)
        return pricingEntries[i].price
      }
    }

    // Si no encontramos un rango exacto, usar el último precio
    console.log('Usando último precio disponible:', pricingEntries[pricingEntries.length - 1].price)
    return pricingEntries[pricingEntries.length - 1].price
  }, [reservationDuration])

  // Filtrar items y calcular precios (sin filtro de categoría)
  const itemsWithPrices = useMemo(() => {
    if (!items) return []
    return items.map(item => ({
      ...item,
      calculatedPrice: getItemPrice(item)
    }))
  }, [items, getItemPrice])

  return (
    <div className="animate-in fade-in duration-200">
      {/* Header - Siempre visible */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-gray-900">
          <IconShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Artículos de Alquiler</h4>
          <p className="text-sm text-gray-500">Selecciona los artículos que deseas alquilar</p>
        </div>
      </div>

      <div className="space-y-6 ml-9">
        {/* Lista de artículos */}
        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px] bg-gray-50/50 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">Cargando artículos...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[200px] bg-red-50/50 rounded-lg border border-red-100">
              <div className="text-sm text-red-500">Error al cargar los artículos</div>
            </div>
          ) : (
            <div className="grid gap-3">
              {itemsWithPrices.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ 
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      delay: index * 0.15,
                      ease: [0.21, 0.68, 0.47, 0.98]
                    }
                  }}
                  className={cn(
                    "group relative p-4 rounded-lg border",
                    "transform-gpu backdrop-blur-[2px]",
                    "transition-all duration-300 ease-out",
                    selectedRentals.find(rental => rental.itemId === item.id)?.quantity > 0
                      ? "bg-gray-50/70 ring-1 ring-black/[0.03] border-transparent"
                      : "bg-white/70 border-gray-200/80 hover:border-gray-300/90"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap ml-2">
                          ${item.calculatedPrice.toLocaleString()}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {item.stock} disponibles
                        </span>
                        <div className="flex items-center gap-3 bg-gray-50/60 rounded-md px-2">
                          <button
                            onClick={() => {
                              const quantity = selectedRentals.find(rental => rental.itemId === item.id)?.quantity || 0
                              if (quantity === 0) return
                              onRentalChange(
                                quantity === 1
                                  ? selectedRentals.filter(rental => rental.itemId !== item.id)
                                  : selectedRentals.map(rental =>
                                      rental.itemId === item.id
                                        ? { ...rental, quantity: rental.quantity - 1 }
                                        : rental
                                    )
                              )
                            }}
                            className={cn(
                              "p-1.5 rounded-md transition-all duration-200",
                              selectedRentals.find(rental => rental.itemId === item.id)?.quantity > 0
                                ? "text-gray-700 hover:bg-gray-200"
                                : "text-gray-300 cursor-not-allowed"
                            )}
                          >
                            <IconMinus className="w-4 h-4" />
                          </button>
                          
                          <span className="w-8 text-center text-sm font-medium text-gray-900">
                            {selectedRentals.find(rental => rental.itemId === item.id)?.quantity || 0}
                          </span>
                          
                          <button
                            onClick={() => {
                              const quantity = selectedRentals.find(rental => rental.itemId === item.id)?.quantity || 0
                              if (quantity >= item.stock) return
                              onRentalChange(
                                quantity === 0
                                  ? [...selectedRentals, { itemId: item.id, quantity: 1 }]
                                  : selectedRentals.map(rental =>
                                      rental.itemId === item.id
                                        ? { ...rental, quantity: rental.quantity + 1 }
                                        : rental
                                    )
                              )
                            }}
                            className={cn(
                              "p-1.5 rounded-md transition-all duration-200",
                              (selectedRentals.find(rental => rental.itemId === item.id)?.quantity || 0) < item.stock
                                ? "text-gray-700 hover:bg-gray-200"
                                : "text-gray-300 cursor-not-allowed"
                            )}
                          >
                            <IconPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen de Alquiler */}
        {selectedRentals.length > 0 && (
          <motion.div
            initial={{ 
              opacity: 0,
              y: 10,
              scale: 0.99
            }}
            animate={{ 
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.5,
                ease: [0.21, 0.68, 0.47, 0.98]
              }
            }}
            exit={{
              opacity: 0,
              scale: 0.99,
              transition: {
                duration: 0.3,
                ease: 'easeInOut'
              }
            }}
            className="mt-6 p-4 bg-gray-50/60 backdrop-blur-[2px] rounded-lg border border-gray-100/60"
          >
            <div className="space-y-3">
              <motion.h4 
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { 
                    delay: 0.1, 
                    duration: 0.4,
                    ease: 'easeOut'
                  }
                }}
                className="text-sm font-medium text-gray-900"
              >
                Resumen del Alquiler
              </motion.h4>
              <div className="space-y-2">
                {selectedRentals.map((rental) => {
                  const item = itemsWithPrices.find(i => i.id === rental.itemId)
                  if (!item) return null

                  return (
                    <motion.div key={rental.itemId}>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} (x{rental.quantity})
                        </span>
                        <span className="font-medium text-gray-900">
                          ${(item.calculatedPrice * rental.quantity).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
                <div className="pt-2 border-t flex justify-between text-sm">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-medium text-gray-900">
                    ${selectedRentals.reduce((total, rental) => {
                      const item = itemsWithPrices.find(i => i.id === rental.itemId)
                      return total + (item?.calculatedPrice || 0) * rental.quantity
                    }, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end items-center gap-3 pt-4">
          <button
            onClick={() => onViewChange('shift-details')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            Volver
          </button>
          <button
            onClick={() => onViewChange('shift-payment')}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionsView({ selection, hasBlockedSlots, onViewChange, onClearBlocks, formatDuration, formatSelectedCourts }: ActionsViewProps) {
  return (
    <div className="animate-in fade-in duration-200">
      <h4 className="font-medium mb-2">Acciones de Reserva</h4>
      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {`${selection.startTime} - ${selection.endTime}`}
          </p>
          <p className="text-xs font-medium text-gray-400">
            {formatDuration(selection.startTime, selection.endTime)}
          </p>
        </div>
        <p className="text-sm text-gray-500">
          {formatSelectedCourts(selection)}
        </p>
      </div>
      <div className={cn(
        "grid gap-2",
        hasBlockedSlots ? "grid-cols-3" : "grid-cols-2"
      )}>
        <button
          onClick={() => onViewChange('blocking')}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md",
            "bg-white border border-gray-200",
            "text-gray-600",
            "hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300",
            "transition-all duration-200"
          )}
        >
          <span className="text-xs font-medium">Bloquear</span>
        </button>
        {hasBlockedSlots && (
          <button
            onClick={onClearBlocks}
            className="flex flex-col items-center justify-center p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 border border-gray-200 transition-all duration-200"
          >
            <span className="text-xs font-medium">Limpiar</span>
          </button>
        )}
        <button
          onClick={() => onViewChange('booking-type')}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md",
            "bg-white border border-gray-200",
            "text-gray-600",
            "hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300",
            "transition-all duration-200"
          )}
        >
          <span className="text-xs font-medium">Reservar</span>
        </button>
      </div>
    </div>
  )
}

function BookingTypeView({ selection, onViewChange, formatDuration, formatSelectedCourts }: BookingTypeViewProps) {
  useEffect(() => {
    onViewChange('shift-info')
  }, [onViewChange])

  return null
}

function formatBookingDuration(duration: number): string {
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  if (minutes === 0) return `${hours}h`
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}

function formatPriceDisplay(price: number, duration: number): string {
  return `${formatBookingDuration(duration)} = $${price.toFixed(2)}`
}

function PaymentView({
  selection,
  selectedRentals,
  paymentDetails,
  onPaymentUpdate,
  onViewChange,
  onConfirmBooking,
  formatDuration,
  formatSelectedCourts
}: PaymentViewProps) {
  const { currentBranch } = useBranchContext()
  const { data: courts } = useCourts({ branchId: currentBranch?.id })
  const { data: items } = useItems(currentBranch?.id)
  const [manualPrice, setManualPrice] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | null>(null)
  const [depositAmount, setDepositAmount] = useState<number>(
    paymentDetails.paymentStatus === 'completed' ? paymentDetails.totalAmount : Math.ceil(paymentDetails.totalAmount * 0.3)
  )

  // Calcular la duración de la reserva en minutos
  const reservationDuration = useMemo(() => {
    if (!selection) return 0
    const startMinutes = timeToMinutes(selection.startTime)
    const endMinutes = timeToMinutes(selection.endTime)
    return endMinutes - startMinutes
  }, [selection])

  // Función mejorada para verificar precios configurados
  const checkExactDurationPrice = useCallback((court: Court, durationInMinutes: number) => {
    if (!court.duration_pricing) return null

    // Convertir la duración a string para buscar en el objeto
    const durationKey = durationInMinutes.toString()
    
    // Solo usar precios exactos, no buscar el siguiente más cercano
    if (court.duration_pricing[durationKey] !== undefined) {
      const price = Number(court.duration_pricing[durationKey])
      return price
    }

    // Si no hay precio exacto, retornar null para mostrar el campo de precio personalizado
    return null
  }, [])

  // Calcular el precio total de las canchas
  const courtsPriceTotal = useMemo(() => {
    if (!courts || !selection) return 0
    const durationInMinutes = reservationDuration

    return selection.selections.reduce((total, sel) => {
      const court = courts.find(c => c.id === sel.courtId)
      if (!court) return total

      // Verificar si existe un precio configurado
      const configuredPrice = checkExactDurationPrice(court, durationInMinutes)
      
      if (configuredPrice !== null) {
        return total + configuredPrice
      } else if (manualPrice !== null) {
        return total + manualPrice
      }

      return total
    }, 0)
  }, [courts, selection, reservationDuration, checkExactDurationPrice, manualPrice])

  // Calcular el precio total de los artículos
  const rentalsPriceTotal = useMemo(() => {
    if (!items || !selectedRentals.length) return 0

    return selectedRentals.reduce((total, rental) => {
      const item = items.find(i => i.id === rental.itemId)
      if (!item?.duration_pricing) return total

      // Encontrar el precio adecuado según la duración
      const pricingEntries = Object.entries(item.duration_pricing)
        .map(([duration, price]) => ({
          duration: parseInt(duration),
          price: typeof price === 'number' ? price : 0
        }))
        .sort((a, b) => a.duration - b.duration)

      let itemPrice = 0
      for (const entry of pricingEntries) {
        if (reservationDuration <= entry.duration) {
          itemPrice = entry.price
          break
        }
      }
      // Si no encontramos un precio adecuado, usar el último
      if (itemPrice === 0 && pricingEntries.length > 0) {
        itemPrice = pricingEntries[pricingEntries.length - 1].price
      }

      return total + (itemPrice * rental.quantity)
    }, 0)
  }, [items, selectedRentals, reservationDuration])

  // Asegurarnos de que el precio se actualiza correctamente
  useEffect(() => {
    const totalAmount = courtsPriceTotal + rentalsPriceTotal
    onPaymentUpdate({
      totalAmount,
      deposit: paymentDetails.paymentStatus === 'completed' ? totalAmount : Math.ceil(totalAmount * 0.3)
    })
  }, [courtsPriceTotal, rentalsPriceTotal, paymentDetails.paymentStatus, onPaymentUpdate])

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-gray-900">
          <IconCreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Registro de Pago</h4>
          <p className="text-sm text-gray-500">Selecciona el tipo y método de pago para la reserva</p>
        </div>
      </div>

      <div className="space-y-6 ml-9">
        {/* Opciones de Pago */}
        <div className="space-y-4">
          <div className="grid gap-3">
            {[
              {
                id: 'simple' as const,
                title: 'Reserva Simple',
                description: 'Sin registro de pago o seña',
                icon: (
                  <div className="relative w-9 h-9">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50/40 to-gray-100/40 rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconClock className="h-4.5 w-4.5 text-gray-600/80" strokeWidth={1.5} />
                    </div>
                  </div>
                )
              },
              {
                id: 'deposit' as const,
                title: 'Seña / Anticipo',
                description: 'Registrar pago parcial',
                icon: (
                  <div className="relative w-9 h-9">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-50/40 to-amber-100/40 rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconCreditCard className="h-4.5 w-4.5 text-amber-600/80" strokeWidth={1.5} />
                    </div>
                  </div>
                )
              },
              {
                id: 'full' as const,
                title: 'Pago Completo',
                description: 'Registrar pago total',
                icon: (
                  <div className="relative w-9 h-9">
                    <div className="absolute inset-0 bg-gradient-to-b from-green-50/40 to-green-100/40 rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconCreditCard className="h-4.5 w-4.5 text-green-600/80" strokeWidth={1.5} />
                    </div>
                  </div>
                )
              }
            ].map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.995 }}
                onClick={() => {
                  const newStatus = option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed'
                  const newDeposit = option.id === 'full' ? paymentDetails.totalAmount : (option.id === 'deposit' ? Math.ceil(paymentDetails.totalAmount * 0.3) : 0)
                  onPaymentUpdate({
                    paymentStatus: newStatus,
                    deposit: newDeposit
                  })
                }}
                className={cn(
                  "group relative w-full px-4 py-3.5 rounded-lg border transition-all duration-200",
                  "hover:bg-gray-50/50",
                  paymentDetails.paymentStatus === (option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed')
                    ? "bg-gray-50 ring-1 ring-black/5 border-transparent"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-4">
                  {option.icon}
                  <div className="flex-1 text-left">
                    <h3 className="text-[15px] font-medium text-gray-900">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    paymentDetails.paymentStatus === (option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed')
                      ? "bg-black scale-110"
                      : "bg-gray-300"
                  )} />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Campo de seña cuando se selecciona pago parcial */}
          {paymentDetails.paymentStatus === 'partial' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700">
                Monto de la Seña
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (!isNaN(value) && value > 0 && value < paymentDetails.totalAmount) {
                    setDepositAmount(value)
                    onPaymentUpdate({ deposit: value })
                  }
                }}
                className={cn(
                  "px-3 py-2 w-full",
                  "rounded-lg",
                  "border border-gray-200 bg-white",
                  "focus:outline-none focus:border-gray-300",
                  "transition-colors duration-200",
                  "text-sm",
                  "[appearance:textfield]",
                  "[&::-webkit-outer-spin-button]:appearance-none",
                  "[&::-webkit-inner-spin-button]:appearance-none"
                )}
                placeholder="Ingrese el monto de la seña"
              />
            </motion.div>
          )}

          {/* Método de Pago si no es reserva simple */}
          {paymentDetails.paymentStatus !== 'pending' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <label className="text-sm font-medium text-gray-700">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash' as const, label: 'Efectivo' },
                  { id: 'card' as const, label: 'Stripe' },
                  { id: 'transfer' as const, label: 'Transferencia' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setPaymentMethod(id)
                      onPaymentUpdate({ 
                        paymentMethod: id === 'card' ? 'stripe' : id 
                      })
                    }}
                    className={cn(
                      "relative h-10 rounded-lg text-sm transition-all duration-200",
                      "border flex items-center justify-center",
                      "w-full px-2",
                      paymentMethod === id
                        ? [
                            "border-gray-900/10 bg-gray-50",
                            "text-gray-900 font-medium"
                          ]
                        : [
                            "border-gray-200 bg-white hover:border-gray-300",
                            "text-gray-600 hover:text-gray-900",
                            "hover:bg-gray-50/50"
                          ]
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Campo de precio no configurado */}
        {paymentDetails.paymentStatus !== 'pending' && courts?.some(court => 
          selection.selections.some(sel => 
            sel.courtId === court.id && 
            checkExactDurationPrice(court, reservationDuration) === null
          )
        ) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-gray-200 bg-white"
          >
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Precio personalizado
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    No hay un precio configurado para {formatDurationDisplay(reservationDuration)}. Por favor, ingrese un precio personalizado.
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      value={manualPrice || ''}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (!isNaN(value) && value >= 0) {
                          setManualPrice(value)
                        }
                      }}
                      placeholder="0"
                      className={cn(
                        "w-full pl-6 pr-12 py-2",
                        "text-sm text-gray-900 placeholder:text-gray-400",
                        "bg-white",
                        "border border-gray-200",
                        "rounded-lg",
                        "focus:outline-none focus:ring-1 focus:ring-gray-900/10 focus:border-gray-900/20",
                        "transition duration-200",
                        "[appearance:textfield]",
                        "[&::-webkit-outer-spin-button]:appearance-none",
                        "[&::-webkit-inner-spin-button]:appearance-none"
                      )}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-xs text-gray-500">por cancha</span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Establece el precio para {formatDurationDisplay(reservationDuration)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Resumen de Precios */}
        {paymentDetails.paymentStatus !== 'pending' && (
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Resumen del Pago
            </h4>
            <div className="space-y-4">
              {/* Desglose de canchas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Canchas ({formatDuration(selection.startTime, selection.endTime)})</span>
                </div>
                {selection.selections.map((sel) => {
                  const court = courts?.find(c => c.id === sel.courtId)
                  if (!court) return null

                  const courtPrice = courtsPriceTotal / selection.selections.length

                  return (
                    <div key={sel.courtId} className="flex justify-between text-sm pl-2">
                      <div className="flex flex-col">
                        <span className="text-gray-700">
                          {court.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatPrice(courtPrice)} • {formatDurationDisplay(reservationDuration)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatPrice(courtPrice)}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Desglose de artículos si hay */}
              {selectedRentals.length > 0 && (
                <div className="space-y-2 border-t pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Artículos de Alquiler</span>
                  </div>
                  {selectedRentals.map((rental) => {
                    const item = items?.find(i => i.id === rental.itemId)
                    if (!item) return null

                    const itemTotal = (rentalsPriceTotal / selectedRentals.length) * rental.quantity

                    return (
                      <div key={rental.itemId} className="flex justify-between text-sm pl-2">
                        <div className="flex flex-col">
                          <span className="text-gray-700">
                            {item.name} (x{rental.quantity})
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatPrice(itemTotal / rental.quantity)} por unidad
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatPrice(itemTotal)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Mostrar información de la seña si es pago parcial */}
              {paymentDetails.paymentStatus === 'partial' && (
                <div className="border-t pt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(paymentDetails.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Seña</span>
                    <span className="text-amber-600">{formatPrice(depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pendiente</span>
                    <span className="text-gray-900">{formatPrice(paymentDetails.totalAmount - depositAmount)}</span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-3 mt-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900">
                    {paymentDetails.paymentStatus === 'partial' ? 'Total a Pagar Ahora' : 'Total'}
                  </span>
                  <span className="text-gray-900">
                    {formatPrice(paymentDetails.paymentStatus === 'partial' ? depositAmount : paymentDetails.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end items-center gap-3">
          <button
            onClick={() => onViewChange('rentals')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            Volver
          </button>
          <button
            onClick={async () => {
              try {
                if (!paymentMethod && paymentDetails.paymentStatus !== 'pending') {
                  toast.error('Por favor selecciona un método de pago')
                  return
                }
                
                // Mostrar loading state
                toast.loading('Creando reserva...')
                
                await onConfirmBooking()
              } catch (error: any) {
                console.error('Error al confirmar la reserva:', error)
                toast.error(error.message || 'Error al confirmar la reserva')
              }
            }}
            disabled={paymentDetails.paymentStatus !== 'pending' && !paymentMethod}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              paymentDetails.paymentStatus === 'pending' || paymentMethod
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  )
}

function ShiftInfoView({
  selection,
  shiftTitle,
  shiftDescription,
  onTitleChange,
  onDescriptionChange,
  onViewChange,
  formatDuration,
  formatSelectedCourts
}: ShiftInfoViewProps) {
  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-gray-900">
          <IconUsers className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-semibold text-gray-900">
          Información del Turno
        </h4>
      </div>
      <div className="space-y-4 ml-9">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <IconClock className="w-5 h-5 text-gray-400" />
            <p className="text-sm text-gray-500">
              {`${selection.startTime} - ${selection.endTime}`}
            </p>
          </div>
          <div className="space-y-1 ml-7">
            <p className="text-sm text-gray-500">
              {formatSelectedCourts(selection)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título del turno
            </label>
            <input
              type="text"
              value={shiftTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
              placeholder="Opcional: Nombre personalizado para el turno"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={shiftDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"
              placeholder="Opcional: Agregar detalles sobre el turno"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-2">
          <button
            onClick={() => onViewChange('booking-type')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            Volver
          </button>
          <button
            onClick={() => onViewChange('shift-details')}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

interface SearchMemberResult {
  id: string
  fullName: string
  email: string
  phone: string | null
}

// Agregar estas interfaces
interface NewMemberForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
}

// Actualizar la interfaz GuestForm
interface GuestForm {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
}

// Agregar las opciones de género
const genderOptions = [
  { id: 'male', name: 'Hombre' },
  { id: 'female', name: 'Mujer' },
  { id: 'not_specified', name: 'Prefiero no decirlo' }
] as const

function ShiftDetailsView({
  selection,
  guests,
  currentGuest,
  showNewUserForm,
  onAddGuest,
  onRemoveGuest,
  onCurrentGuestChange,
  onToggleNewUserForm,
  onViewChange,
  formatDuration,
  formatSelectedCourts
}: ShiftDetailsViewProps) {
  const [memberSearch, setMemberSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchMemberResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const [newMemberForm, setNewMemberForm] = useState<NewMemberForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: ''
  })

  const handleMemberSearch = async (search: string) => {
    setMemberSearch(search)
    
    // Limpiar el timeout anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!search.trim()) {
      setSearchResults([])
      return
    }

    // Debounce la búsqueda para evitar demasiadas llamadas
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      const { data, error } = await memberService.searchMembers(search)
      setIsSearching(false)
      
      if (error) {
        console.error('Error buscando miembros:', error)
        return
      }

      setSearchResults(data || [])
    }, 300)
  }

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Función para manejar la creación de nuevo miembro
  const handleCreateMember = async () => {
    try {
      // Validaciones
      if (!newMemberForm.firstName.trim() || !newMemberForm.lastName.trim()) {
        toast.error('El nombre y apellido son requeridos')
        return
      }

      if (newMemberForm.email && !isValidEmail(newMemberForm.email)) {
        toast.error('El formato del email no es válido')
        return
      }

      // Crear el miembro en Supabase
      const result = await memberService.createMember({
        first_name: newMemberForm.firstName,
        last_name: newMemberForm.lastName,
        email: newMemberForm.email,
        phone: newMemberForm.phone,
        gender: newMemberForm.gender as 'male' | 'female' | 'not_specified',
        status: 'Sin Plan'
      })

      if (result) {
        // Crear el guest con los datos del nuevo miembro
        const newGuest: GuestForm = {
          id: result.id,
          firstName: result.first_name || '',
          lastName: result.last_name || '',
          email: result.email,
          phone: result.phone || '',
          gender: result.gender || ''
        }

        // Agregar el nuevo guest
        onAddGuest(newGuest)
        
        // Limpiar el formulario
        setNewMemberForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          gender: ''
        })

        // Cambiar a modo búsqueda
        onToggleNewUserForm()
        
        toast.success('Miembro creado exitosamente')
      }
    } catch (error: any) {
      console.error('Error creando miembro:', error)
      toast.error(error.message || 'Error al crear el miembro')
    }
  }

  // Helper para validar email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-gray-900">
          <IconUsers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Participantes del Turno</h4>
          <p className="text-sm text-gray-500">Gestiona los participantes para esta reserva</p>
        </div>
      </div>

      <div className="space-y-6 ml-9">
        {/* Información del horario */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <IconClock className="w-5 h-5 text-gray-400" />
            <p className="text-sm text-gray-500">
              {`${selection.startTime} - ${selection.endTime}`}
            </p>
          </div>
          <div className="space-y-1 ml-7">
            <p className="text-sm text-gray-500">
              {formatSelectedCourts(selection)}
            </p>
          </div>
        </div>

        {/* Lista de participantes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"> 
              <span className="text-sm font-medium text-gray-700">
                Participantes
              </span>
              {guests.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {guests.length}
                </span>
              )}
            </div>
            <button
              onClick={onToggleNewUserForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-white bg-gray-100 hover:bg-gray-900 rounded-full transition-all duration-200"
            >
              {showNewUserForm ? (
                <>
                  <IconSearch className="w-3.5 h-3.5" />
                  Buscar existente
                </>
              ) : (
                <>
                  <IconPlus className="w-3.5 h-3.5" />
                  Crear nuevo
                </>
              )}
            </button>
          </div>

          {/* Lista de participantes agregados */}
          {guests.length > 0 && (
            <div className="grid gap-2">
              {guests.map(guest => (
                <div 
                  key={guest.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] group hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-900">
                        {guest.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {`${guest.firstName} ${guest.lastName}`}
                      </span>
                      <div className="flex flex-col">
                        {guest.email && (
                          <span className="text-xs text-gray-500">
                            {guest.email}
                          </span>
                        )}
                        {guest.phone && (
                          <span className="text-xs text-gray-500">
                            {guest.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveGuest(guest.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para agregar participantes */}
          <div className="mt-4">
            {showNewUserForm ? (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]"
              >
                <div className="space-y-3">
                  {/* Nombre y Apellido */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={newMemberForm.firstName}
                        onChange={(e) => setNewMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className={cn(
                          "w-full px-2 py-2",
                          "rounded-lg",
                          "border border-gray-200 bg-white",
                          "focus:outline-none focus:border-gray-300",
                          "transition-colors duration-200",
                          "text-sm"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={newMemberForm.lastName}
                        onChange={(e) => setNewMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className={cn(
                          "w-full px-2 py-2",
                          "rounded-lg",
                          "border border-gray-200 bg-white",
                          "focus:outline-none focus:border-gray-300",
                          "transition-colors duration-200",
                          "text-sm"
                        )}
                      />
                    </div>
                  </motion.div>

                  {/* Email y Teléfono */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newMemberForm.email}
                        onChange={(e) => setNewMemberForm(prev => ({ ...prev, email: e.target.value }))}
                        className={cn(
                          "w-full px-2 py-2",
                          "rounded-lg",
                          "border border-gray-200 bg-white",
                          "focus:outline-none focus:border-gray-300",
                          "transition-colors duration-200",
                          "text-sm"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={newMemberForm.phone}
                        onChange={(e) => setNewMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                        className={cn(
                          "w-full px-2 py-2",
                          "rounded-lg",
                          "border border-gray-200 bg-white",
                          "focus:outline-none focus:border-gray-300",
                          "transition-colors duration-200",
                          "text-sm"
                        )}
                      />
                    </div>
                  </motion.div>

                  {/* Género */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-700">
                      Género
                    </label>
                    <SingleSelect
                      value={newMemberForm.gender}
                      onChange={(value) => setNewMemberForm(prev => ({ ...prev, gender: value }))}
                      options={genderOptions}
                      placeholder="Seleccione el género"
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateMember}
                    disabled={!newMemberForm.firstName.trim() || !newMemberForm.lastName.trim()}
                    className={cn(
                      "w-full p-2 rounded-lg text-sm font-medium transition-all duration-200",
                      newMemberForm.firstName.trim() && newMemberForm.lastName.trim()
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    Crear Miembro
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Buscar Miembro
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => handleMemberSearch(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2",
                        "rounded-lg",
                        "border border-gray-200 bg-white",
                        "focus:outline-none focus:border-gray-300",
                        "transition-colors duration-200",
                        "placeholder:text-gray-400",
                        "text-sm"
                      )}
                      placeholder="Buscar por nombre, email o teléfono..."
                    />
                  </div>
                </div>

                {/* Resultados de búsqueda */}
                {isSearching && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <span className="animate-pulse">Buscando...</span>
                    </div>
                  </motion.div>
                )}

                {!isSearching && memberSearch.trim() && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100 overflow-hidden"
                  >
                    {searchResults.map((member) => (
                      <motion.button
                        key={member.id}
                        whileHover={{ backgroundColor: "rgb(249 250 251)" }}
                        onClick={() => {
                          const newGuest: GuestForm = {
                            id: member.id,
                            firstName: member.fullName.split(' ')[0],
                            lastName: member.fullName.split(' ')[1] || '',
                            email: member.email || '',
                            phone: member.phone || '',
                            gender: ''
                          }
                          onAddGuest(newGuest)
                          setMemberSearch('')
                          setSearchResults([])
                        }}
                        className="w-full p-3 text-left flex flex-col gap-0.5 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {member.fullName}
                        </span>
                        <div className="flex flex-col">
                          {member.email && (
                            <span className="text-xs text-gray-500">
                              {member.email}
                            </span>
                          )}
                          {member.phone && (
                            <span className="text-xs text-gray-500">
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {!isSearching && memberSearch.trim() && searchResults.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        No se encontraron miembros
                      </p>
                      <button
                        onClick={() => onToggleNewUserForm()}
                        className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                      >
                        ¿Deseas crear un nuevo miembro?
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end items-center gap-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              onViewChange('shift-info')
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            Volver
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              onViewChange('rentals')
            }}
            disabled={guests.length === 0}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
              guests.length > 0 
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

function BlockingView({
  selection,
  blockReason,
  onReasonChange,
  onViewChange,
  onBlock,
  formatDuration,
  formatSelectedCourts
}: BlockingViewProps) {
  return (
    <div className="animate-in fade-in duration-200">
      <h4 className="font-medium mb-2">Bloquear Horario</h4>
      <div className="space-y-1 mb-4">
        <p className="text-sm text-gray-500">
          {`${selection.startTime} - ${selection.endTime}`}
        </p>
        <p className="text-sm text-gray-500">
          {formatSelectedCourts(selection)}
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="blockReason" className="block text-sm font-medium text-gray-700 mb-1">
            Motivo del Bloqueo
          </label>
          <input
            id="blockReason"
            type="text"
            value={blockReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Opcional: Ingrese el motivo del bloqueo"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onViewChange('actions')}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onBlock}
            className="px-4 py-1.5 text-sm bg-red-500/90 text-white rounded-md hover:bg-red-400 transition-colors font-medium"
          >
            Confirmar Bloqueo
          </button>
        </div>
      </div>
    </div>
  )
}

// Función auxiliar para formatear la duración
const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}min`
}

// Función auxiliar para formatear el precio por duración
const formatPriceForDuration = (price: number, duration: number) => {
  return `${formatDuration(duration)} = $${price.toFixed(2)}`
}

// Agregar estas funciones de utilidad al inicio del archivo, después de las interfaces
function formatDurationDisplay(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours === 0) {
    return `${remainingMinutes} minutos`
  }
  
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hora' : `${hours} horas`
  }
  
  return hours === 1 
    ? `1 hora y ${remainingMinutes} minutos`
    : `${hours} horas y ${remainingMinutes} minutos`
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('es-ES', { 
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}

export function BookingPopup(props: BookingPopupProps) {
  const { currentBranch } = useBranchContext()
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  
  // Obtener los items usando el hook y manejar el estado de carga
  const { data: items = [], isLoading, error } = useItems(currentBranch?.id)

  const handleConfirmBooking = async () => {
    if (!props.selection) return

    try {
      const isFullPayment = props.paymentDetails.deposit === props.paymentDetails.totalAmount
      const depositAmount = isFullPayment ? props.paymentDetails.totalAmount : props.paymentDetails.deposit

      // Validar datos requeridos
      if (!props.selection.startCourtId) throw new Error('No se ha seleccionado una cancha')
      if (!selectedDate) throw new Error('No se ha seleccionado una fecha')
      if (!props.selection.startTime) throw new Error('No se ha seleccionado hora de inicio')
      if (!props.selection.endTime) throw new Error('No se ha seleccionado hora de fin')
      if (!props.paymentDetails.totalAmount) throw new Error('El precio total es requerido')

      const bookingData: BookingCreationData = {
        courtId: props.selection.startCourtId,
        date: selectedDate.toISOString().split('T')[0],
        startTime: props.selection.startTime,
        endTime: props.selection.endTime,
        title: props.shiftTitle || undefined,
        description: props.shiftDescription || undefined,
        totalPrice: props.paymentDetails.totalAmount,
        paymentStatus: isFullPayment ? 'completed' : props.paymentDetails.paymentStatus,
        paymentMethod: props.paymentDetails.paymentMethod === 'card' ? 'stripe' : props.paymentDetails.paymentMethod,
        depositAmount,
        participants: props.guests.map(guest => ({
          memberId: guest.id,
          role: 'player'
        })),
        rentalItems: props.selectedRentals.map(rental => {
          const item = items.find(i => i.id === rental.itemId)
          return {
            itemId: rental.itemId,
            quantity: rental.quantity,
            pricePerUnit: item?.price || 0
          }
        })
      }

      console.log('Enviando datos de reserva:', bookingData)
      const response = await bookingService.createBooking(bookingData)

      if (response.error) {
        throw new Error(response.error.message)
      }

      toast.dismiss() // Dismiss loading toast
      console.log('Reserva creada exitosamente:', response)
      props.onViewChange('actions')
      toast.success('Reserva creada exitosamente')
      await props.onConfirmBooking?.()
    } catch (error: any) {
      toast.dismiss() // Dismiss loading toast
      console.error('Error al crear la reserva:', error)
      throw error // Re-throw para que se maneje en el componente
    }
  }

  if (!props.isOpen || !props.selection) return null

  const getPopupWidth = (view: PopupView): string => {
    switch (view) {
      case 'actions':
        return '280px'
      case 'rentals':
        return '440px'
      default:
        return '400px'
    }
  }

  // Calcular la posición ajustada del popup
  const adjustedPosition = (() => {
    const popupWidth = parseInt(getPopupWidth(props.view))
    const tableContainer = document.querySelector('.booking-table-container')
    const tableRect = tableContainer?.getBoundingClientRect()
    
    if (!tableRect) return { x: props.position.x, y: props.position.y }

    let x = props.position.x
    let y = props.position.y
    const SPACING = 16
    
    // Calcular límites del contenedor
    const containerLeft = tableRect.left
    const containerRight = tableRect.right
    const containerTop = tableRect.top
    const containerBottom = tableRect.bottom

    // Estimar altura del popup (podemos ajustar según el view)
    const estimatedHeight = props.view === 'actions' ? 150 : 400

    // Ajuste horizontal
    if (x + popupWidth > containerRight - SPACING) {
      const leftPosition = x - popupWidth - SPACING
      if (leftPosition >= containerLeft + SPACING) {
        x = leftPosition
      } else {
        x = containerRight - popupWidth - SPACING
      }
    }
    x = Math.max(containerLeft + SPACING, x)

    // Ajuste vertical
    if (y + estimatedHeight > containerBottom - SPACING) {
      // Si no hay espacio abajo, intentar colocar arriba del punto de click
      const topPosition = y - estimatedHeight - SPACING
      if (topPosition >= containerTop + SPACING) {
        y = topPosition
      } else {
        // Si tampoco hay espacio arriba, colocar lo más arriba posible
        y = containerTop + SPACING
      }
    }
    y = Math.max(containerTop + SPACING, y)

    return {
      x: x - containerLeft,
      y: y - containerTop
    }
  })()

  return (
    <div 
      className="fixed bg-white rounded-xl shadow-lg border overflow-auto"
      style={{ 
        left: `${adjustedPosition.x}px`, 
        top: `${adjustedPosition.y}px`,
        width: getPopupWidth(props.view),
        maxHeight: '80vh',
        position: 'fixed',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        perspective: '1000px',
        WebkitPerspective: '1000px',
        transformStyle: 'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
        zIndex: 9999,
        pointerEvents: 'auto',
        padding: 0
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        {props.view === 'actions' && (
          <ActionsView 
            selection={props.selection}
            hasBlockedSlots={props.hasBlockedSlots}
            onViewChange={props.onViewChange}
            onClearBlocks={props.onClearBlocks}
            formatDuration={props.formatDuration}
            formatSelectedCourts={props.formatSelectedCourts}
          />
        )}
        
        {props.view === 'booking-type' && (
          <BookingTypeView 
            selection={props.selection}
            onViewChange={props.onViewChange}
            formatDuration={props.formatDuration}
            formatSelectedCourts={props.formatSelectedCourts}
          />
        )}

        {props.view === 'shift-payment' && (
          <PaymentView 
            selection={props.selection}
            selectedRentals={props.selectedRentals}
            paymentDetails={props.paymentDetails}
            onPaymentUpdate={props.onPaymentUpdate}
            onViewChange={props.onViewChange}
            onConfirmBooking={handleConfirmBooking}
            formatDuration={props.formatDuration}
            formatSelectedCourts={props.formatSelectedCourts}
          />
        )}

        {props.view === 'shift-info' && (
          <ShiftInfoView 
            selection={props.selection}
            shiftTitle={props.shiftTitle}
            shiftDescription={props.shiftDescription}
            onTitleChange={props.onShiftTitleChange}
            onDescriptionChange={props.onShiftDescriptionChange}
            onViewChange={props.onViewChange}
            formatDuration={props.formatDuration}
            formatSelectedCourts={props.formatSelectedCourts}
          />
        )}

        {props.view === 'shift-details' && (
          <ShiftDetailsView 
            selection={props.selection}
            guests={props.guests}
            currentGuest={props.currentGuest}
            showNewUserForm={props.showNewUserForm}
            onAddGuest={props.onAddGuest}
            onRemoveGuest={props.onRemoveGuest}
            onCurrentGuestChange={props.onCurrentGuestChange}
            onToggleNewUserForm={props.onToggleNewUserForm}
            onViewChange={props.onViewChange}
            formatDuration={props.formatDuration}
            formatSelectedCourts={props.formatSelectedCourts}
          />
        )}

        {props.view === 'blocking' && (
          <BlockingView 
            selection={props.selection}
            blockReason={props.blockReason}
            onReasonChange={props.onReasonChange}
            onViewChange={props.onViewChange}
            onBlock={props.onBlock}
            formatDuration={props.formatDuration}
            formatSelectedCourts={props.formatSelectedCourts}
          />
        )}

        {props.view === 'rentals' && (
          <RentalsView 
            selection={props.selection}
            selectedRentals={props.selectedRentals}
            onRentalChange={props.onRentalChange}
            onViewChange={props.onViewChange}
            formatDuration={props.formatDuration}
            formatSelectedCourts={props.formatSelectedCourts}
          />
        )}
      </div>
    </div>
  )
} 