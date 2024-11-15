import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { IconMinus, IconPlus, IconUsers } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { courts } from "@/lib/data"

interface CourtAvailability {
  courtId: string
  isSelected: boolean
  capacity: number
}

interface ClassAvailabilityProps {
  selectedCourts: string[]
  onCourtSelect: (courts: string[]) => void
  onValidationChange: (isValid: boolean) => void
}

export function ClassAvailability({
  selectedCourts,
  onCourtSelect,
  onValidationChange
}: ClassAvailabilityProps) {
  const [courtsAvailability, setCourtsAvailability] = useState<CourtAvailability[]>(
    courts.map(court => ({
      courtId: court.id,
      isSelected: selectedCourts.includes(court.id),
      capacity: 4
    }))
  )

  useEffect(() => {
    onValidationChange?.(selectedCourts.length > 0)
  }, [selectedCourts, onValidationChange])

  const handleCourtToggle = (courtId: string) => {
    setCourtsAvailability(prev => prev.map(court => 
      court.courtId === courtId 
        ? { ...court, isSelected: !court.isSelected }
        : court
    ))

    const updatedCourts = courtsAvailability
      .map(court => court.courtId === courtId 
        ? { ...court, isSelected: !court.isSelected }
        : court
      )
      .filter(court => court.isSelected)
      .map(court => court.courtId)

    onCourtSelect(updatedCourts)
  }

  const handleCapacityChange = (courtId: string, change: number) => {
    setCourtsAvailability(prev => prev.map(court => 
      court.courtId === courtId 
        ? { ...court, capacity: Math.max(1, Math.min(20, court.capacity + change)) }
        : court
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid gap-4">
        {courts.map((court, index) => {
          const availability = courtsAvailability.find(c => c.courtId === court.id)
          if (!availability) return null

          return (
            <motion.div
              key={court.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => handleCourtToggle(court.id)}
                className={cn(
                  "group relative w-full p-4 rounded-lg border transition-all duration-200",
                  "hover:shadow-sm",
                  availability.isSelected
                    ? "bg-gray-50 ring-1 ring-black/5 border-transparent"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      "bg-gradient-to-b transition-colors duration-200",
                      availability.isSelected
                        ? "from-blue-50/80 to-blue-100/80"
                        : "from-gray-50 to-gray-100/80"
                    )}>
                      <IconUsers 
                        className={cn(
                          "w-5 h-5 transition-colors duration-200",
                          availability.isSelected ? "text-blue-600" : "text-gray-600"
                        )} 
                        strokeWidth={1.5} 
                      />
                    </div>
                    <div className="text-left">
                      <h3 className={cn(
                        "font-medium transition-colors duration-200",
                        availability.isSelected ? "text-gray-900" : "text-gray-700"
                      )}>
                        {court.name}
                      </h3>
                      <p className={cn(
                        "text-sm transition-colors duration-200",
                        availability.isSelected ? "text-gray-600" : "text-gray-500"
                      )}>
                        {availability.capacity} {availability.capacity === 1 ? 'lugar' : 'lugares'} disponible{availability.capacity !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {availability.isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCapacityChange(court.id, -1)
                        }}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          "hover:bg-gray-100 active:bg-gray-200",
                          "focus:outline-none focus:ring-2 focus:ring-gray-300"
                        )}
                      >
                        <IconMinus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {availability.capacity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCapacityChange(court.id, 1)
                        }}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          "hover:bg-gray-100 active:bg-gray-200",
                          "focus:outline-none focus:ring-2 focus:ring-gray-300"
                        )}
                      >
                        <IconPlus className="w-4 h-4 text-gray-600" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>

      {!selectedCourts.length && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] text-gray-400 text-center"
        >
          Selecciona al menos una cancha para continuar
        </motion.p>
      )}
    </motion.div>
  )
} 






























































