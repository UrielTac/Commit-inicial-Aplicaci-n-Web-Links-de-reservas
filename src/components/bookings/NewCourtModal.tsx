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
import { SingleSelect } from "@/components/ui/single-select"
import { cn } from "@/lib/utils"
import { CategoryMultiSelect } from "@/components/ui/category-multi-select"
import { DurationPricing } from "./DurationPricing"
import { CustomPricing } from "./CustomPricing"

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

const sportOptions = [
  { id: 'padel', name: 'Pádel' },
  { id: 'tennis', name: 'Tenis' },
  { id: 'badminton', name: 'Bádminton' },
  { id: 'pickleball', name: 'Pickleball' },
  { id: 'squash', name: 'Squash' },
] as const

const courtTypeOptions = [
  { id: 'indoor', name: 'Interior' },
  { id: 'outdoor', name: 'Exterior' },
  { id: 'covered', name: 'Cubierta' },
] as const

const courtFeatures = [
  {
    id: 'walls',
    name: 'Tipo de Paredes',
    options: [
      { id: 'wall-concrete', name: 'Muro de Hormigón' },
      { id: 'wall-glass', name: 'Cristal Estándar' },
      { id: 'wall-panoramic', name: 'Cristal Panorámico' },
    ]
  },
  {
    id: 'floor',
    name: 'Tipo de Suelo',
    options: [
      { id: 'floor-synthetic', name: 'Césped Sintético' },
      { id: 'floor-clay', name: 'Tierra Batida' },
      { id: 'floor-concrete', name: 'Hormigón Pulido' },
      { id: 'floor-rubber', name: 'Goma Profesional' },
    ]
  }
] as const

// Añadimos un tipo para los pasos
type Step = 'court' | 'pricing';

const initialFormData = {
  name: '',
  surface: 'crystal',
  isIndoor: false,
  hasLighting: false,
  isActive: true,
  availableDurations: [60],
  pricing: defaultPricing,
  sport: 'padel',
  courtType: 'indoor',
  features: [],
  durationPricing: {},
  customPricing: {},
} as const

