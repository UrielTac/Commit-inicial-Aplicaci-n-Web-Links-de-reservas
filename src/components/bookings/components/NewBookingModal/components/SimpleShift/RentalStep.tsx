import { useState, useEffect, useMemo, useCallback } from 'react'
import { IconPlus, IconMinus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useItems } from '@/hooks/useItems'
import { useBranchContext } from '@/contexts/BranchContext'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import type { Item, RentalSelection } from '@/types/items'
import { cn } from "@/lib/utils"
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { timeToMinutes } from '@/lib/time-utils'

interface RentalStepProps {
  rentals: RentalSelection[]
  onRentalChange: (rentals: RentalSelection[]) => void
  startTime?: string
  endTime?: string
  duration?: number
}

export function RentalStep({ 
  rentals = [], 
  onRentalChange,
  startTime,
  endTime,
  duration: propDuration
}: RentalStepProps) {
  const { currentBranch } = useBranchContext()
  const [localRentals, setLocalRentals] = useState<RentalSelection[]>(rentals)
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({})

  // Calcular la duración actual de la reserva
  const currentDuration = useMemo(() => {
    // Si tenemos una duración proporcionada, usarla directamente
    if (propDuration !== undefined) {
      console.log('Usando duración proporcionada:', {
        propDuration,
        startTime,
        endTime
      })
      return propDuration
    }

    // Si no hay tiempos definidos, intentar calcular desde startTime y endTime
    if (!startTime || !endTime) {
      console.log('Tiempos no definidos:', { startTime, endTime })
      return 0
    }

    try {
      const start = timeToMinutes(startTime)
      const end = timeToMinutes(endTime)
      const calculatedDuration = Math.max(0, end - start)

      console.log('Cálculo de duración desde tiempos:', {
        startTime,
        endTime,
        startMinutes: start,
        endMinutes: end,
        calculatedDuration
      })

      return calculatedDuration
    } catch (error) {
      console.error('Error calculando duración:', error)
      return 0
    }
  }, [startTime, endTime, propDuration])

  const { data: items = [], isLoading, error } = useItems(currentBranch?.id)

  // Verificar si un item tiene precio configurado
  const hasConfiguredPrice = useCallback((item: Item): boolean => {
    if (!item.duration_pricing || !currentDuration) {
      console.log('No hay duration_pricing o duración:', {
        itemName: item.name,
        hasDurationPricing: !!item.duration_pricing,
        currentDuration,
        durationPricingKeys: item.duration_pricing ? Object.keys(item.duration_pricing) : []
      })
      return false
    }

    // Convertir las duraciones a números y verificar si existe la duración actual
    const availableDurations = Object.keys(item.duration_pricing)
      .map(Number)
      .sort((a, b) => a - b)

    const durationKey = currentDuration.toString()
    const price = item.duration_pricing[durationKey]
    const hasExactPrice = price !== undefined && Number(price) > 0

    console.log('Verificación de precio configurado:', {
      itemName: item.name,
      currentDuration,
      durationKey,
      price,
      priceType: typeof price,
      hasExactPrice,
      availableDurations,
      allPrices: item.duration_pricing
    })

    return hasExactPrice
  }, [currentDuration])

  // Función para calcular el precio base de un artículo
  const calculateBasePrice = useCallback((item: Item): number => {
    // Si hay un precio personalizado para este item, usarlo
    if (customPrices[item.id] !== undefined) {
      console.log('Usando precio personalizado:', {
        itemName: item.name,
        customPrice: customPrices[item.id]
      })
      return customPrices[item.id]
    }

    // Si no hay duración o precios configurados, retornar 0
    if (!item.duration_pricing || !currentDuration) {
      console.log('No hay duration_pricing o duración para precio base:', {
        itemName: item.name,
        hasDurationPricing: !!item.duration_pricing,
        currentDuration,
        durationPricingKeys: item.duration_pricing ? Object.keys(item.duration_pricing) : []
      })
      return 0
    }

    // Obtener el precio exacto para la duración actual
    const durationKey = currentDuration.toString()
    const price = item.duration_pricing[durationKey]
    const configuredPrice = Number(price)

    console.log('Cálculo de precio base:', {
      itemName: item.name,
      currentDuration,
      durationKey,
      price,
      priceType: typeof price,
      configuredPrice,
      isValidPrice: !isNaN(configuredPrice) && configuredPrice > 0,
      allPrices: item.duration_pricing,
      availableDurations: Object.keys(item.duration_pricing).map(Number).sort((a, b) => a - b)
    })

    return !isNaN(configuredPrice) && configuredPrice > 0 ? configuredPrice : 0
  }, [currentDuration, customPrices])

  // Renderizar el input de precio personalizado
  const renderCustomPriceInput = (item: Item, duration: number, basePrice: number, hasConfigured: boolean) => {
    const showCustomPrice = !hasConfigured

    console.log('Renderizando input de precio:', {
      itemName: item.name,
      duration,
      basePrice,
      hasConfigured,
      showCustomPrice,
      currentDuration,
      availablePrices: item.duration_pricing
    })

    if (!showCustomPrice) return null

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-2"
      >
        <Label className="text-xs text-gray-600">
          {duration > 0 
            ? `Precio por ${duration} minutos`
            : 'Precio no disponible - Duración no válida'}
        </Label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={customPrices[item.id] || ''}
          onChange={(e) => {
            const value = parseFloat(e.target.value)
            handleCustomPriceChange(item.id, isNaN(value) ? null : value)
          }}
          placeholder={hasConfigured ? `Precio actual: ${basePrice}€` : "Ingrese el precio"}
          className={cn(
            "mt-1 w-32 px-2 py-1",
            "rounded-md border border-gray-200 bg-white",
            "focus:outline-none focus:border-gray-300",
            "transition-colors duration-200",
            "placeholder:text-gray-400 text-sm",
            "[appearance:textfield]",
            "[&::-webkit-outer-spin-button]:appearance-none",
            "[&::-webkit-inner-spin-button]:appearance-none"
          )}
          disabled={duration === 0}
        />
      </motion.div>
    )
  }

  useEffect(() => {
    console.log('Estado actual de RentalStep:', {
      currentDuration,
      startTime,
      endTime,
      propDuration,
      rentalsCount: localRentals.length,
      itemsCount: items.length
    })
  }, [currentDuration, startTime, endTime, propDuration, localRentals, items])

  useEffect(() => {
    if (!currentDuration) {
      console.log('No hay duración válida para actualizar rentals')
      return
    }

    // Sincronizar cambios locales con el estado padre
    const rentalsWithPrices = localRentals.map(rental => {
      const item = items.find(i => i.id === rental.itemId)
      if (!item) return rental

      const basePrice = calculateBasePrice(item)
      const hasConfigured = hasConfiguredPrice(item)

      console.log('Actualizando rental:', {
        itemName: item.name,
        duration: currentDuration,
        basePrice,
        hasConfiguredPrice: hasConfigured,
        customPrice: customPrices[item.id],
        availableDurations: Object.keys(item.duration_pricing || {}).map(Number).sort((a, b) => a - b)
      })

      return {
        ...rental,
        duration: currentDuration,
        pricePerUnit: basePrice
      }
    })

    onRentalChange(rentalsWithPrices)
  }, [localRentals, items, onRentalChange, currentDuration, calculateBasePrice, hasConfiguredPrice, customPrices])

  const handleQuantityChange = (itemId: string, change: number) => {
    setLocalRentals(prev => {
      const existingRental = prev.find(r => r.itemId === itemId)
      const item = items.find(i => i.id === itemId)
      
      if (!item) return prev

      if (existingRental) {
        const newQuantity = Math.max(0, existingRental.quantity + change)
        
        // Verificar stock disponible
        if (change > 0 && newQuantity > item.stock) {
          toast.error('No hay suficiente stock disponible')
          return prev
        }

        if (newQuantity === 0) {
          return prev.filter(r => r.itemId !== itemId)
        }

        return prev.map(r =>
          r.itemId === itemId
            ? { 
                ...r, 
                quantity: newQuantity,
                duration: currentDuration
              }
            : r
        )
      }

      if (change > 0) {
        // Verificar stock antes de agregar
        if (item.stock < 1) {
          toast.error('No hay stock disponible')
          return prev
        }
        return [...prev, { 
          itemId, 
          quantity: 1,
          duration: currentDuration
        }]
      }

      return prev
    })
  }

  const handleCustomPriceChange = (itemId: string, value: number | null) => {
    setCustomPrices(prev => ({
      ...prev,
      [itemId]: value || 0
    }))
  }

  const getQuantityForItem = (itemId: string) => {
    return localRentals.find(r => r.itemId === itemId)?.quantity || 0
  }

  // Calcular el total de los alquileres
  const calculateTotal = () => {
    return localRentals.reduce((total, rental) => {
      const item = items.find(i => i.id === rental.itemId)
      if (!item) return total
      const basePrice = calculateBasePrice(item)
      return total + (basePrice * rental.quantity)
    }, 0)
  }

  if (!currentBranch) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 mb-4">
          Selecciona una sede para ver los artículos disponibles
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner className="w-8 h-8" />
        <p className="text-sm text-gray-500 mt-2">Cargando artículos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-500 mb-4">
          {error instanceof Error ? error.message : 'Error al cargar los artículos'}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 mb-4">
          No hay artículos disponibles en esta sede
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lista de artículos */}
      <div className="space-y-4">
        {items.map((item) => {
          const rental = localRentals.find(r => r.itemId === item.id)
          const duration = currentDuration || 0
          const basePrice = calculateBasePrice(item)
          const hasConfigured = hasConfiguredPrice(item)

          return (
            <div
              key={item.id}
              className={cn(
                "group relative p-4 rounded-lg border transition-all duration-200",
                getQuantityForItem(item.id) > 0
                  ? "bg-gray-50 ring-1 ring-black/5 border-transparent"
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Información del artículo */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Stock: {item.stock}
                    </span>
                    {item.requires_deposit && (
                      <span className="text-xs text-amber-600">
                        Depósito: {item.deposit_amount}€
                      </span>
                    )}
                  </div>

                  {renderCustomPriceInput(item, duration, basePrice, hasConfigured)}
                </div>

                {/* Precio centrado */}
                <div className="flex items-center px-4">
                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {basePrice > 0 ? `${basePrice}€` : 'Sin precio'}
                  </span>
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(item.id, -1)}
                    disabled={getQuantityForItem(item.id) === 0}
                    className={cn(
                      "h-8 w-8",
                      getQuantityForItem(item.id) === 0 && "opacity-50"
                    )}
                  >
                    <IconMinus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {getQuantityForItem(item.id)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(item.id, 1)}
                    disabled={getQuantityForItem(item.id) >= item.stock}
                    className={cn(
                      "h-8 w-8",
                      getQuantityForItem(item.id) >= item.stock && "opacity-50"
                    )}
                  >
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen de alquileres mejorado */}
      {localRentals.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Resumen del Alquiler
            </h4>
            <div className="space-y-3">
              {localRentals.map(rental => {
                const item = items.find(i => i.id === rental.itemId)
                if (!item) return null
                const basePrice = calculateBasePrice(item)

                return (
                  <div 
                    key={rental.itemId}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        x{rental.quantity}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {(basePrice * rental.quantity).toFixed(2)}€
                    </span>
                  </div>
                )
              })}
              <div className="pt-3 border-t border-gray-200 flex justify-between text-sm">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-medium text-gray-900">
                  {calculateTotal().toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 