"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { IconChevronLeft, IconChevronRight, IconCopy, IconCheck, IconUpload, IconFile, IconX } from "@tabler/icons-react"
import { PaymentOptions } from "./PaymentOptions"
import type { PaymentMethod } from "../types"
import type { PAYMENT_OPTIONS } from "../config/constants"
import { MercadoPagoLogo } from "@/components/icons/mercadopago-logo"

interface PaymentStepProps {
  options: typeof PAYMENT_OPTIONS
  selected: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
  onPrevious: () => void
  onNext: () => void
  totalAmount: number
}

const BANK_INFO = {
  alias: "PADEL.CLUB.PAGOS",
  cvu: "0000003100093109283856",
  holder: "Club de Pádel S.A."
}

export function PaymentStep({
  options,
  selected,
  onSelect,
  onPrevious,
  onNext,
  totalAmount
}: PaymentStepProps) {
  const [copied, setCopied] = useState<'alias' | 'cvu' | null>(null)
  const [receipt, setReceipt] = useState<File | null>(null)

  const copyToClipboard = async (text: string, type: 'alias' | 'cvu') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setReceipt(file)
  }

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.75 }}
      className="w-full max-w-[680px] mx-auto px-6 md:px-8"
    >
      <div className="space-y-8">
        {/* Contenido superior - sin cambios */}
        <div className="text-left">
          <button onClick={onPrevious} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-200">
            <IconChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Volver</span>
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Método de pago
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Selecciona cómo deseas realizar el pago
          </p>
        </div>

        <PaymentOptions
          options={[
            {
              id: 'cash',
              label: 'Pagar en sede',
              description: 'Realiza el pago directamente en nuestras instalaciones',
              iconType: 'cash'
            },
            {
              id: 'card',
              label: 'Mercado Pago',
              description: 'Paga de forma segura con tarjeta o dinero en cuenta',
              iconType: 'card'
            },
            {
              id: 'transfer',
              label: 'Transferencia bancaria',
              description: 'Realiza una transferencia a nuestra cuenta',
              iconType: 'transfer'
            }
          ]}
          selected={selected}
          onSelect={onSelect}
        />

        {/* Contenedor para datos de transferencia y resumen */}
        <div className="space-y-8">
          {/* Información de transferencia con animación mejorada */}
          <AnimatePresence mode="wait">
            {selected === 'transfer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="overflow-hidden"
              >
                <div className="space-y-6 pb-4">
                  {/* Datos bancarios */}
                  <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
                    <div className="p-4 space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {BANK_INFO.holder}
                      </p>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Alias</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {BANK_INFO.alias}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.alias, 'alias')}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          copied === 'alias'
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {copied === 'alias' ? (
                          <IconCheck className="w-4 h-4" />
                        ) : (
                          <IconCopy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">CVU</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {BANK_INFO.cvu}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.cvu, 'cvu')}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          copied === 'cvu'
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {copied === 'cvu' ? (
                          <IconCheck className="w-4 h-4" />
                        ) : (
                          <IconCopy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Subir comprobante mejorado */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-900">
                      Comprobante de transferencia
                    </p>
                    {receipt ? (
                      <div className="relative p-4 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border border-gray-200">
                            <IconFile className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {receipt.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(receipt.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <button
                            onClick={() => setReceipt(null)}
                            className="p-1.5 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="group relative block w-full h-32 rounded-lg cursor-pointer border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 mb-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors flex items-center justify-center">
                              <IconUpload className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">
                                Haz clic para subir el comprobante
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PDF o imágenes hasta 10MB
                              </p>
                            </div>
                          </div>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {selected === 'card' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pb-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 text-center">
                      Al hacer clic en "Pagar con Mercado Pago" serás redirigido para completar tu pago de forma segura.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resumen y Botón con animación */}
          <motion.div
            layout
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div className="border-t pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total a pagar</span>
                <span className="font-medium text-gray-900">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <motion.button
              onClick={onNext}
              disabled={!selected || (selected === 'transfer' && !receipt)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full max-w-sm mx-auto",
                "px-6 py-3.5 rounded-lg",
                "text-sm font-medium",
                "transition-all duration-200",
                "flex items-center justify-center gap-2",
                "bg-white border border-gray-200",
                "text-gray-800 hover:text-gray-900",
                "hover:border-gray-300 hover:bg-gray-50",
                (!selected || (selected === 'transfer' && !receipt)) && "opacity-50 cursor-not-allowed"
              )}
            >
              <span>
                {selected === 'card' ? 'Pagar con Mercado Pago' : 'Continuar'}
              </span>
              <IconChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 