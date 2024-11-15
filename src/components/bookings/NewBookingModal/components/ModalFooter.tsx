import { motion } from "framer-motion"
import { IconChevronRight } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { BookingStep } from "../types"

interface ModalFooterProps {
  currentStep: BookingStep
  onBack: () => void
  onContinue: () => void
  isValid: boolean
}

export function ModalFooter({ 
  currentStep, 
  onBack, 
  onContinue, 
  isValid 
}: ModalFooterProps) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.35, duration: 0.3 }}
      className="p-6 border-t bg-white"
    >
      <div className="flex gap-3">
        {currentStep !== 'confirmation' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Volver
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className={cn(
            "flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2",
            currentStep === 'confirmation'
              ? "bg-black text-white hover:bg-gray-800"
              : isValid
                ? "bg-black text-white hover:bg-gray-800" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <span>
            {currentStep === 'confirmation' ? 'Aceptar' : 'Continuar'}
          </span>
          {currentStep !== 'confirmation' && (
            <IconChevronRight className="h-4 w-4" />
          )}
        </motion.button>
      </div>
    </motion.div>
  )
} 