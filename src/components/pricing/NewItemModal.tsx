"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-3"
import { Input } from "@/components/ui/input"
import { IconChevronDown, IconTrash, IconPlus } from "@tabler/icons-react"
import { type Item } from '@/types/items'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SingleSelect } from "@/components/ui/single-select"

// Definimos las opciones de tipo de artículo
const itemTypeOptions = [
  { id: 'equipment', name: 'Equipamiento' },
  { id: 'accessory', name: 'Accesorio' },
  { id: 'consumable', name: 'Consumible' }
] as const

// Opciones de duración en minutos
const durationOptions = [15, 30, 45, 60, 90, 120] as const
type Duration = typeof durationOptions[number]

// Actualizamos la interfaz Item para manejar precios por duración
interface PricingByDuration {
  [duration: number]: number // duración en minutos: precio
}

// Extendemos la interfaz Item en types/items.ts
interface ItemFormData extends Omit<Item, 'id' | 'pricing'> {
  prices: PriceEntry[]
}

interface NewItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (itemData: Omit<Item, 'id'>) => void
  onDelete?: (id: string) => void
  editingItem?: Item
  mode?: 'create' | 'edit'
}

interface PriceEntry {
  duration: number
  price: number
}

export function NewItemModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingItem,
  mode = 'create'
}: NewItemModalProps) {
  const [mounted, setMounted] = React.useState(false)

  // Estado inicial por defecto
  const defaultFormData: ItemFormData = {
    name: '',
    type: 'equipment',
    prices: [{ duration: 60, price: 0 }],
    stock: 0,
    requiresDeposit: false,
    depositAmount: 0,
    isActive: true,
    defaultDuration: 60
  }

  const [formData, setFormData] = useState<ItemFormData>(defaultFormData)

  // Efecto para manejar el montaje
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Efecto para cargar datos de edición o reiniciar al cerrar
  useEffect(() => {
    if (isOpen) {
      if (editingItem && mode === 'edit') {
        // Convertir el pricing object a array de prices para edición
        const prices = Object.entries(editingItem.pricing).map(([duration, price]) => ({
          duration: Number(duration),
          price
        }))
        
        setFormData({
          name: editingItem.name,
          type: editingItem.type,
          prices,
          stock: editingItem.stock,
          requiresDeposit: editingItem.requiresDeposit,
          depositAmount: editingItem.depositAmount || 0,
          isActive: editingItem.isActive,
          defaultDuration: editingItem.defaultDuration
        })
      }
    } else {
      // Reiniciar el formulario cuando se cierra el modal
      setFormData(defaultFormData)
    }
  }, [isOpen, editingItem, mode])

  const handleAddPrice = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { duration: 30, price: 0 }]
    }))
  }

  const handleRemovePrice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index)
    }))
  }

  const handlePriceChange = (index: number, field: keyof PriceEntry, value: number) => {
    setFormData(prev => ({
      ...prev,
      prices: prev.prices.map((price, i) => 
        i === index ? { ...price, [field]: value } : price
      )
    }))
  }

  const handleSave = () => {
    if (!formData.name.trim()) return

    // Convertir el array de precios a objeto pricing
    const pricing = formData.prices.reduce((acc, { duration, price }) => ({
      ...acc,
      [duration]: price
    }), {})

    onSave({
      ...formData,
      pricing
    })
    onClose()
  }

  const renderPricingSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Precios por duración</label>
        <Button
          onClick={handleAddPrice}
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-3",
            "border border-gray-200",
            "text-gray-600 text-xs",
            "bg-white hover:bg-gray-50",
            "transition-all duration-200",
            "flex items-center gap-1.5",
            "shadow-sm",
            "hover:border-gray-300"
          )}
        >
          <IconPlus className="h-3.5 w-3.5" stroke={1.5} />
          <span>Añadir precio</span>
        </Button>
      </div>

      <div className="space-y-3">
        {formData.prices.map((price, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3"
          >
            <div className="flex-1 grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  value={price.duration}
                  onChange={(e) => handlePriceChange(index, 'duration', Number(e.target.value))}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    "border border-gray-200 bg-white",
                    "focus:outline-none focus:border-gray-300",
                    "transition-colors duration-200",
                    "placeholder:text-gray-400",
                    "text-sm",
                    "[appearance:textfield]",
                    "[&::-webkit-outer-spin-button]:appearance-none",
                    "[&::-webkit-inner-spin-button]:appearance-none"
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Precio (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price.price}
                  onChange={(e) => handlePriceChange(index, 'price', Number(e.target.value))}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    "border border-gray-200 bg-white",
                    "focus:outline-none focus:border-gray-300",
                    "transition-colors duration-200",
                    "placeholder:text-gray-400",
                    "text-sm",
                    "[appearance:textfield]",
                    "[&::-webkit-outer-spin-button]:appearance-none",
                    "[&::-webkit-inner-spin-button]:appearance-none"
                  )}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemovePrice(index)}
              className={cn(
                "h-9 w-9",
                "text-gray-400 hover:text-red-500",
                "hover:bg-red-50",
                "transition-colors duration-200",
                "rounded-lg"
              )}
              disabled={formData.prices.length === 1}
            >
              <IconTrash className="h-4 w-4" stroke={1.5} />
            </Button>
          </motion.div>
        ))}
      </div>

      {formData.prices.length > 1 && (
        <p className="text-xs text-gray-500 italic">
          * Los precios se ordenarán automáticamente por duración
        </p>
      )}
    </div>
  )

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 9998
            }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
          />
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
            className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l"
            style={{ zIndex: 9999 }}
          >
            <div className="h-full flex flex-col">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.1,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className="p-6 border-b"
              >
                <motion.h2 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="text-xl font-semibold"
                >
                  {mode === 'create' ? 'Agregar Nuevo Artículo' : 'Editar Artículo'}
                </motion.h2>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-sm text-gray-500 mt-1"
                >
                  {mode === 'create' 
                    ? 'Complete los datos del nuevo artículo'
                    : 'Modifique los datos del artículo'}
                </motion.p>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.3,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-6 space-y-6">
                  {/* Nombre del artículo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nombre del artículo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Raqueta Pro"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg",
                        "border border-gray-200 bg-white",
                        "focus:outline-none focus:border-gray-300",
                        "transition-colors duration-200",
                        "placeholder:text-gray-400",
                        "text-sm"
                      )}
                    />
                  </div>

                  {/* Tipo de artículo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tipo de artículo
                    </label>
                    <SingleSelect
                      value={formData.type}
                      onChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        type: value 
                      }))}
                      options={itemTypeOptions}
                      placeholder="Seleccionar tipo de artículo"
                    />
                  </div>

                  {/* Stock disponible */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Stock disponible
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Cantidad disponible"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        stock: Number(e.target.value) 
                      }))}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg",
                        "border border-gray-200 bg-white",
                        "focus:outline-none focus:border-gray-300",
                        "transition-colors duration-200",
                        "placeholder:text-gray-400",
                        "text-sm",
                        "[appearance:textfield]",
                        "[&::-webkit-outer-spin-button]:appearance-none",
                        "[&::-webkit-inner-spin-button]:appearance-none"
                      )}
                    />
                  </div>

                  {/* Depósito */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Requiere depósito</label>
                        <p className="text-sm text-gray-500">
                          El cliente deberá dejar un depósito como garantía
                        </p>
                      </div>
                      <Switch
                        checked={formData.requiresDeposit}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, requiresDeposit: checked }))
                        }
                      />
                    </div>

                    {formData.requiresDeposit && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Monto del depósito
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Ingrese el monto del depósito"
                          value={formData.depositAmount}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            depositAmount: Number(e.target.value) 
                          }))}
                          className={cn(
                            "w-full px-3 py-2 rounded-lg",
                            "border border-gray-200 bg-white",
                            "focus:outline-none focus:border-gray-300",
                            "transition-colors duration-200",
                            "placeholder:text-gray-400",
                            "text-sm",
                            "[appearance:textfield]",
                            "[&::-webkit-outer-spin-button]:appearance-none",
                            "[&::-webkit-inner-spin-button]:appearance-none"
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Sección de precios */}
                  {renderPricingSection()}
                </div>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="p-6 border-t bg-white"
              >
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="flex-1 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    {mode === 'create' ? 'Guardar' : 'Actualizar'}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (!mounted) return null

  return createPortal(
    modalContent,
    document.body
  )
} 