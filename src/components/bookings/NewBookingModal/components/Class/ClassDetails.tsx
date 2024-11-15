import { motion } from "framer-motion"
import { useEffect } from "react"
import { IconLock, IconQuestionMark } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ClassDetails as IClassDetails } from "../../types"

interface ClassDetailsProps {
  details?: IClassDetails
  onChange?: (details: IClassDetails) => void
  onValidationChange?: (isValid: boolean) => void
}

export function ClassDetails({ 
  details = { name: '', description: '', visibility: 'public' }, 
  onChange,
  onValidationChange
}: ClassDetailsProps) {
  useEffect(() => {
    onValidationChange?.(details.name.trim().length > 0)
  }, [details.name, onValidationChange])

  const handleChange = (field: keyof IClassDetails, value: any) => {
    if (onChange) {
      onChange({
        ...details,
        [field]: value
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Nombre de la clase */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Nombre de la clase
        </label>
        <input
          type="text"
          value={details.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ej: Clase de Iniciación"
          className="w-full pb-2 border-b border-gray-300 focus:border-black outline-none transition-colors bg-transparent"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          value={details.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe los detalles de la clase..."
          className="w-full h-32 p-3 border rounded-lg focus:border-black outline-none transition-colors resize-none"
        />
      </div>

      {/* Visibilidad */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">
              Clase Privada
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <IconQuestionMark className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] p-3">
                  <div className="space-y-2 text-xs">
                    <p>
                      <span className="font-medium">Clase Pública:</span>
                      {" "}Será visible en el listado general de reservaciones y tendrá su propio link para compartir.
                    </p>
                    <p>
                      <span className="font-medium">Clase Privada:</span>
                      {" "}Solo será accesible a través del link específico de la clase, no aparecerá en el listado general de reservaciones.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-gray-500">
            {details.visibility === 'private'
              ? "Solo accesible por link directo"
              : "Visible en el listado general"
            }
          </p>
        </div>
        <Switch
          checked={details.visibility === 'private'}
          onCheckedChange={(checked) => 
            handleChange('visibility', checked ? 'private' : 'public')
          }
          className="data-[state=checked]:bg-black"
        />
      </div>

      {/* Mensaje de validación */}
      {!details.name.trim() && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] text-gray-400 text-center"
        >
          Ingresa un nombre para la clase para continuar
        </motion.p>
      )}
    </motion.div>
  )
} 


