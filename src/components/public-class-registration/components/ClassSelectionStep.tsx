"use client"

import { motion } from "framer-motion"
import { IconChevronRight, IconUsers, IconClock } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { PublicClass } from "../types"

interface ClassSelectionStepProps {
  classes: PublicClass[]
  selectedClass: string | null
  onSelect: (classId: string) => void
  onNext: () => void
}

export function ClassSelectionStep({
  classes,
  selectedClass,
  onSelect,
  onNext
}: ClassSelectionStepProps) {
  return (
    <motion.div
      key="class-selection"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.75 }}
      className="w-full max-w-[680px] mx-auto px-6 md:px-8"
    >
      <div className="space-y-8">
        {/* Título */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            Clases disponibles
          </h2>
          <p className="text-sm text-gray-500">
            Selecciona la clase a la que deseas inscribirte
          </p>
        </div>

        {/* Grid de clases */}
        <div className="grid gap-4">
          {classes.map((classItem) => (
            <motion.button
              key={classItem.id}
              onClick={() => onSelect(classItem.id)}
              className={cn(
                "w-full p-4 rounded-lg border text-left transition-all",
                selectedClass === classItem.id
                  ? "bg-gray-50 border-gray-300"
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {classItem.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {classItem.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      classItem.spotsLeft > 3
                        ? "bg-green-50 text-green-700"
                        : classItem.spotsLeft > 0
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    )}>
                      {classItem.spotsLeft === 0 
                        ? "Completo"
                        : `${classItem.spotsLeft} lugares`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <IconClock className="w-4 h-4" />
                    <span>{classItem.schedule}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconUsers className="w-4 h-4" />
                    <span>{classItem.instructor}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Botón Continuar */}
        <motion.button
          onClick={onNext}
          disabled={!selectedClass}
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
            !selectedClass && "opacity-50 cursor-not-allowed"
          )}
        >
          <span>Continuar</span>
          <IconChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        </motion.button>
      </div>
    </motion.div>
  )
} 