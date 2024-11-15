"use client"

import { motion } from "framer-motion"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { ClassData } from "../../class-registration/types"

interface PublicInfoStepProps {
  classData: ClassData
  onNext: () => void
  onPrevious: () => void
}

export function PublicInfoStep({ classData, onNext, onPrevious }: PublicInfoStepProps) {
  return (
    <motion.div
      key="info"
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
        <h1 className={cn(
          "text-2xl md:text-3xl font-semibold text-gray-800",
          "tracking-tight leading-tight text-center"
        )}>
          {classData.title}
        </h1>

        {/* Descripción */}
        <div className="space-y-6">
          <div className="border-t border-gray-100" />
          <div className={cn(
            "text-[15px] text-gray-500 space-y-4",
            "leading-relaxed max-w-2xl mx-auto text-left"
          )}>
            {classData.description.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Instructor */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 text-sm max-w-2xl mx-auto text-left">
            <span className="font-medium text-gray-800">
              {classData.instructor.name}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              {classData.instructor.role}
            </span>
          </div>
        </div>

        {/* Botón Continuar */}
        <div className="pt-4">
          <motion.button
            onClick={onNext}
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
              "text-sm font-medium"
            )}
          >
            <span>Continuar</span>
            <IconChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
} 