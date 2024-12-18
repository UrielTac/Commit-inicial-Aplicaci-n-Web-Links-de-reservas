import { useState, useEffect } from 'react'
import { IconPlus, IconMinus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useItems } from '@/hooks/useItems'
import { useBranchContext } from '@/contexts/BranchContext'
import { toast } from 'react-hot-toast'
import { Spinner } from '@/components/ui/spinner'
import type { Item, RentalSelection } from '@/types/items'

interface RentalsViewProps {
  onNext: () => void
  onBack: () => void
  selectedRentals: RentalSelection[]
  onRentalsChange: (rentals: RentalSelection[]) => void
}

export function RentalsView({
  onNext,
  onBack,
  selectedRentals,
  onRentalsChange
}: RentalsViewProps) {
  const { currentBranch } = useBranchContext()
  const [localRentals, setLocalRentals] = useState<RentalSelection[]>(selectedRentals)

  const { data: items = [], isLoading, error } = useItems(currentBranch?.id, {
    onError: (error) => {
      toast.error(`Error al cargar artículos: ${error.message}`)
    }
  })

  // Función para calcular el precio base de un artículo
  const calculateBasePrice = (item: Item): number => {
    if (!item.duration_pricing) return 0
    const defaultDuration = item.default_duration || 60
    return item.duration_pricing[defaultDuration.toString()] || 0
  }

  useEffect(() => {
    // Sincronizar cambios locales con el estado padre
    onRentalsChange(localRentals)
  }, [localRentals, onRentalsChange])

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
            ? { ...r, quantity: newQuantity, pricePerUnit: calculateBasePrice(item) }
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
          pricePerUnit: calculateBasePrice(item)
        }]
      }

      return prev
    })
  }

  const getQuantityForItem = (itemId: string) => {
    return localRentals.find(r => r.itemId === itemId)?.quantity || 0
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
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        {items.map((item) => {
          const basePrice = calculateBasePrice(item)
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm"
            >
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium">{basePrice}€</span>
                  <span className="text-xs text-gray-500">
                    Stock: {item.stock}
                  </span>
                  {item.requires_deposit && (
                    <span className="text-xs text-amber-600">
                      Depósito: {item.deposit_amount}€
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(item.id, -1)}
                  disabled={getQuantityForItem(item.id) === 0}
                >
                  <IconMinus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">
                  {getQuantityForItem(item.id)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(item.id, 1)}
                  disabled={getQuantityForItem(item.id) >= item.stock}
                >
                  <IconPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  )
} 