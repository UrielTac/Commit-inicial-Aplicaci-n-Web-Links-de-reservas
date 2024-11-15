import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IconChevronLeft, IconChevronRight, IconUsers } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { ClassSession } from "../types"

interface SessionStepProps {
  sessions: ClassSession[]
  onToggle: (index: number) => void
  onPrevious: () => void
  onNext: () => void
  pricePerSession: number
}

export function SessionStep({
  sessions,
  onToggle,
  onPrevious,
  onNext,
  pricePerSession
}: SessionStepProps) {
  const selectedSession = sessions.find(s => s.selected)

  // Datos de ejemplo para cada horario
  const getSessionData = (index: number) => ({
    totalSpots: 12,
    spotsLeft: [5, 3, 8, 1, 0, 4, 6, 2][index] || 0
  })

  return (
    <motion.div
      key="classes"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.75 }}
      className="w-full max-w-[680px] mx-auto px-6 md:px-8"
    >
      <div className="space-y-8">
        {/* Botón Volver */}
        <div className="text-left">
          <button
            onClick={onPrevious}
            className={cn(
              "inline-flex items-center gap-2",
              "text-sm text-gray-500 hover:text-gray-800",
              "transition-colors duration-200"
            )}
          >
            <IconChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Volver</span>
          </button>
        </div>

        {/* Título */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            Selecciona un horario
          </h2>
          <p className="text-sm text-gray-500">
            Elige el horario que mejor se adapte a tu agenda
          </p>
        </div>

        {/* Grid de horarios */}
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session, index) => {
            const { totalSpots, spotsLeft } = getSessionData(index)
            return (
              <motion.button
                key={index}
                onClick={() => onToggle(index)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group relative p-6 rounded-xl border text-left",
                  "transition-all duration-200",
                  session.selected
                    ? "bg-gray-50 border-gray-900/10 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="space-y-3">
                  {/* Fecha */}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(session.date, "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                  </div>

                  {/* Horario y Disponibilidad */}
                  <div className="flex items-center justify-between">
                    {/* Horario */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-900">
                        {format(session.date, "HH:mm")} - {format(new Date(session.date.getTime() + 60 * 60 * 1000), "HH:mm")}
                      </span>
                    </div>

                    {/* Estado de disponibilidad */}
                    <div className="text-xs">
                      {spotsLeft === 0 ? (
                        <span className="text-red-600 font-medium">Completo</span>
                      ) : (
                        <span className="text-gray-500">
                          {spotsLeft} {spotsLeft === 1 ? 'lugar' : 'lugares'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ocupación */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <IconUsers className="w-4 h-4" />
                    <span>
                      {totalSpots - spotsLeft} de {totalSpots} inscriptos
                    </span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Resumen */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {selectedSession ? 'Horario seleccionado' : 'Selecciona un horario para continuar'}
            </span>
            {selectedSession && (
              <span className="font-medium text-gray-900">
                ${pricePerSession.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Botón Continuar */}
        <motion.button
          onClick={onNext}
          disabled={!selectedSession}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full max-w-sm mx-auto",
            "px-6 py-3.5 rounded-lg",
            "bg-white border border-gray-200",
            "text-gray-800 hover:text-gray-900",
            "hover:border-gray-300 hover:bg-gray-50",
            "transition-all duration-200",
            "flex items-center justify-center gap-2",
            "text-sm font-medium",
            !selectedSession && "opacity-50 cursor-not-allowed"
          )}
        >
          <span>Continuar</span>
          <IconChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </motion.button>
      </div>
    </motion.div>
  )
} 