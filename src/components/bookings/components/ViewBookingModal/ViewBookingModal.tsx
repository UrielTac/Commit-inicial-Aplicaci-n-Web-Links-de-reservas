import { motion, AnimatePresence } from "framer-motion"
import { IconClock, IconUsers, IconCash, IconCalendar, IconChevronDown, IconBallTennis, IconPackage } from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useCourts } from "@/hooks/useCourts"
import { useBranchContext } from "@/contexts/BranchContext"
import { timeToMinutes } from "@/lib/time-utils"
import { SelectedBooking } from '@/types/bookings'
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { bookingService } from "@/services/bookingService"
import { toast } from "react-hot-toast"
import { PaymentModal } from "../PaymentModal/PaymentModal"
import { Button } from "@/components/ui/button"

interface ViewBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: SelectedBooking | null
}

// Funciones helper
const formatTime = (time: string) => {
  return time.split(':').slice(0, 2).join(':')
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'text-green-600 ring-green-600/20 bg-green-50'
    case 'partial':
      return 'text-yellow-600 ring-yellow-600/20 bg-yellow-50'
    case 'pending':
      return 'text-gray-600 ring-gray-600/20 bg-gray-50'
    default:
      return 'text-gray-600 ring-gray-600/20 bg-gray-50'
  }
}

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'Completado'
    case 'partial':
      return 'Señado'
    case 'pending':
      return 'Pendiente'
    default:
      return 'Pendiente'
  }
}

interface CollapsibleSectionProps {
  icon: React.ReactNode
  title: string
  count?: number
  children: React.ReactNode
}

function CollapsibleSection({ icon, title, count, children }: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="text-sm text-gray-500">{count}</span>
          )}
          <IconChevronDown 
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform duration-200",
              isExpanded && "transform rotate-180"
            )}
            stroke={1.5}
          />
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pl-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 1. Modificar la función helper para formatear precios
const formatPrice = (amount: number | undefined | null) => {
  if (typeof amount !== 'number') return '0,00 €'
  
  try {
    return amount.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } catch (error) {
    console.error('Error formateando precio:', error)
    return '0,00 €'
  }
}

