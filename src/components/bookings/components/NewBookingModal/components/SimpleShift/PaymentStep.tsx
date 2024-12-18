import { useEffect, useState, useMemo, useCallback } from 'react'
import type { PaymentDetails } from '@/types/bookings'
import { Button } from '@/components/ui/button'
import { IconClock, IconCreditCard } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useCourts } from '@/hooks/useCourts'
import { useItems } from '@/hooks/useItems'
import { useBranchContext } from '@/contexts/BranchContext'
import { timeToMinutes } from '@/lib/time-utils'
import type { Court } from '@/types/court'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PaymentStepProps {
  totalAmount: number
  selectedRentals: { itemId: string; quantity: number }[]
  selectedCourts: string[]
  startTime: string
  endTime: string
  onPaymentChange: (details: PaymentDetails) => void
  onNext: () => void
  onBack: () => void
}

export function PaymentStep({ 
  totalAmount: initialTotal,
  selectedRentals = [],
  selectedCourts = [],
  startTime = '00:00',
  endTime = '00:00',
  onPaymentChange,
  onNext,
  onBack
}: PaymentStepProps) {
  const { currentBranch } = useBranchContext()
  const { data: courts = [] } = useCourts({ branchId: currentBranch?.id })
  const { data: items = [] } = useItems(currentBranch?.id)
  const [manualPrice, setManualPrice] = useState<number | null>(null)
  const [showCustomPriceInput, setShowCustomPriceInput] = useState(false)
  const [paymentState, setPaymentState] = useState<PaymentDetails>(() => ({
    totalAmount: initialTotal,
    deposit: initialTotal,
    paymentStatus: 'completed',
    paymentMethod: 'cash',
    isPaid: false
  }))
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | null>(null)

  // Calcular la duración de la reserva en minutos con validación
  const reservationDuration = useMemo(() => {
    if (!startTime || !endTime) return 0
    try {
      const startMinutes = timeToMinutes(startTime)
      const endMinutes = timeToMinutes(endTime)
      return endMinutes - startMinutes
    } catch (error) {
      console.error('Error calculando la duración:', error)
      return 0
    }
  }, [startTime, endTime])

  // Calcular el precio total de las canchas
  const courtsPriceTotal = useMemo(() => {
    if (!courts || selectedCourts.length === 0) return 0
    const durationInMinutes = reservationDuration

    return selectedCourts.reduce((total, courtId) => {
      const court = courts.find(c => c.id === courtId)
      if (!court) return total

      // Si hay un precio manual y no hay precio configurado, usar el manual
      if (manualPrice !== null && !court.duration_pricing?.[durationInMinutes.toString()]) {
        return total + manualPrice
      }

      // Si hay precio configurado, usarlo
      const configuredPrice = court.duration_pricing?.[durationInMinutes.toString()]
      if (configuredPrice !== undefined) {
        return total + configuredPrice
      }

      return total
    }, 0)
  }, [courts, selectedCourts, reservationDuration, manualPrice])

  // Calcular el precio total de los artículos
  const rentalsPriceTotal = useMemo(() => {
    if (!items || !selectedRentals.length) return 0

    return selectedRentals.reduce((total, rental) => {
      const item = items.find(i => i.id === rental.itemId)
      if (!item?.duration_pricing) return total

      // Usar el precio base del item como en RentalStep
      const defaultDuration = item.default_duration || 60
      const basePrice = item.duration_pricing[defaultDuration.toString()] || 0

      return total + (basePrice * rental.quantity)
    }, 0)
  }, [items, selectedRentals])

  // Verificar si la duración tiene precio configurado
  useEffect(() => {
    const hasPriceConfigured = selectedCourts.every(courtId => {
      const court = courts.find(c => c.id === courtId)
      if (!court?.duration_pricing) return false
      return court.duration_pricing[reservationDuration.toString()] !== undefined
    })

    setShowCustomPriceInput(!hasPriceConfigured)
    if (hasPriceConfigured) {
      setManualPrice(null)
    }
  }, [courts, selectedCourts, reservationDuration])

  // Manejar cambio de precio manual
  const handleManualPriceChange = useCallback((value: number | null) => {
    setManualPrice(value)
    // Forzar actualización inmediata del estado de pago con el nuevo precio
    const updatedTotal = (value || 0) + rentalsPriceTotal
    const newState = {
      ...paymentState,
      totalAmount: updatedTotal,
      deposit: paymentState.paymentStatus === 'completed' ? updatedTotal : Math.ceil(updatedTotal * 0.3),
      manualPrice: value
    }
    setPaymentState(newState)
    onPaymentChange(newState)
  }, [rentalsPriceTotal, paymentState, onPaymentChange])

  // Actualizar el estado cuando cambian los montos o el precio manual
  useEffect(() => {
    const newTotal = courtsPriceTotal + rentalsPriceTotal
    console.log('Calculando nuevo total:', {
      courtsPriceTotal,
      rentalsPriceTotal,
      newTotal,
      manualPrice,
      currentTotal: paymentState.totalAmount
    })

    if (newTotal > 0 && newTotal !== paymentState.totalAmount) {
      const newState = {
        ...paymentState,
        totalAmount: newTotal,
        deposit: paymentState.paymentStatus === 'completed' ? newTotal : Math.ceil(newTotal * 0.3),
        manualPrice: manualPrice
      }
      setPaymentState(newState)
      onPaymentChange(newState)
    }
  }, [courtsPriceTotal, rentalsPriceTotal, paymentState, onPaymentChange, manualPrice])

  // Mover el renderCustomPriceInput después del método de pago y aplicar los estilos necesarios
  const renderCustomPriceInput = () => {
    if (!showCustomPriceInput) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="space-y-2"
      >
        <Label className="text-sm font-medium text-gray-700">
          Precio personalizado para {reservationDuration} minutos
        </Label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={manualPrice || ''}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            handleManualPriceChange(isNaN(value) ? null : value);
          }}
          placeholder="Ingrese el precio"
          className={cn(
            "w-full px-3 py-2",
            "rounded-lg border border-gray-200 bg-white",
            "focus:outline-none focus:border-gray-300",
            "transition-colors duration-200",
            "placeholder:text-gray-400 text-sm",
            "[appearance:textfield]",
            "[&::-webkit-outer-spin-button]:appearance-none",
            "[&::-webkit-inner-spin-button]:appearance-none"
          )}
        />
      </motion.div>
    );
  };

  // Función para actualizar el estado de pago
  const handlePaymentTypeChange = (type: 'completed' | 'partial' | 'pending') => {
    const newState: PaymentDetails = {
      ...paymentState,
      paymentStatus: type,
      deposit: type === 'completed' ? paymentState.totalAmount : Math.ceil(paymentState.totalAmount * 0.3),
      isPaid: false
    }

    setPaymentState(newState)
    onPaymentChange(newState)
  }

  // Manejador para cambio de depósito
  const handleDepositChange = (value: number) => {
    const newDeposit = Math.min(Math.max(0, value), paymentState.totalAmount)
    const newState: PaymentDetails = {
      ...paymentState,
      deposit: newDeposit,
      paymentStatus: newDeposit === paymentState.totalAmount ? 'completed' : 'partial',
      isPaid: false
    }

    setPaymentState(newState)
    onPaymentChange(newState)
  }

  return (
    <div className="space-y-6">
      {/* Opciones de Pago */}
      <div className="space-y-4">
        <div className="grid gap-3">
          {[
            {
              id: 'pending' as const,
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
              id: 'partial' as const,
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
              id: 'completed' as const,
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
          ].map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: [0.21, 0.68, 0.47, 0.98]
                }
              }}
              onClick={() => handlePaymentTypeChange(option.id)}
              className={cn(
                "relative flex items-center gap-3 p-4 w-full",
                "rounded-xl border transition-all duration-200",
                paymentState.paymentStatus === option.id
                  ? [
                      "border-gray-900/10 bg-gray-50/80"
                    ]
                  : [
                      "border-gray-200 bg-white",
                      "hover:border-gray-300",
                      "hover:bg-gray-50/50"
                    ]
              )}
            >
              {option.icon}
              <div className="flex-1 text-left">
                <p className={cn(
                  "text-sm font-medium",
                  paymentState.paymentStatus === option.id
                    ? "text-gray-900"
                    : "text-gray-700"
                )}>
                  {option.title}
                </p>
                <p className={cn(
                  "text-sm",
                  paymentState.paymentStatus === option.id
                    ? "text-gray-600"
                    : "text-gray-500"
                )}>
                  {option.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {paymentState.paymentStatus === 'partial' && (
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
              min={Math.ceil(paymentState.totalAmount * 0.3)}
              max={paymentState.totalAmount}
              value={paymentState.deposit}
              onChange={(e) => handleDepositChange(Number(e.target.value))}
              className={cn(
                "w-full px-3 py-2",
                "rounded-lg",
                "border border-gray-200",
                "focus:outline-none focus:ring-2 focus:ring-gray-200",
                "transition-all duration-200",
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
        {paymentState.paymentStatus !== 'pending' && (
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
                    const newState: PaymentDetails = {
                      ...paymentState,
                      paymentMethod: id === 'card' ? 'stripe' : id as 'cash' | 'transfer' | 'stripe',
                      isPaid: false
                    }
                    setPaymentState(newState)
                    onPaymentChange(newState)
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

        {renderCustomPriceInput()}
      </div>

      {/* Resumen de pago */}
      {paymentState.paymentStatus !== 'pending' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2"
        >
          {/* Desglose de costos */}
          {selectedCourts.length > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Alquiler de cancha ({reservationDuration} min):</span>
              <span>${courtsPriceTotal}</span>
            </div>
          )}
          
          {selectedRentals.length > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Alquiler de equipamiento:</span>
              <span>${rentalsPriceTotal}</span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>${paymentState.totalAmount}</span>
            </div>
            
            {paymentState.paymentStatus === 'partial' && (
              <>
                <div className="flex justify-between text-sm mt-1">
                  <span>Seña (mínimo 30%):</span>
                  <span>${paymentState.deposit}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Pendiente:</span>
                  <span>${paymentState.totalAmount - paymentState.deposit}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
} 