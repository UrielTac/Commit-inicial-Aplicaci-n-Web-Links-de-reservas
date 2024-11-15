import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, KeyboardEvent } from "react"
import { IconPlus, IconX, IconCalendar, IconClock, IconUsers, IconRepeat } from "@tabler/icons-react"
import { Switch } from "@/components/ui/switch"
import { CustomCalendar } from "@/components/ui/custom-calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimeSelector } from "@/components/ui/time-selector"
import { courts } from "@/lib/data"
import { MultiSelect } from "@/components/ui/multi-select"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  capacity: number
  instructors: string[]
  price: number
  courtIds?: string[]
}

interface ClassScheduleConfig {
  isRecurring: boolean
  startDate: Date | undefined
  endDate: Date | undefined
  weekDays: number[]
  timeSlots: TimeSlot[]
}

interface ClassScheduleProps {
  config?: ClassScheduleConfig
  onChange: (config: ClassScheduleConfig) => void
  onValidationChange: (isValid: boolean) => void
}

export function ClassSchedule({
  config = {
    isRecurring: false,
    startDate: undefined,
    endDate: undefined,
    weekDays: [],
    timeSlots: []
  },
  onChange,
  onValidationChange
}: ClassScheduleProps) {
  const [newInstructor, setNewInstructor] = useState<string>("")

  useEffect(() => {
    const isValid = config.startDate !== undefined && config.timeSlots.length > 0
    onValidationChange?.(isValid)
  }, [config, onValidationChange])

  const handleAddTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: crypto.randomUUID(),
      startTime: "09:00",
      endTime: "10:00",
      capacity: 4,
      instructors: [],
      price: 0,
      courtIds: undefined
    }
    onChange({
      ...config,
      timeSlots: [...config.timeSlots, newSlot]
    })
  }

  const handleAddInstructor = (slotId: string, instructor: string) => {
    if (!instructor.trim()) return

    const updatedSlots = config.timeSlots.map(slot => 
      slot.id === slotId
        ? { ...slot, instructors: [...slot.instructors, instructor.trim()] }
        : slot
    )
    onChange({ ...config, timeSlots: updatedSlots })
  }

  const handleRemoveInstructor = (slotId: string, instructorToRemove: string) => {
    const updatedSlots = config.timeSlots.map(slot => 
      slot.id === slotId
        ? { 
            ...slot, 
            instructors: slot.instructors.filter(i => i !== instructorToRemove)
          }
        : slot
    )
    onChange({ ...config, timeSlots: updatedSlots })
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>, slotId: string) => {
    if (e.key === 'Enter') {
      handleAddInstructor(slotId, newInstructor)
      setNewInstructor("")
    }
  }

  const weekDays = ["D", "L", "M", "X", "J", "V", "S"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Tipo de Clase y Fechas */}
      <div className="space-y-6">
        {/* Switch de Clase Recurrente */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
          <div className="space-y-0.5">
            <h3 className="text-sm font-medium text-gray-900">Clase Recurrente</h3>
            <p className="text-sm text-gray-500">La clase se repetirá semanalmente</p>
          </div>
          <Switch
            checked={config.isRecurring}
            onCheckedChange={(checked) => onChange({ ...config, isRecurring: checked })}
            className="data-[state=checked]:bg-black"
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Fecha de inicio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {config.isRecurring ? 'Fecha de inicio' : 'Fecha de la clase'}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  "w-full p-3 rounded-lg text-left",
                  "border border-gray-200 bg-white",
                  "hover:border-gray-300 transition-colors duration-200",
                  !config.startDate && "text-gray-500"
                )}>
                  <span className="text-sm">
                    {config.startDate
                      ? format(config.startDate, "d 'de' MMMM, yyyy", { locale: es })
                      : "Seleccionar fecha"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0">
                <CustomCalendar
                  selected={config.startDate}
                  onSelect={(date) => onChange({ ...config, startDate: date })}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha de fin (solo si es recurrente) */}
          {config.isRecurring && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Fecha de fin (opcional)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full p-3 rounded-lg text-left",
                    "border border-gray-200 bg-white",
                    "hover:border-gray-300 transition-colors duration-200",
                    !config.endDate && "text-gray-500"
                  )}>
                    <span className="text-sm">
                      {config.endDate
                        ? format(config.endDate, "d 'de' MMMM, yyyy", { locale: es })
                        : "Sin fecha de fin"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <CustomCalendar
                    selected={config.endDate}
                    onSelect={(date) => onChange({ ...config, endDate: date })}
                    disabled={(date) => date < (config.startDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Días de la semana (solo si es recurrente) */}
        {config.isRecurring && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Días de la semana
            </label>
            <div className="flex justify-center gap-2">
              {weekDays.map((day, index) => (
                <button
                  key={day}
                  onClick={() => onChange({
                    ...config,
                    weekDays: config.weekDays.includes(index)
                      ? config.weekDays.filter(d => d !== index)
                      : [...config.weekDays, index]
                  })}
                  className={cn(
                    "w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200",
                    config.weekDays.includes(index)
                      ? "bg-black text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Horarios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Horarios</h3>
          <button
            onClick={handleAddTimeSlot}
            className={cn(
              "text-sm text-gray-600 hover:text-gray-900",
              "transition-colors duration-200"
            )}
          >
            Agregar horario
          </button>
        </div>

        <AnimatePresence>
          {config.timeSlots.map((slot, index) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="p-6 bg-white rounded-xl border border-gray-100">
                <div className="space-y-6">
                  {/* Horario */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Inicio
                      </label>
                      <TimeSelector
                        value={slot.startTime}
                        onChange={(time) => {
                          const updatedSlots = config.timeSlots.map(s =>
                            s.id === slot.id ? { ...s, startTime: time } : s
                          )
                          onChange({ ...config, timeSlots: updatedSlots })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Fin
                      </label>
                      <TimeSelector
                        value={slot.endTime}
                        onChange={(time) => {
                          const updatedSlots = config.timeSlots.map(s =>
                            s.id === slot.id ? { ...s, endTime: time } : s
                          )
                          onChange({ ...config, timeSlots: updatedSlots })
                        }}
                      />
                    </div>
                  </div>

                  {/* Cancha */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Cancha
                    </label>
                    <MultiSelect
                      value={slot.courtIds || []}
                      onChange={(courts) => {
                        const updatedSlots = config.timeSlots.map(s =>
                          s.id === slot.id ? { ...s, courtIds: courts } : s
                        )
                        onChange({ ...config, timeSlots: updatedSlots })
                      }}
                      options={courts}
                      placeholder="Seleccionar canchas"
                    />
                  </div>

                  {/* Capacidad y Precio */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Capacidad */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Capacidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={slot.capacity}
                        onChange={(e) => {
                          const updatedSlots = config.timeSlots.map(s =>
                            s.id === slot.id ? { ...s, capacity: parseInt(e.target.value) || 1 } : s
                          )
                          onChange({ ...config, timeSlots: updatedSlots })
                        }}
                        className={cn(
                          "w-full px-3 py-2 rounded-lg border bg-white",
                          "focus:outline-none focus:border-gray-300",
                          "transition-colors duration-200",
                          "[appearance:textfield]",
                          "[&::-webkit-outer-spin-button]:appearance-none",
                          "[&::-webkit-inner-spin-button]:appearance-none"
                        )}
                        style={{ MozAppearance: 'textfield' }}
                      />
                    </div>

                    {/* Precio */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Precio
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={slot.price}
                          onChange={(e) => {
                            const updatedSlots = config.timeSlots.map(s =>
                              s.id === slot.id ? { ...s, price: parseInt(e.target.value) || 0 } : s
                            )
                            onChange({ ...config, timeSlots: updatedSlots })
                          }}
                          className={cn(
                            "w-full pl-7 pr-3 py-2 rounded-lg border bg-white",
                            "focus:outline-none focus:border-gray-300",
                            "transition-colors duration-200",
                            "[appearance:textfield]",
                            "[&::-webkit-outer-spin-button]:appearance-none",
                            "[&::-webkit-inner-spin-button]:appearance-none"
                          )}
                          style={{ MozAppearance: 'textfield' }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profesores */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Profesores
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {slot.instructors.map((instructor) => (
                        <motion.span
                          key={instructor}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {instructor}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleRemoveInstructor(slot.id, instructor)
                            }}
                            className="p-1 hover:text-red-500 transition-colors"
                          >
                            <IconX className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                      <input
                        type="text"
                        value={newInstructor}
                        onChange={(e) => setNewInstructor(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, slot.id)}
                        placeholder="Agregar profesor..."
                        className={cn(
                          "flex-1 min-w-[200px] px-3 py-1 text-sm",
                          "border-none focus:outline-none bg-transparent"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const updatedSlots = config.timeSlots.filter(s => s.id !== slot.id)
                    onChange({ ...config, timeSlots: updatedSlots })
                  }}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg",
                    "text-gray-400 hover:text-red-500 hover:bg-red-50",
                    "opacity-0 group-hover:opacity-100 transition-all duration-200"
                  )}
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {config.timeSlots.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-sm text-gray-500">
              Agrega al menos un horario para la clase
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
} 