function PaymentDetails({ 
  total, 
  deposit, 
  paymentMethod, 
  status,
  onNewPayment
}: { 
  total: number
  deposit: number
  paymentMethod: string
  status: string
  onNewPayment: (amount: number, method: string) => void
}) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const formatPaymentMethod = (method: string) => {
    if (!method) return 'No especificado'
    const methods: Record<string, string> = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia',
      'stripe': 'Stripe'
    }
    return methods[method.toLowerCase()] || method.charAt(0).toUpperCase() + method.slice(1)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 pt-3 border-t">
        {/* Total */}
        <div className="flex justify-between text-sm font-medium">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">{formatPrice(total)}</span>
        </div>

        {/* Monto Depositado */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Monto depositado</span>
          <span className="text-gray-900">{formatPrice(deposit)}</span>
        </div>

        {/* Método de Pago */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Método de pago</span>
          <span className="text-gray-700">
            {formatPaymentMethod(paymentMethod)}
          </span>
        </div>

        {/* Estado */}
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-500">Estado</span>
          <span className={cn(
            "px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset",
            getStatusColor(status)
          )}>
            {getStatusText(status)}
          </span>
        </div>

        {/* Botón de Registrar Resto */}
        {status === 'partial' && (
          <Button
            onClick={() => setShowPaymentModal(true)}
            variant="outline"
            className="w-full mt-4 border-dashed hover:border-solid transition-all duration-200"
          >
            Registrar Resto
          </Button>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={onNewPayment}
        remainingAmount={total - deposit}
      />
    </div>
  )
}

export function ViewBookingModal({ isOpen, onClose, booking }: ViewBookingModalProps) {
  const { currentBranch } = useBranchContext()
  const { data: courts = [] } = useCourts({ branchId: currentBranch?.id })
  const [showHistory, setShowHistory] = useState(false)

  // Procesamiento de datos mejorado
  const processedData = useMemo(() => {
    if (!booking) return null

    console.log('Datos originales de la reserva:', booking)

    // Encontrar el nombre de la pista
    const court = courts.find(c => c.id === booking.court)
    const courtName = court ? court.name : booking.court

    // Validación y procesamiento de participantes
    const participants = Array.isArray(booking.participants) ? booking.participants : []

    // Procesamiento de datos mejorado
    const processedResult = {
      courtName,
      hasValidParticipants: participants.length > 0,
      participants,
      formatParticipantName: (participant: any): string => {
        if (!participant) return 'Usuario no registrado'
        const firstName = participant.first_name || ''
        const lastName = participant.last_name || ''
        return `${firstName} ${lastName}`.trim() || 'Usuario no registrado'
      },
      getInitial: (participant: any): string => {
        if (!participant || !participant.first_name) return 'U'
        return participant.first_name.charAt(0).toUpperCase()
      },
      durationInMinutes: timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime),
      courtPrice: booking.price ?? 0,
      rentalsTotal: booking.rentedItems?.reduce((total, item) => 
        total + (item.pricePerUnit * item.quantity), 0) ?? 0,
      totalAmount: booking.totalAmount ?? 0,
      depositAmount: booking.depositAmount ?? 0,
      paymentMethod: booking.paymentMethod ?? '',
      paymentStatus: booking.paymentStatus ?? 'pending',
      statusHistory: booking.statusHistory ?? []
    }

    // Debug de los datos procesados
    console.log('Datos procesados en ViewBookingModal:', {
      original: {
        depositAmount: booking.depositAmount,
        paymentMethod: booking.paymentMethod
      },
      processed: {
        depositAmount: processedResult.depositAmount,
        paymentMethod: processedResult.paymentMethod
      }
    })

    return processedResult
  }, [booking, courts])

  if (!booking || !processedData) return null

  const handleNewPayment = async (amount: number, method: string) => {
    try {
      console.log('ViewBookingModal - Recibiendo datos:', { amount, method, bookingId: booking.id })
      
      // Convertir el método de pago al formato correcto
      const paymentMethod = method === 'card' ? 'stripe' : method

      console.log('ViewBookingModal - Enviando a bookingService:', {
        amount,
        paymentType: 'remaining',
        paymentMethod,
        bookingId: booking.id
      })

      const result = await bookingService.addPayment(booking.id, {
        amount,
        paymentType: 'remaining',
        paymentMethod,
        notes: `Pago complementario - ${new Date().toLocaleDateString()}`
      })

      console.log('ViewBookingModal - Respuesta del servicio:', result)

      if (result.data) {
        toast.success('Pago registrado correctamente')
        onClose() // Cerrar el modal principal para refrescar
      } else {
        throw new Error('No se recibió confirmación del pago')
      }
    } catch (error: any) {
      console.error('Error al procesar el pago:', error)
      toast.error(error.message || 'Error al procesar el pago')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ 
              x: "100%", 
              opacity: 0,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l z-50"
          >
            <div className="h-full flex flex-col">
              {/* Encabezado */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="p-6 border-b"
              >
                <h2 className="text-xl font-semibold">Detalles de la Reservación</h2>
              </motion.div>

              {/* Contenido Principal */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-6 space-y-8">
                  {/* Nueva sección de resumen */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="rounded-lg bg-gray-50/80 p-4 border border-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-x-2">
                          {/* Columna izquierda: Solo Usuario */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-gray-900">
                                  {processedData.getInitial(processedData.participants[0])}
                                </span>
                              </div>
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {processedData.formatParticipantName(processedData.participants[0])}
                              </h3>
                            </div>
                            
                            {/* Lista de participantes adicionales */}
                            {processedData.hasValidParticipants && processedData.participants.length > 1 && (
                              <div className="mt-2 text-xs text-gray-500 space-y-1">
                                {processedData.participants.slice(1).map((participant, index) => (
                                  <div key={index} className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-600">
                                        {processedData.getInitial(participant)}
                                      </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {processedData.formatParticipantName(participant)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Columna derecha: Solo Fecha y Horario */}
                          <div className="text-right pt-1">
                            <p className="text-xs font-medium text-gray-700">
                              {format(new Date(booking.date), "dd 'de' MMMM, yyyy", { locale: es })}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Detalles principales */}
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm space-y-4"
                  >
                    {/* Sección de Pistas */}
                    <CollapsibleSection
                      icon={<IconBallTennis className="h-5 w-5 text-gray-400" />}
                      title="Pistas"
                      count={1}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            {processedData.courtName} ({processedData.durationInMinutes} min)
                          </span>
                          <span className="text-gray-900">
                            {formatPrice(processedData.courtPrice)}
                          </span>
                        </div>
                      </div>
                    </CollapsibleSection>

                    {/* Sección de Participantes */}
                    <CollapsibleSection
                      icon={<IconUsers className="h-5 w-5 text-gray-400" />}
                      title="Participantes"
                      count={processedData.participants.length}
                    >
                      <div className="space-y-2">
                        {processedData.hasValidParticipants ? (
                          processedData.participants.map((participant, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {processedData.getInitial(participant)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {processedData.formatParticipantName(participant)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No hay participantes registrados</p>
                        )}
                      </div>
                    </CollapsibleSection>

                    {/* Sección de Ítems - Siempre visible */}
                    <CollapsibleSection
                      icon={<IconPackage className="h-5 w-5 text-gray-400" />}
                      title="Ítems Alquilados"
                      count={booking.rentedItems?.length || 0}
                    >
                      <div className="space-y-2">
                        {booking.rentedItems && booking.rentedItems.length > 0 ? (
                          <>
                            {booking.rentedItems.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                  {item.name} (x{item.quantity})
                                </span>
                                <span className="text-gray-900">
                                  {formatPrice(item.pricePerUnit * item.quantity)}
                                </span>
                              </div>
                            ))}
                            <div className="pt-2 border-t flex justify-between text-sm font-medium">
                              <span className="text-gray-900">Total Ítems</span>
                              <span className="text-gray-900">
                                {formatPrice(processedData.rentalsTotal)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">No hay ítems alquilados</p>
                        )}
                      </div>
                    </CollapsibleSection>

                    {/* Detalles de Pago */}
                    <PaymentDetails
                      total={processedData.totalAmount}
                      deposit={processedData.depositAmount}
                      paymentMethod={processedData.paymentMethod}
                      status={processedData.paymentStatus}
                      onNewPayment={handleNewPayment}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Pie del Modal */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="p-6 border-t bg-white"
              >
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors duration-200"
                >
                  Cerrar
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 