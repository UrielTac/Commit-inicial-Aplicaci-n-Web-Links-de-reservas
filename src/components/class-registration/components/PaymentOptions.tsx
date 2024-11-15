import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PaymentIcon } from "./PaymentIcon"
import type { PaymentMethod } from "../types"
import type { PAYMENT_OPTIONS } from "../config/constants"

interface PaymentOptionsProps {
  options: typeof PAYMENT_OPTIONS
  selected: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
}

export function PaymentOptions({ options, selected, onSelect }: PaymentOptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[680px] mx-auto px-6 md:px-8"
    >
      <div className="space-y-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "w-full p-4 rounded-lg border text-left transition-all",
              selected === option.id
                ? "bg-gray-50 border-gray-300"
                : "bg-white border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-lg",
                selected === option.id ? "bg-gray-100" : "bg-gray-50"
              )}>
                <PaymentIcon type={option.iconType} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  )
} 