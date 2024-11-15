"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { AuthForm } from "../types"

interface AuthStepProps {
  isLogin: boolean
  authForm: AuthForm
  onSubmit: (e: React.FormEvent) => void
  onToggleMode: () => void
  onUpdateForm: (data: Partial<AuthForm>) => void
}

export function AuthStep({
  isLogin,
  authForm,
  onSubmit,
  onToggleMode,
  onUpdateForm
}: AuthStepProps) {
  return (
    <motion.div
      key="auth"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[400px] mx-auto px-6 md:px-8"
    >
      <div className="space-y-8 text-center">
        {/* Título */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            {isLogin ? 'Inicia sesión' : 'Crea una cuenta'}
          </h2>
          <p className="text-sm text-gray-500">
            {isLogin 
              ? 'Accede a tu cuenta para inscribirte'
              : 'Crea una cuenta para inscribirte'}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email */}
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => onUpdateForm({ email: e.target.value })}
              placeholder="Email"
              className={cn(
                "w-full px-4 py-3 rounded-lg",
                "bg-white border border-gray-200",
                "text-sm text-gray-900",
                "placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-gray-100",
                "transition-all duration-200"
              )}
              required
            />

            {!isLogin && (
              <>
                {/* DNI */}
                <input
                  type="text"
                  value={authForm.dni || ''}
                  onChange={(e) => onUpdateForm({ dni: e.target.value })}
                  placeholder="DNI"
                  className={cn(
                    "w-full px-4 py-3 rounded-lg",
                    "bg-white border border-gray-200",
                    "text-sm text-gray-900",
                    "placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-gray-100",
                    "transition-all duration-200"
                  )}
                  required={!isLogin}
                />

                {/* Teléfono */}
                <input
                  type="tel"
                  value={authForm.phone || ''}
                  onChange={(e) => onUpdateForm({ phone: e.target.value })}
                  placeholder="Teléfono"
                  className={cn(
                    "w-full px-4 py-3 rounded-lg",
                    "bg-white border border-gray-200",
                    "text-sm text-gray-900",
                    "placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-gray-100",
                    "transition-all duration-200"
                  )}
                  required={!isLogin}
                />
              </>
            )}

            {/* Contraseña */}
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => onUpdateForm({ password: e.target.value })}
              placeholder="Contraseña"
              className={cn(
                "w-full px-4 py-3 rounded-lg",
                "bg-white border border-gray-200",
                "text-sm text-gray-900",
                "placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-gray-100",
                "transition-all duration-200"
              )}
              required
            />
          </div>

          {/* Botón submit */}
          <motion.button
            type="submit"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full px-6 py-3.5 rounded-lg",
              "bg-white border border-gray-200",
              "text-gray-800 hover:text-gray-900",
              "hover:border-gray-300 hover:bg-gray-50",
              "transition-all duration-200",
              "text-sm font-medium"
            )}
          >
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </motion.button>

          {/* Toggle login/register */}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isLogin 
              ? '¿No tienes cuenta? Crear una'
              : '¿Ya tienes cuenta? Iniciar sesión'
            }
          </button>
        </form>
      </div>
    </motion.div>
  )
} 