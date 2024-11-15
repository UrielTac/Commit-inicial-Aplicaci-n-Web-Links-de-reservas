"use client"

import { motion } from "framer-motion"
import { IconCheck } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface PaymentConfirmationPopupProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  position: { x: number; y: number }
}

export function PaymentConfirmationPopup({
  isOpen,
  onConfirm,
  onCancel,
  position
}: PaymentConfirmationPopupProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bg-white rounded-lg shadow-lg border p-4"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '280px',
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100">
            <IconCheck className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Completar Pago
            </h3>
            <p className="text-xs text-gray-500">
              ¿Deseas marcar esta reserva como pagada completamente?
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-all duration-200"
          >
            Confirmar
          </button>
        </div>
      </div>
    </motion.div>
  )
} 