export function NewCourtModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  editingCourt,
  mode = 'create' 
}: NewCourtModalProps) {
  const [formData, setFormData] = useState<Omit<Court, 'id'>>(initialFormData)
  const [currentStep, setCurrentStep] = useState<Step>('court')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newDuration, setNewDuration] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (editingCourt && mode === 'edit') {
        const { id, ...courtData } = editingCourt
        setFormData(courtData)
      } else if (mode === 'create') {
        setFormData(initialFormData)
      }
      setCurrentStep('court')
    }
  }, [isOpen, editingCourt, mode])

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false)
    }
  }, [isOpen])

  const isFirstStepValid = () => {
    return formData.name.trim() !== '' && formData.availableDurations.length > 0
  }

  const handleNext = () => {
    if (currentStep === 'court' && isFirstStepValid()) {
      setCurrentStep('pricing')
    }
  }

  const handleBack = () => {
    if (currentStep === 'pricing') {
      setCurrentStep('court')
    }
  }

  const handleSave = () => {
    if (!isFirstStepValid()) return
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

  const handleClose = () => {
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                <div className="flex items-center justify-between">
                  <motion.h2 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="text-xl font-semibold"
                  >
                    {mode === 'create' ? 'Agregar Nueva Pista' : 'Editar Pista'}
                  </motion.h2>
                </div>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-sm text-gray-500 mt-1"
                >
                  {currentStep === 'court' 
                    ? 'Configure los datos básicos de la pista'
                    : 'Configure los precios de la pista'}
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
                <AnimatePresence mode="wait">
                  {currentStep === 'court' ? (
                    <motion.div
                      key="court-step"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-6 space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Nombre de la pista
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Pista Principal"
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Deporte
                          </label>
                          <SingleSelect
                            value={formData.sport}
                            onChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
                            options={sportOptions}
                            placeholder="Seleccionar deporte"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Tipo de Pista
                          </label>
                          <SingleSelect
                            value={formData.courtType}
                            onChange={(value) => setFormData(prev => ({ ...prev, courtType: value }))}
                            options={courtTypeOptions}
                            placeholder="Seleccionar tipo"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Características de la Pista
                        </label>
                        <CategoryMultiSelect
                          value={formData.features}
                          onChange={(features) => setFormData(prev => ({ ...prev, features }))}
                          categories={courtFeatures}
                          placeholder="Seleccionar características"
                        />
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Duraciones disponibles</h3>
                            {formData.availableDurations.length > 0 && (
                              <button
                                onClick={() => setFormData(prev => ({ ...prev, availableDurations: [] }))}
                                className={cn(
                                  "text-xs text-gray-400",
                                  "hover:text-gray-600",
                                  "transition-colors duration-200",
                                  "flex items-center gap-1"
                                )}
                              >
                                <span>Limpiar</span>
                              </button>
                            )}
                          </div>

                          {/* Duraciones predefinidas */}
                          <div className="flex flex-wrap gap-2">
                            {durationOptions.map((duration) => (
                              <button
                                key={duration}
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    availableDurations: prev.availableDurations.includes(duration)
                                      ? prev.availableDurations.filter(d => d !== duration)
                                      : [...prev.availableDurations, duration].sort((a, b) => a - b)
                                  }));
                                }}
                                className={cn(
                                  "h-9 px-4 rounded-md text-sm transition-all duration-200",
                                  "border hover:border-gray-400",
                                  formData.availableDurations.includes(duration)
                                    ? "bg-gray-900 text-white border-transparent hover:bg-gray-800"
                                    : "bg-white text-gray-700 border-gray-200"
                                )}
                              >
                                {duration} min
                              </button>
                            ))}
                          </div>

                          {/* Duración personalizada */}
                          <div className="space-y-1">
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="Añadir duración personalizada"
                                value={newDuration || ''}
                                onChange={(e) => setNewDuration(parseInt(e.target.value) || null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newDuration) {
                                    e.preventDefault()
                                    // Validar que la duración sea válida
                                    if (newDuration >= 1) {
                                      setFormData(prev => ({
                                        ...prev,
                                        availableDurations: prev.availableDurations.includes(newDuration)
                                          ? prev.availableDurations
                                          : [...prev.availableDurations, newDuration].sort((a, b) => a - b)
                                      }))
                                      setNewDuration(null) // Limpiar el input
                                    }
                                  }
                                }}
                                className={cn(
                                  "w-full px-3 py-2 rounded-lg",
                                  "border border-gray-200 bg-white",
                                  "focus:outline-none focus:border-gray-300",
                                  "transition-colors duration-200",
                                  "placeholder:text-gray-400",
                                  "text-sm",
                                  "[appearance:textfield]",
                                  "[&::-webkit-outer-spin-button]:appearance-none",
                                  "[&::-webkit-inner-spin-button]:appearance-none",
                                  "pr-12"
                                )}
                                min="1"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                                min
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 pl-1">
                              Presiona ENTER para agregar
                            </p>
                          </div>

                          {/* Duraciones seleccionadas */}
                          {formData.availableDurations.length > 0 && (
                            <div className="pt-2 space-y-2">
                              <span className="text-xs text-gray-500">
                                Duraciones seleccionadas
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {formData.availableDurations.sort((a, b) => a - b).map((duration) => (
                                  <div
                                    key={duration}
                                    className={cn(
                                      "group inline-flex items-center gap-1.5",
                                      "h-7 pl-2.5 pr-1.5 rounded-md",
                                      "bg-gray-50 text-gray-700 text-sm",
                                      "border border-gray-200",
                                      "transition-all duration-200"
                                    )}
                                  >
                                    <span>{duration} min</span>
                                    <button
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          availableDurations: prev.availableDurations.filter(d => d !== duration)
                                        }));
                                      }}
                                      className={cn(
                                        "w-4 h-4 rounded-sm",
                                        "inline-flex items-center justify-center",
                                        "text-gray-400 hover:text-gray-600",
                                        "transition-colors duration-200"
                                      )}
                                    >
                                      <span className="sr-only">Eliminar</span>
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pricing-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 space-y-8"
                    >
                      <DurationPricing
                        durations={formData.availableDurations}
                        pricing={formData.durationPricing}
                        onChange={(durationPricing) => setFormData(prev => ({ 
                          ...prev, 
                          durationPricing 
                        }))}
                      />

                      <div className="pt-6 border-t">
                        <CustomPricing
                          pricing={formData.customPricing || {}}
                          onChange={(customPricing) => setFormData(prev => ({
                            ...prev,
                            customPricing
                          }))}
                          basePricing={formData.durationPricing}
                          availableDurations={formData.availableDurations}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="p-6 border-t bg-white"
              >
                <div className="flex gap-3">
                  {currentStep === 'pricing' ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBack}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Anterior
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        className="flex-1 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                      >
                        {mode === 'create' ? 'Guardar' : 'Actualizar'}
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClose}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        disabled={!isFirstStepValid()}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                          isFirstStepValid()
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Siguiente
                      </motion.button>
                    </>
                  )}
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
                    ¿Está seguro que desea eliminar esta pista? Esta acción no se puede deshacer.
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