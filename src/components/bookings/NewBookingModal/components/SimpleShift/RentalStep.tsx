import { useState } from "react"
import { motion } from "framer-motion"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { RentalItem, RentalSelection } from "@/types/rentals"

interface RentalStepProps {
  rentals: RentalSelection[]
  onRentalChange: (rentals: RentalSelection[]) => void
}

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
    name: 'Paleta Intermedia',
    description: 'Paleta ideal para jugadores intermedios',
    price: 1000,
    available: 15,
    category: 'equipment'
  },
  {
    id: '3',
    name: 'Pelotas (Pack x3)',
    description: 'Pack de 3 pelotas de pádel',
    price: 500,
    available: 20,
    category: 'accessories'
  }
]

export function RentalStep({ rentals = [], onRentalChange }: RentalStepProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'equipment' | 'accessories'>('all')

  const filteredItems = selectedCategory === 'all' 
    ? sampleRentalItems 
    : sampleRentalItems.filter(item => item.category === selectedCategory)

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = sampleRentalItems.find(i => i.id === itemId)
    if (!item) return

    const currentSelection = rentals.find(r => r.itemId === itemId)
    const newQuantity = (currentSelection?.quantity || 0) + change

    if (newQuantity < 0 || newQuantity > item.available) return

    if (newQuantity === 0) {
      onRentalChange(rentals.filter(r => r.itemId !== itemId))
    } else {
      const newRentals = rentals.some(r => r.itemId === itemId)
        ? rentals.map(r => r.itemId === itemId ? { ...r, quantity: newQuantity } : r)
        : [...rentals, { itemId, quantity: newQuantity }]
      
      onRentalChange(newRentals)
    }
  }

  const getQuantity = (itemId: string) => {
    return rentals.find(r => r.itemId === itemId)?.quantity || 0
  }

  return (
    <div className="space-y-6">
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
        {filteredItems.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "group relative p-4 rounded-lg border transition-all duration-200",
              getQuantity(item.id) > 0
                ? "bg-gray-50 ring-1 ring-black/5 border-transparent"
                : "bg-white border-gray-200 hover:border-gray-300"
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
                  <div className="flex items-center gap-3 bg-gray-50 rounded-md px-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={getQuantity(item.id) === 0}
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        getQuantity(item.id) > 0
                          ? "text-gray-700 hover:bg-gray-200"
                          : "text-gray-300 cursor-not-allowed"
                      )}
                    >
                      <IconMinus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-900">
                      {getQuantity(item.id)}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      disabled={getQuantity(item.id) === item.available}
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        getQuantity(item.id) < item.available
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

      {/* Resumen del alquiler */}
      {rentals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
        >
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">
              Resumen del Alquiler
            </h4>
            <div className="space-y-2">
              {rentals.map(rental => {
                const item = sampleRentalItems.find(i => i.id === rental.itemId)
                if (!item) return null

                return (
                  <div 
                    key={rental.itemId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {item.name} (x{rental.quantity})
                    </span>
                    <span className="font-medium text-gray-900">
                      ${(item.price * rental.quantity).toLocaleString()}
                    </span>
                  </div>
                )
              })}
              <div className="pt-2 border-t flex justify-between text-sm">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-medium text-gray-900">
                  ${rentals.reduce((total, rental) => {
                    const item = sampleRentalItems.find(i => i.id === rental.itemId)
                    return total + (item?.price || 0) * rental.quantity
                  }, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 