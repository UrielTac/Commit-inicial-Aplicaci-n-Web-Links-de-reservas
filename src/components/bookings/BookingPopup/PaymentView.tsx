import { useEffect, useState } from 'react'
import type { PaymentStatusEnum, PaymentMethodEnum } from '@/types/database.types'
import type { PaymentDetails, Selection, RentalSelection } from '@/types/bookings'

interface PaymentViewProps {
  selection: Selection
  selectedRentals: RentalSelection[]
  paymentDetails: PaymentDetails
  onPaymentUpdate: (details: Partial<PaymentDetails>) => void
  onViewChange: (view: PopupView) => void
  onConfirmBooking: () => Promise<void>
}

export function PaymentView({ 
  selection, 
  selectedRentals, 
  paymentDetails,
  onPaymentUpdate,
  onViewChange,
  onConfirmBooking
}: PaymentViewProps) {
  // Inicializar estado con valores por defecto más seguros
  const [paymentState, setPaymentState] = useState<PaymentDetails>(() => {
    const total = paymentDetails?.totalAmount || 0
    return {
      totalAmount: total,
      deposit: total, // Siempre inicializar con el total para pago completo
      paymentStatus: 'completed',
      paymentMethod: paymentDetails?.paymentMethod || 'cash'
    }
  })

  // Notificar el estado inicial
  useEffect(() => {
    onPaymentUpdate(paymentState)
  }, []) // Solo al montar el componente

  // Manejar cambios en el monto total
  useEffect(() => {
    if (paymentDetails?.totalAmount !== paymentState.totalAmount) {
      const newTotal = paymentDetails?.totalAmount || 0
      const newState = {
        ...paymentState,
        totalAmount: newTotal,
        // Mantener la consistencia del depósito
        deposit: paymentState.paymentStatus === 'completed' ? newTotal : paymentState.deposit
      }
      
      setPaymentState(newState)
      onPaymentUpdate(newState)
    }
  }, [paymentDetails?.totalAmount])

  // Función para actualizar el estado de pago
  const handlePaymentTypeChange = (type: PaymentStatusEnum) => {
    const newTotal = paymentState.totalAmount
    const newState = {
      ...paymentState,
      paymentStatus: type,
      // Si es pago completo, el depósito DEBE ser igual al total
      deposit: type === 'completed' ? newTotal : Math.ceil(newTotal * 0.3)
    }

    console.log('Actualizando tipo de pago:', {
      type,
      total: newTotal,
      deposit: newState.deposit,
      status: newState.paymentStatus
    })

    setPaymentState(newState)
    onPaymentUpdate(newState)
  }

  // Manejador para cambio de depósito
  const handleDepositChange = (value: number) => {
    const newDeposit = Math.min(Math.max(0, value), paymentState.totalAmount)
    const newState = {
      ...paymentState,
      deposit: newDeposit,
      // Actualizar el estado según el depósito
      paymentStatus: newDeposit === paymentState.totalAmount ? 'completed' : 'partial'
    }

    console.log('Actualizando depósito:', {
      deposit: newDeposit,
      total: paymentState.totalAmount,
      status: newState.paymentStatus
    })

    setPaymentState(newState)
    onPaymentUpdate(newState)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Pago
        </label>
        <div className="flex gap-2">
          {[
            { id: 'completed' as const, label: 'Pago Completo' },
            { id: 'partial' as const, label: 'Seña' }
          ].map(option => (
            <button
              key={option.id}
              onClick={() => handlePaymentTypeChange(option.id)}
              className={`px-4 py-2 rounded-md ${
                paymentState.paymentStatus === option.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {paymentState.paymentStatus === 'partial' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Monto de Seña
          </label>
          <input
            type="number"
            min={Math.ceil(paymentState.totalAmount * 0.3)} // Mínimo 30%
            max={paymentState.totalAmount}
            value={paymentState.deposit}
            onChange={(e) => handleDepositChange(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      )}

      {/* Resumen de pago */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-2">
        <div className="flex justify-between text-sm">
          <span>Precio Total:</span>
          <span className="font-medium">${paymentState.totalAmount}</span>
        </div>
        
        {paymentState.paymentStatus === 'partial' ? (
          <>
            <div className="flex justify-between text-sm">
              <span>Seña (30%):</span>
              <span className="font-medium">${paymentState.deposit}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pendiente:</span>
              <span className="font-medium">
                ${paymentState.totalAmount - paymentState.deposit}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-sm font-medium text-green-600">
            <span>A Pagar:</span>
            <span>${paymentState.totalAmount}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => onViewChange('rentals')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
        >
          Volver
        </button>
        <button
          onClick={onConfirmBooking}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Confirmar Reserva
        </button>
      </div>
    </div>
  )
} 