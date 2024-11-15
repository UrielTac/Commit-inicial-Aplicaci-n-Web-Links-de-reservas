import { motion } from "framer-motion"

import { format } from "date-fns"

import { es } from "date-fns/locale"

import { IconCheck } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

import type { Court } from "@/lib/data"

import { ClassLinkShare } from "@/components/class-registration/ClassLinkShare"



interface ClassConfirmationStepProps {

  selectedDate?: Date

  selectedCourts: string[]

  courts: Court[]

  className?: string

  visibility: 'public' | 'private'

}



export function ClassConfirmationStep({

  selectedDate,

  selectedCourts,

  courts,

  className,

  visibility

}: ClassConfirmationStepProps) {

  const classId = crypto.randomUUID()



  return (

    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">

      {/* Icono de éxito */}

      <motion.div

        initial={{ scale: 0 }}

        animate={{ scale: 1 }}

        transition={{ type: "spring", duration: 0.5 }}

        className="mb-8"

      >

        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">

          <IconCheck className="w-8 h-8 text-green-500" strokeWidth={3} />

        </div>

      </motion.div>



      {/* Texto de confirmación */}

      <motion.div

        initial={{ y: 20, opacity: 0 }}

        animate={{ y: 0, opacity: 1 }}

        transition={{ delay: 0.2 }}

        className="text-center space-y-2 mb-8"

      >

        <h3 className="text-xl font-medium text-gray-900">

          ¡Clase Creada Exitosamente!

        </h3>

        <p className="text-sm text-gray-500 max-w-sm">

          {visibility === 'public' 

            ? 'Tu clase ya está disponible en el listado general y mediante el link directo'

            : 'Tu clase está disponible mediante el link directo'

          }

        </p>

      </motion.div>



      {/* Detalles de la clase */}

      <motion.div

        initial={{ y: 20, opacity: 0 }}

        animate={{ y: 0, opacity: 1 }}

        transition={{ delay: 0.3 }}

        className="w-full space-y-8"

      >

        {/* Card de detalles */}

        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">

          {className && (

            <div className="p-4 flex justify-between items-center">

              <span className="text-sm text-gray-600">Nombre</span>

              <span className="text-sm font-medium text-gray-900">{className}</span>

            </div>

          )}

          {selectedDate && (

            <div className="p-4 flex justify-between items-center">

              <span className="text-sm text-gray-600">Fecha</span>

              <span className="text-sm font-medium text-gray-900">

                {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}

              </span>

            </div>

          )}

          <div className="p-4 flex justify-between items-center">

            <span className="text-sm text-gray-600">Cancha</span>

            <span className="text-sm font-medium text-gray-900">

              {selectedCourts.map(id => 

                courts.find(court => court.id === id)?.name

              ).join(', ')}

            </span>

          </div>

          <div className="p-4 flex justify-between items-center">

            <span className="text-sm text-gray-600">Visibilidad</span>

            <span className="text-sm font-medium text-gray-900">

              {visibility === 'public' ? 'Pública' : 'Privada'}

            </span>

          </div>

        </div>



        {/* Link de la clase */}

        <div className="space-y-3">

          <div className="flex items-center justify-between">

            <label className="text-sm font-medium text-gray-700">

              Link de inscripción

            </label>

            <span className="text-xs text-gray-500">

              Comparte este link con tus alumnos

            </span>

          </div>

          <ClassLinkShare classId={classId} />

        </div>

      </motion.div>

    </div>

  )

} 


