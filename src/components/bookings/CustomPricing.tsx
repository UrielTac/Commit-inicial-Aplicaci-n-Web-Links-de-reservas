"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { TimeSelector } from "@/components/ui/time-selector"
import type { DurationOption } from "@/types/court"

interface TimeRange {
  startTime: string
  endTime: string
  percentage: number
}

interface DayPricing {
  isSelected: boolean
  timeRanges: TimeRange[]
}

interface CustomPricingConfig {
  [key: number]: DayPricing
}

interface CustomPricingProps {
  pricing: CustomPricingConfig
  onChange: (pricing: CustomPricingConfig) => void
  basePricing: { [key: number]: number }
  availableDurations: DurationOption[]
}

export function CustomPricing({
  pricing,
  onChange,
  basePricing,
  availableDurations
}: CustomPricingProps) {
  const weekDays = [
    { id: 0, label: 'D' },
    { id: 1, label: 'L' },
    { id: 2, label: 'M' },
    { id: 3, label: 'X' },
    { id: 4, label: 'J' },
    { id: 5, label: 'V' },
    { id: 6, label: 'S' }
  ]

  const weekDaysComplete = [
    { id: 0, label: 'Domingo' },
    { id: 1, label: 'Lunes' },
    { id: 2, label: 'Martes' },
    { id: 3, label: 'Miércoles' },
    { id: 4, label: 'Jueves' },
    { id: 5, label: 'Viernes' },
    { id: 6, label: 'Sábado' }
  ]

  const handleDayChange = (dayId: number, changes: Partial<DayPricing>) => {
    onChange({
      ...pricing,
      [dayId]: {
        ...pricing[dayId],
        ...changes
      }
    })
  }

  const calculateFinalPrice = (basePrice: number, percentage: number) => {
    return basePrice + (basePrice * (percentage / 100))
  }

  const [hasCustomPricing, setHasCustomPricing] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-gray-900">Precios personalizados</h3>
          <p className="text-sm text-gray-500">Ajusta los precios según el día y horario</p>
        </div>
        <Switch
          checked={hasCustomPricing}
          onCheckedChange={(checked) => {
            setHasCustomPricing(checked)
            if (!checked) onChange({})
          }}
          className="data-[state=checked]:bg-black"
        />
      </div>

      {hasCustomPricing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* Selector de días */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Selecciona los días
            </label>
            <div className="flex justify-center gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.id}
                  onClick={() => {
                    handleDayChange(day.id, {
                      isSelected: !pricing[day.id]?.isSelected,
                      timeRanges: !pricing[day.id]?.isSelected ? [{ startTime: '09:00', endTime: '22:00', percentage: 0 }] : []
                    })
                  }}
                  className={cn(
                    "w-9 h-9 rounded-lg text-sm font-medium",
                    "transition-all duration-200",
                    pricing[day.id]?.isSelected
                      ? "bg-black text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Configuración por día */}
          <div className="space-y-4">
            {weekDaysComplete.map((day, index) => {
              const daySettings = pricing[day.id]
              if (!daySettings?.isSelected) return null

              return (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-4 p-4 rounded-lg border border-gray-200 bg-white"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {day.label}
                  </span>

                  <div className="space-y-6">
                    {daySettings.timeRanges?.map((range, rangeIndex) => (
                      <div key={rangeIndex} className="space-y-4">
                        <div className="relative group">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-500">Desde</label>
                              <TimeSelector
                                value={range.startTime}
                                onChange={(value) => {
                                  const newRanges = [...daySettings.timeRanges]
                                  newRanges[rangeIndex] = { ...range, startTime: value }
                                  handleDayChange(day.id, { timeRanges: newRanges })
                                }}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black"
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-500">Hasta</label>
                              <TimeSelector
                                value={range.endTime}
                                onChange={(value) => {
                                  const newRanges = [...daySettings.timeRanges]
                                  newRanges[rangeIndex] = { ...range, endTime: value }
                                  handleDayChange(day.id, { timeRanges: newRanges })
                                }}
                                className="border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-500">Variación</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={range.percentage || ''}
                                  onChange={(e) => {
                                    const newRanges = [...daySettings.timeRanges]
                                    newRanges[rangeIndex] = {
                                      ...range,
                                      percentage: parseFloat(e.target.value) || 0
                                    }
                                    handleDayChange(day.id, { timeRanges: newRanges })
                                  }}
                                  placeholder="0"
                                  className={cn(
                                    "w-full h-10 px-3 text-right pr-8 text-sm",
                                    "rounded-md border border-gray-200",
                                    "focus:outline-none focus:border-black",
                                    "placeholder:text-gray-400",
                                    "[appearance:textfield]",
                                    "[&::-webkit-outer-spin-button]:appearance-none",
                                    "[&::-webkit-inner-spin-button]:appearance-none"
                                  )}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                                  %
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Botón de eliminar más sutil */}
                          {daySettings.timeRanges.length > 1 && (
                            <button
                              onClick={() => {
                                const newRanges = daySettings.timeRanges.filter((_, i) => i !== rangeIndex)
                                handleDayChange(day.id, { timeRanges: newRanges })
                              }}
                              className={cn(
                                "absolute -right-1 top-2",
                                "w-5 h-5",
                                "flex items-center justify-center",
                                "text-gray-300 hover:text-red-500",
                                "transition-all duration-200",
                                "opacity-0 group-hover:opacity-100"
                              )}
                            >
                              <span className="sr-only">Eliminar rango</span>
                              ×
                            </button>
                          )}
                        </div>

                        {/* Vista previa de precios más elegante */}
                        <div className="pl-4 border-l-2 border-gray-100">
                          <div className="space-y-3">
                            <span className="text-xs font-medium text-gray-400">
                              Precios resultantes
                            </span>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                              {availableDurations.map(duration => {
                                const basePrice = basePricing[duration] || 0
                                const finalPrice = calculateFinalPrice(basePrice, range.percentage)
                                return (
                                  <div key={duration} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                      {duration} min
                                    </span>
                                    {basePrice > 0 ? (
                                      <div className="text-right">
                                        <span className="text-xs text-gray-400 line-through">
                                          {basePrice}€
                                        </span>
                                        <span className="ml-2 text-sm font-medium text-gray-900">
                                          {finalPrice.toFixed(2)}€
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">
                                        No definido
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const newRanges = [
                          ...daySettings.timeRanges,
                          { startTime: '09:00', endTime: '22:00', percentage: 0 }
                        ]
                        handleDayChange(day.id, { timeRanges: newRanges })
                      }}
                      className={cn(
                        "text-sm text-gray-500",
                        "hover:text-gray-900",
                        "transition-colors duration-200"
                      )}
                    >
                      + Agregar rango horario
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
} 