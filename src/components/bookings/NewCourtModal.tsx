"use client"

import * as React from "react"
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
import { IconTrash, IconChevronDown } from "@tabler/icons-react"
import { CourtPricingConfig } from './CourtPricingConfig'
import { type Court, type SurfaceType, type DurationOption, type CourtPricing } from '@/types/court'

interface NewCourtModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (courtData: Omit<Court, 'id'>) => void
  onDelete?: (id: string) => void
  editingCourt?: Court
  mode?: 'create' | 'edit'
}

const surfaceOptions = [
  { value: 'crystal', label: 'Cristal Panorámico' },
  { value: 'panoramic', label: 'Cristal Premium' },
  { value: 'premium', label: 'Cristal Pro' },
  { value: 'synthetic', label: 'Césped Sintético' },
  { value: 'clay', label: 'Tierra Batida' },
  { value: 'grass', label: 'Césped Natural' },
  { value: 'rubber', label: 'Goma Profesional' },
  { value: 'concrete', label: 'Hormigón Pulido' }
] as const

const defaultPricing: CourtPricing = {
  default: 0,
};

const durationOptions: DurationOption[] = [30, 45, 60, 90, 120];

export function NewCourtModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  editingCourt,
  mode = 'create' 
}: NewCourtModalProps) {
  const [formData, setFormData] = useState<Omit<Court, 'id'>>({
    name: '',
    surface: 'crystal',
    isIndoor: false,
    hasLighting: false,
    isActive: true,
    availableDurations: [60],
    pricing: defaultPricing,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [openSection, setOpenSection] = useState<string>("court")

  useEffect(() => {
    if (editingCourt && mode === 'edit') {
      const { id, ...courtData } = editingCourt
      setFormData(courtData)
    }
  }, [editingCourt, mode])

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false)
    }
  }, [isOpen])

  const handleSave = () => {
    if (!formData.name.trim()) {
      return
    }
    onSave(formData)
    onClose()
  }

  const handleDelete = () => {
    if (editingCourt?.id && onDelete) {
      setShowDeleteConfirm(false)
      setTimeout(() => {
        onDelete(editingCourt.id)
        onClose()
      }, 200)
    }
  }

  const handleSurfaceChange = (value: SurfaceType) => {
    setFormData(prev => ({
      ...prev,
      surface: value
    }))
  }

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? "" : section)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
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
            className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l z-50"
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
                  {mode === 'create' ? 'Agregar Nueva Cancha' : 'Editar Cancha'}
                </motion.h2>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-sm text-gray-500 mt-1"
                >
                  {mode === 'create' 
                    ? 'Complete los datos de la nueva cancha'
                    : 'Modifique los datos de la cancha'}
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
                <div className="p-6 space-y-1">
                  <AccordionItem
                    title="Configuración de Cancha"
                    isOpen={openSection === "court"}
                    onToggle={() => toggleSection("court")}
                  >
                    <div className="space-y-6 pt-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre de la cancha</label>
                        <input
                          type="text"
                          placeholder="Ej: Cancha Principal"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pb-2 border-b border-gray-300 focus:border-black outline-none transition-colors bg-transparent"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo de Superficie</label>
                        <Select
                          value={formData.surface}
                          onValueChange={handleSurfaceChange}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {surfaceOptions.find(opt => opt.value === formData.surface)?.label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {surfaceOptions.map((option) => (
                              <SelectItem 
                                key={option.value} 
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Atributos</h3>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Cancha Techada</label>
                            <p className="text-sm text-gray-500">
                              La cancha está cubierta o bajo techo
                            </p>
                          </div>
                          <Switch
                            checked={formData.isIndoor}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, isIndoor: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Iluminación</label>
                            <p className="text-sm text-gray-500">
                              La cancha cuenta con sistema de iluminación
                            </p>
                          </div>
                          <Switch
                            checked={formData.hasLighting}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, hasLighting: checked }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Duraciones disponibles</h3>
                        <div className="flex flex-wrap gap-2">
                          {durationOptions.map((duration) => (
                            <button
                              key={duration}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  availableDurations: prev.availableDurations.includes(duration)
                                    ? prev.availableDurations.filter(d => d !== duration)
                                    : [...prev.availableDurations, duration]
                                }));
                              }}
                              className={`px-3 py-1 rounded-full text-sm ${
                                formData.availableDurations.includes(duration)
                                  ? 'bg-black text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {duration} min
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    title="Configuración de Precios"
                    isOpen={openSection === "pricing"}
                    onToggle={() => toggleSection("pricing")}
                  >
                    <div className="pt-2">
                      <CourtPricingConfig
                        pricing={formData.pricing}
                        onChange={(pricing) => setFormData(prev => ({ ...prev, pricing }))}
                      />
                    </div>
                  </AccordionItem>
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

          <AnimatePresence>
            {showDeleteConfirm && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-lg z-50 p-6"
                >
                  <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
                  <p className="text-gray-500 mb-6">
                    ¿Está seguro que desea eliminar esta cancha? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

const AccordionItem = ({ title, children, isOpen, onToggle }: AccordionItemProps) => {
  return (
    <div className="border-b">
      <button
        className="w-full py-4 flex items-center justify-between text-left"
        onClick={onToggle}
      >
        <span className="font-medium">{title}</span>
        <IconChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
          marginBottom: isOpen ? 16 : 0
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  )
} 