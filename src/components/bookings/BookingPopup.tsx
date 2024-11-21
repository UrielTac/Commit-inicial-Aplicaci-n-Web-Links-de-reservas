"use client"

import { IconCreditCard, IconClock, IconUsers, IconSearch, IconPlus, IconX, IconShoppingBag, IconMinus } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { type PaymentDetails, type Selection, type GuestForm, type PopupView } from "@/types/bookings"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

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
  onConfirmBooking: () => void
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
  memberSearch: string
  showNewUserForm: boolean
  onAddGuest: () => void
  onRemoveGuest: (id: string) => void
  onCurrentGuestChange: (guest: Partial<GuestForm>) => void
  onMemberSearchChange: (search: string) => void
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
  onConfirmBooking: () => void
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
  onAddGuest: () => void
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'equipment' | 'accessories'>('all')

  // Filtrar items según la categoría seleccionada
  const filteredItems = selectedCategory === 'all' 
    ? sampleRentalItems 
    : sampleRentalItems.filter(item => item.category === selectedCategory)

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-gray-900">
          <IconShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Artículos de Alquiler</h4>
          <p className="text-sm text-gray-500">Selecciona los artículos que deseas alquilar</p>
        </div>
      </div>

      <div className="space-y-6 ml-9">
        {/* Filtros de categoría */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
              selectedCategory === 'all'
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedCategory('equipment')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
              selectedCategory === 'equipment'
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Equipamiento
          </button>
          <button
            onClick={() => setSelectedCategory('accessories')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
              selectedCategory === 'accessories'
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Accesorios
          </button>
        </div>

        {/* Lista de artículos */}
        <div className="grid gap-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ 
                opacity: 0,
                y: 5
              }}
              animate={{ 
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.21, 0.68, 0.47, 0.98] // Curva de animación suave y natural
                }
              }}
              exit={{ 
                opacity: 0,
                y: 5,
                transition: {
                  duration: 0.3,
                  ease: 'easeInOut'
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
                {/* Información del Artículo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap ml-2">
                      ${item.price}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {item.available} disponibles
                    </span>
                    {/* Controles de Cantidad */}
                    <div className="flex items-center gap-3 bg-gray-50/60 rounded-md px-2">
                      <motion.button
                        whileHover={{ 
                          scale: 1.01,
                          transition: { duration: 0.15 }
                        }}
                        whileTap={{ 
                          scale: 0.99,
                          transition: { duration: 0.1 }
                        }}
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
                      </motion.button>
                      
                      <motion.span
                        key={selectedRentals.find(rental => rental.itemId === item.id)?.quantity || 0}
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: {
                            duration: 0.2,
                            ease: 'easeOut'
                          }
                        }}
                        className="w-8 text-center text-sm font-medium text-gray-900"
                      >
                        {selectedRentals.find(rental => rental.itemId === item.id)?.quantity || 0}
                      </motion.span>
                      
                      <motion.button
                        whileHover={{ 
                          scale: 1.01,
                          transition: { duration: 0.15 }
                        }}
                        whileTap={{ 
                          scale: 0.99,
                          transition: { duration: 0.1 }
                        }}
                        onClick={() => {
                          const quantity = selectedRentals.find(rental => rental.itemId === item.id)?.quantity || 0
                          if (quantity >= item.available) return
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
                          (selectedRentals.find(rental => rental.itemId === item.id)?.quantity || 0) < item.available
                            ? "text-gray-700 hover:bg-gray-200"
                            : "text-gray-300 cursor-not-allowed"
                        )}
                      >
                        <IconPlus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Resumen de Alquiler - Actualizar animación */}
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
                {selectedRentals.map((rental, index) => {
                  const item = sampleRentalItems.find(i => i.id === rental.itemId)
                  if (!item) return null

                  return (
                    <motion.div 
                      key={rental.itemId}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: {
                          delay: 0.2 + (index * 0.08),
                          duration: 0.4,
                          ease: 'easeOut'
                        }
                      }}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.name} (x{rental.quantity})
                      </span>
                      <span className="font-medium text-gray-900">
                        ${(item.price * rental.quantity).toLocaleString()}
                      </span>
                    </motion.div>
                  )
                })}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { 
                      delay: 0.2 + (selectedRentals.length * 0.08),
                      duration: 0.4
                    }
                  }}
                  className="pt-2 border-t flex justify-between text-sm"
                >
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-medium text-gray-900">
                    ${selectedRentals.reduce((total, rental) => {
                      const item = sampleRentalItems.find(i => i.id === rental.itemId)
                      return total + (item?.price || 0) * rental.quantity
                    }, 0).toLocaleString()}
                  </span>
                </motion.div>
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
            Continuar
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
  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-gray-900">
          <IconCreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Configuración de Precios</h4>
          <p className="text-sm text-gray-500">Define las opciones de pago para la reserva</p>
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
                onClick={() => onPaymentUpdate({
                  paymentStatus: option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed',
                  deposit: option.id === 'deposit' ? Math.ceil(paymentDetails.totalAmount * 0.3) : paymentDetails.totalAmount
                })}
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
                    <h3 className={cn(
                      "font-medium transition-colors text-[15px]",
                      paymentDetails.paymentStatus === (option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed')
                        ? "text-gray-900"
                        : "text-gray-700"
                    )}>
                      {option.title}
                    </h3>
                    <p className={cn(
                      "text-sm transition-colors",
                      paymentDetails.paymentStatus === (option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed')
                        ? "text-gray-600"
                        : "text-gray-500"
                    )}>
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
        </div>

        {/* Campos adicionales según el tipo de pago seleccionado */}
        {paymentDetails.paymentStatus !== 'pending' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6"
          >
            {/* Monto */}
            {paymentDetails.paymentStatus === 'partial' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Monto de la Seña
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    value={paymentDetails.deposit}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(parseInt(e.target.value) || 0, paymentDetails.totalAmount))
                      onPaymentUpdate({ deposit: value })
                    }}
                    className={cn(
                      "w-full pl-7 pr-4 py-2 rounded-lg border bg-white transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-black/5",
                      "text-sm text-gray-900",
                      "[appearance:textfield]",
                      "[&::-webkit-outer-spin-button]:appearance-none",
                      "[&::-webkit-inner-spin-button]:appearance-none"
                    )}
                    style={{ MozAppearance: 'textfield' }}
                  />
                </div>
              </div>
            )}

            {/* Método de Pago */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash' as const, label: 'Efectivo' },
                  { id: 'card' as const, label: 'Mercado Pago' },
                  { id: 'transfer' as const, label: 'Transfer.' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => onPaymentUpdate({
                      paymentMethod: id
                    })}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                      paymentDetails.paymentMethod === id
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 rounded-lg border border-gray-100 p-4"
            >
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">
                  Resumen del Pago
                </h4>
                <div className="space-y-1">
                  {paymentDetails.paymentStatus === 'partial' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Seña</span>
                        <span className="font-medium text-gray-900">
                          ${paymentDetails.deposit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Restante</span>
                        <span className="font-medium text-gray-900">
                          ${(paymentDetails.totalAmount - paymentDetails.deposit).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-medium text-gray-900">
                      ${paymentDetails.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
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
            onClick={onConfirmBooking}
            disabled={paymentDetails.paymentStatus !== 'pending' && !paymentDetails.paymentMethod}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              paymentDetails.paymentStatus === 'pending' || paymentDetails.paymentMethod
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

function ShiftDetailsView({
  selection,
  guests,
  currentGuest,
  memberSearch,
  showNewUserForm,
  onAddGuest,
  onRemoveGuest,
  onCurrentGuestChange,
  onMemberSearchChange,
  onToggleNewUserForm,
  onViewChange,
  formatDuration,
  formatSelectedCourts
}: ShiftDetailsViewProps) {
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
                        {guest.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{guest.fullName}</span>
                      <span className="text-xs text-gray-500">
                        {guest.email || guest.dni}
                      </span>
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
              <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={currentGuest.fullName}
                    onChange={(e) => onCurrentGuestChange({ fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                    placeholder="Nombre completo"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={currentGuest.dni}
                      onChange={(e) => onCurrentGuestChange({ dni: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                      placeholder="DNI"
                    />
                    <input
                      type="email"
                      value={currentGuest.email}
                      onChange={(e) => onCurrentGuestChange({ email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                      placeholder="Email (opcional)"
                    />
                  </div>
                </div>
                <button
                  onClick={onAddGuest}
                  disabled={!currentGuest.fullName.trim() || !currentGuest.dni.trim()}
                  className={cn(
                    "w-full p-2 rounded-lg text-sm font-medium transition-all duration-200",
                    currentGuest.fullName.trim() && currentGuest.dni.trim()
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  Agregar Participante
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => onMemberSearchChange(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] transition-all"
                    placeholder="Buscar participante existente..."
                  />
                  <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                
                {memberSearch.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                    <button
                      onClick={() => {
                        onCurrentGuestChange({
                          fullName: memberSearch,
                          dni: '12345678',
                          email: 'usuario@ejemplo.com'
                        })
                        onAddGuest()
                        onMemberSearchChange('')
                      }}
                      className="w-full p-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                    >
                      {memberSearch}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end items-center gap-3">
          <button
            onClick={() => onViewChange('shift-info')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            Volver
          </button>
          <button
            onClick={() => onViewChange('rentals')}
            disabled={guests.length === 0}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
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

export function BookingPopup(props: BookingPopupProps) {
  if (!props.isOpen || !props.selection) return null

  const getPopupWidth = (view: PopupView): string => {
    switch (view) {
      case 'actions':
      case 'booking-type':
        return '280px'
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
      className="absolute bg-white rounded-xl shadow-lg border p-4 overflow-auto"
      style={{ 
        left: `${adjustedPosition.x}px`, 
        top: `${adjustedPosition.y}px`,
        width: getPopupWidth(props.view),
        maxHeight: '80vh',
        transition: 'all 200ms cubic-bezier(0.3, 0, 0.2, 1)',
        opacity: 1,
        transform: 'scale(1)',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="transition-all duration-100 ease-out">
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
            onConfirmBooking={props.onConfirmBooking}
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
            memberSearch={props.memberSearch}
            showNewUserForm={props.showNewUserForm}
            onAddGuest={props.onAddGuest}
            onRemoveGuest={props.onRemoveGuest}
            onCurrentGuestChange={props.onCurrentGuestChange}
            onMemberSearchChange={props.onMemberSearchChange}
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