import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PaymentMethod } from "../types";

interface PaymentSectionProps {
  theme: 'light' | 'dark';
  selectedMethod: PaymentMethod | null;
  onShowMethods: () => void;
  onRemoveMethod: () => void;
}

export function PaymentSection({
  theme,
  selectedMethod,
  onShowMethods,
  onRemoveMethod
}: PaymentSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn(
        "rounded-lg p-5",
        "transition-all duration-200 ease-in-out",
        theme === 'dark' 
          ? "bg-neutral-900"
          : "bg-gray-50 hover:bg-gray-100/80"
      )}
    >
      {!selectedMethod ? (
        <button
          onClick={onShowMethods}
          className={cn(
            "w-full p-3 rounded-lg flex items-center justify-between",
            "border-2 border-dashed transition-colors",
            theme === 'dark' 
              ? "border-neutral-700 hover:border-neutral-600 bg-neutral-900/50" 
              : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
          )}
        >
          <span className={cn(
            "text-xs",
            theme === 'dark' ? "text-neutral-300" : "text-gray-600"
          )}>
            Seleccionar medio de pago
          </span>
        </button>
      ) : (
        <div className={cn(
          "p-3 rounded-lg flex items-center justify-between",
          "border-2 border-dashed",
          theme === 'dark' 
            ? "border-zinc-800 bg-zinc-900/50"
            : "border-gray-200 bg-gray-50"
        )}>
          <div className="flex flex-col">
            <span className={cn(
              "text-xs font-medium",
              theme === 'dark' ? "text-gray-200" : "text-gray-900"
            )}>
              {selectedMethod.name}
            </span>
            <span className={cn(
              "text-xs",
              theme === 'dark' ? "text-gray-400" : "text-gray-500"
            )}>
              {selectedMethod.description}
            </span>
          </div>
          <button
            onClick={onRemoveMethod}
            className={cn(
              "p-1.5 rounded-md",
              theme === 'dark' 
                ? "text-gray-400 hover:bg-zinc-800"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
} 