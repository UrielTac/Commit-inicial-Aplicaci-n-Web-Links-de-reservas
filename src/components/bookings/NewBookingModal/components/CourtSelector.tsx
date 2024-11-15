import { motion } from "framer-motion"
import { courts } from "@/lib/data"
import { cn } from "@/lib/utils"

interface CourtSelectorProps {
  selectedCourts: string[]
  onCourtToggle: (courtId: string) => void
}

export function CourtSelector({ selectedCourts, onCourtToggle }: CourtSelectorProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h3 className="text-sm font-medium text-gray-600">
        Seleccionar Canchas
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {courts.map((court) => (
          <motion.button
            key={court.id}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => onCourtToggle(court.id)}
            className={cn(
              "relative flex items-center gap-2 py-2.5 px-3 rounded-md transition-all duration-200",
              "hover:bg-gray-50/50",
              selectedCourts.includes(court.id)
                ? "bg-gray-50 ring-1 ring-black/5 border-transparent"
                : "bg-white border-gray-200 hover:border-gray-300"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full transition-all",
              selectedCourts.includes(court.id)
                ? "bg-black scale-110"
                : "bg-gray-300"
            )} />
            <span className={cn(
              "text-sm transition-colors",
              selectedCourts.includes(court.id)
                ? "text-gray-900"
                : "text-gray-500"
            )}>
              {court.name}
            </span>
          </motion.button>
        ))}
      </div>
      {selectedCourts.length === 0 && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] text-gray-400"
        >
          Seleccione al menos una cancha para continuar
        </motion.p>
      )}
    </motion.div>
  )
}