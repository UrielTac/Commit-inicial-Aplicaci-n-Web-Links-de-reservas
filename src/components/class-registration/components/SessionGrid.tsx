import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IconCheck } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { ClassSession } from "../types"

interface SessionGridProps {
  sessions: ClassSession[]
  onToggle: (index: number) => void
}

export function SessionGrid({ sessions, onToggle }: SessionGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {sessions.map((session, index) => (
        <motion.button
          key={index}
          onClick={() => onToggle(index)}
          className={cn(
            "p-4 rounded-lg border text-left transition-all",
            session.selected
              ? "bg-gray-50 border-gray-300"
              : "bg-white border-gray-200 hover:border-gray-300"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                Clase {index + 1}
              </p>
              <p className="text-sm text-gray-500">
                {format(session.date, "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              session.selected
                ? "border-gray-800 bg-gray-800"
                : "border-gray-300"
            )}>
              {session.selected && (
                <IconCheck className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  )
} 