import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { IconCreditCard, IconClock, IconCash, IconBuildingBank } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface PaymentStepProps {
  totalAmount: number
  selectedMethods: ('cash' | 'card' | 'transfer')[]
  onMethodsChange: (methods: ('cash' | 'card' | 'transfer')[]) => void
  onValidationChange: (isValid: boolean) => void
}

const paymentOptions = [
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
] as const

const paymentMethods = [
  {
    id: 'cash' as const,
    name: 'Efectivo'
  },
  {
    id: 'card' as const,
    name: 'Mercado Pago'
  },
  {
    id: 'transfer' as const,
    name: 'Transferencia'
  }
] as const

export function PaymentStep({ 
  totalAmount, 
  selectedMethods = [],
  onMethodsChange,
  onValidationChange
}: PaymentStepProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'completed'>('pending')
  const [deposit, setDeposit] = useState(0)

  // Validar el estado del paso y notificar cambios inmediatamente
  useEffect(() => {
    const isValid = 
      // Reserva Simple siempre es válida
      paymentStatus === 'pending' ||
      // Para Seña/Anticipo o Pago Completo, necesita al menos un método de pago
      ((paymentStatus === 'partial' || paymentStatus === 'completed') && selectedMethods.length > 0)

    // Notificar el cambio de validación inmediatamente
    onValidationChange(isValid)
  }, [paymentStatus, selectedMethods, onValidationChange])

  const handlePaymentOptionSelect = (option: typeof paymentOptions[number]['id']) => {
    switch (option) {
      case 'simple':
        setPaymentStatus('pending')
        setDeposit(0)
        onMethodsChange([]) // Limpiar métodos al seleccionar Reserva Simple
        break
      case 'deposit':
        setPaymentStatus('partial')
        setDeposit(Math.ceil(totalAmount * 0.3))
        break
      case 'full':
        setPaymentStatus('completed')
        setDeposit(totalAmount)
        break
    }
  }

  const toggleMethod = (methodId: 'cash' | 'card' | 'transfer') => {
    if (selectedMethods.includes(methodId)) {
      onMethodsChange(selectedMethods.filter(m => m !== methodId))
    } else {
      onMethodsChange([...selectedMethods, methodId])
    }
  }

  return (
    <div className="space-y-6">
      {/* Opciones de Pago */}
      <div className="space-y-4">
        <div className="grid gap-3">
          {paymentOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => handlePaymentOptionSelect(option.id)}
              className={cn(
                "group relative w-full px-4 py-3.5 rounded-lg border transition-all duration-200",
                "hover:bg-gray-50/50",
                paymentStatus === (option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed')
                  ? "bg-gray-50 ring-1 ring-black/5 border-transparent"
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-4">
                {option.icon}
                <div className="flex-1 text-left">
                  <h3 className={cn(
                    "font-medium transition-colors text-[15px]",
                    paymentStatus === (option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed')
                      ? "text-gray-900"
                      : "text-gray-700"
                  )}>
                    {option.title}
                  </h3>
                  <p className={cn(
                    "text-sm transition-colors",
                    paymentStatus === (option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed')
                      ? "text-gray-600"
                      : "text-gray-500"
                  )}>
                    {option.description}
                  </p>
                </div>

                <div className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  paymentStatus === (option.id === 'simple' ? 'pending' : option.id === 'deposit' ? 'partial' : 'completed')
                    ? "bg-black scale-110"
                    : "bg-gray-300"
                )} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Campos adicionales según el tipo de pago seleccionado */}
      {paymentStatus !== 'pending' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6"
        >
          {/* Métodos de pago */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Métodos de pago aceptados
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => toggleMethod(method.id)}
                  className={cn(
                    "relative py-3 px-4 rounded-lg text-sm border transition-all duration-300",
                    "hover:shadow-sm hover:border-gray-300 hover:bg-gradient-to-b hover:from-white hover:to-gray-50/80",
                    selectedMethods.includes(method.id)
                      ? "bg-gradient-to-b from-gray-50 to-gray-50/50 border-gray-300 text-gray-900 font-medium shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] transition-colors duration-500 ease-in-out"
                      : "bg-white border-gray-200 text-gray-600 transition-colors duration-500 ease-in-out"
                  )}
                >
                  <div className="relative z-10">
                    {method.name}
                  </div>
                  {selectedMethods.includes(method.id) && (
                    <motion.div
                      layoutId={`selected-${method.id}`}
                      className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-50/50 rounded-lg"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Monto de seña */}
          {paymentStatus === 'partial' && (
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
                  value={deposit}
                  onChange={(e) => setDeposit(Math.min(totalAmount, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full pl-7 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-medium text-gray-900">
                ${totalAmount.toLocaleString()}
              </span>
            </div>
            {paymentStatus === 'partial' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Seña</span>
                  <span className="font-medium text-gray-900">
                    ${deposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Restante</span>
                  <span className="font-medium text-gray-900">
                    ${(totalAmount - deposit).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {paymentStatus !== 'pending' && selectedMethods.length === 0 && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] text-gray-400 text-center"
        >
          Selecciona al menos un método de pago para continuar
        </motion.p>
      )}
    </div>
  )
} 