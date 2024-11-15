"use client"



import { useState, useRef } from "react"

import { cn } from "@/lib/utils"

import { motion, AnimatePresence } from "framer-motion"



interface TimeSlot {

  hour: string

  subSlots: {

    time: string

    minutes: number

  }[]

}



interface TimeSelection {

  startTime: string

  endTime: string

  duration: number

}



interface TimeSlotSelectorProps {

  selectedCourts: string[]

  onTimeSelect: (selection: {

    startTime: string

    endTime: string

    duration: number

  }) => void

}



const generateTimeSlots = (): TimeSlot[] => {

  const slots: TimeSlot[] = []

  for (let hour = 7; hour < 23; hour++) {

    const period = hour < 12 ? 'AM' : 'PM'

    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

    const hourString = `${displayHour.toString().padStart(2, '0')}:00 ${period}`

    

    const subSlots = []

    for (let minutes = 0; minutes < 60; minutes += 15) {

      const time = `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`

      subSlots.push({

        time,

        minutes: hour * 60 + minutes

      })

    }

    

    slots.push({

      hour: hourString,

      subSlots

    })

  }

  return slots

}



const timeSlots = generateTimeSlots()



export function TimeSlotSelector({ selectedCourts, onTimeSelect }: TimeSlotSelectorProps) {

  const [isMouseDown, setIsMouseDown] = useState(false)

  const [isDragging, setIsDragging] = useState(false)

  const [selection, setSelection] = useState<TimeSelection | null>(null)

  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null)

  const selectionStartRef = useRef<{ time: string } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)



  const timeToMinutes = (time: string): number => {

    const [timeStr, period] = time.split(' ')

    let [hours, minutes = 0] = timeStr.split(':').map(Number)

    

    if (period === 'PM' && hours !== 12) hours += 12

    if (period === 'AM' && hours === 12) hours = 0

    

    return hours * 60 + minutes

  }



  const minutesToTime = (minutes: number): string => {

    const hours = Math.floor(minutes / 60)

    const mins = minutes % 60

    const period = hours < 12 ? 'AM' : 'PM'

    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

    

    return `${displayHour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`

  }



  const getNextTimeSlot = (time: string): string => {

    const minutes = timeToMinutes(time)

    return minutesToTime(minutes + 15)

  }



  const isSlotSelected = (time: string): boolean => {

    if (!selection) return false

    const timeMinutes = timeToMinutes(time)

    const startMinutes = timeToMinutes(selection.startTime)

    const endMinutes = timeToMinutes(selection.endTime)

    return timeMinutes >= Math.min(startMinutes, endMinutes) && 

           timeMinutes < Math.max(startMinutes, endMinutes)

  }



  const formatDuration = (startTime: string, endTime: string): string => {

    const start = timeToMinutes(startTime)

    const end = timeToMinutes(endTime)

    const duration = end - start

    const hours = Math.floor(duration / 60)

    const minutes = duration % 60

    

    let durationText = ''

    if (hours === 0) durationText = `${minutes}min`

    else if (minutes === 0) durationText = `${hours}h`

    else durationText = `${hours}h ${minutes}min`

    

    // Formatear las horas de inicio y fin para mostrarlas más compactas

    const formattedStart = startTime.replace(':00 ', '')

    const formattedEnd = endTime.replace(':00 ', '')

    

    return `${formattedStart} - ${formattedEnd} (${durationText})`

  }



  const handleMouseDown = (time: string, event: React.MouseEvent) => {

    event.preventDefault()

    setIsMouseDown(true)

    setIsDragging(true)

    selectionStartRef.current = { time }

    

    const nextSlot = getNextTimeSlot(time)

    setSelection({

      startTime: time,

      endTime: nextSlot,

      duration: 15

    })



    if (containerRef.current) {

      const rect = containerRef.current.getBoundingClientRect()

      setTooltipPosition({

        x: event.clientX - rect.left,

        y: event.clientY - rect.top - 10

      })

    }

  }



  const handleMouseEnter = (time: string, event: React.MouseEvent) => {

    if (!isMouseDown || !isDragging || !selectionStartRef.current) return



    try {

      const startMinutes = timeToMinutes(selectionStartRef.current.time)

      const currentMinutes = timeToMinutes(time)

      

      // Calcular el rango de minutos

      const minTime = Math.min(startMinutes, currentMinutes)

      const maxTime = Math.max(startMinutes, currentMinutes)

      

      // Asegurar que la selección incluya todos los intervalos de 15 minutos

      const slots = Math.ceil((maxTime - minTime) / 15)

      const endTime = minTime + (slots * 15)

      

      // Verificar si estamos en el último slot y permitir completar la hora

      const isLastSlot = time === timeSlots[timeSlots.length - 1].subSlots[3].time

      const finalEndTime = isLastSlot && endTime < timeToMinutes("22:00 PM")

        ? endTime + 15

        : endTime



      setSelection({

        startTime: minutesToTime(minTime),

        endTime: minutesToTime(finalEndTime),

        duration: Math.ceil((finalEndTime - minTime) / 15) * 15

      })



    } catch (error) {

      console.error('Error handling mouse enter:', error)

    }

  }



  const handleMouseUp = () => {

    if (isMouseDown && selection) {

      onTimeSelect(selection)

    }

    setIsMouseDown(false)

    setIsDragging(false)

  }



  const handleMouseLeave = () => {

    if (isMouseDown) {

      setIsMouseDown(false)

      setIsDragging(false)

    }

  }



  const handleTimeSelect = (start: string, end: string) => {

    // Calcular la duración en minutos

    const [startHour, startMinute] = start.split(':').map(Number)

    const [endHour, endMinute] = end.split(':').map(Number)

    

    const startMinutes = startHour * 60 + startMinute

    const endMinutes = endHour * 60 + endMinute

    

    const duration = endMinutes - startMinutes



    onTimeSelect({

      startTime: start,

      endTime: end,

      duration

    })

  }



  return (

    <div className="space-y-4">

      {/* Tabla de selección */}

      <div 

        ref={containerRef}

        className="select-none bg-white rounded-lg border relative overflow-hidden"

        onMouseUp={handleMouseUp}

        onMouseLeave={handleMouseLeave}

      >

        <div className="grid grid-cols-[auto,1fr] divide-x">

          {/* Columna de horas */}

          <div className="pr-2">

            {timeSlots.map((slot) => (

              <div 

                key={slot.hour}

                className="h-[40px] flex items-center justify-end px-2"

              >

                <span className="text-[11px] text-gray-400 font-medium">

                  {slot.hour}

                </span>

              </div>

            ))}

          </div>



          {/* Columna de slots seleccionables */}

          <div className="relative">

            {/* Capa de líneas divisorias */}

            <div className="absolute inset-0 pointer-events-none">

              {timeSlots.map((_, index) => (

                <div 

                  key={index}

                  className="h-[40px] border-b"

                  style={{

                    borderColor: index === timeSlots.length - 1 ? 'transparent' : undefined

                  }}

                />

              ))}

            </div>



            {/* Capa de slots interactivos */}

            <div className="relative">

              {timeSlots.map((hourSlot, index) => (

                <div 

                  key={hourSlot.hour} 

                  className="h-[40px] relative"

                >

                  {hourSlot.subSlots.map((subSlot, subIndex) => (

                    <div

                      key={subSlot.time}

                      className={cn(

                        "absolute cursor-pointer transition-colors",

                        isSlotSelected(subSlot.time) && "bg-gray-100"

                      )}

                      style={{

                        top: `${(subIndex * 25)}%`,

                        height: '25%',

                        left: 0,

                        right: 0

                      }}

                      onMouseDown={(e) => handleMouseDown(subSlot.time, e)}

                      onMouseEnter={(e) => handleMouseEnter(subSlot.time, e)}

                    />

                  ))}

                </div>

              ))}

            </div>



            {/* Área invisible para extender la selección */}

            <div 

              className="absolute left-0 right-0 h-[10px] bottom-0"

              onMouseEnter={(e) => {

                if (isMouseDown && isDragging) {

                  const lastSlot = timeSlots[timeSlots.length - 1].subSlots[3]

                  handleMouseEnter(lastSlot.time, e)

                }

              }}

              onMouseMove={(e) => {

                if (isMouseDown && isDragging) {

                  const lastSlot = timeSlots[timeSlots.length - 1].subSlots[3]

                  handleMouseEnter(lastSlot.time, e)

                }

              }}

            />

          </div>

        </div>



        {/* Tooltip */}

        <AnimatePresence>

          {selection && tooltipPosition && (

            <motion.div

              initial={{ opacity: 0, y: 5 }}

              animate={{ opacity: 1, y: 0 }}

              exit={{ opacity: 0, y: 5 }}

              className="absolute text-xs px-2 py-1 pointer-events-none whitespace-nowrap z-50 text-gray-900"

              style={{

                left: `${tooltipPosition.x}px`,

                top: `${tooltipPosition.y}px`,

                transform: 'translate(-50%, -100%)'

              }}

            >

              {formatDuration(selection.startTime, selection.endTime)}

            </motion.div>

          )}

        </AnimatePresence>

      </div>



      {/* Panel informativo de horario seleccionado */}

      <AnimatePresence mode="wait">

        {selection && (

          <motion.div

            initial={{ opacity: 0, y: 5 }}

            animate={{ opacity: 1, y: 0 }}

            exit={{ opacity: 0, y: -5 }}

            className="bg-white rounded-lg border border-gray-100"

          >

            <div className="p-4">

              <div className="flex items-center gap-4">

                <div className="w-[2px] self-stretch bg-black/10" /> {/* Línea más fina y sutil */}

                <div className="flex-1 flex items-center justify-between">

                  <div className="space-y-0.5">

                    <p className="text-xs text-gray-400">

                      Horario seleccionado

                    </p>

                    <p className="text-sm text-gray-900">

                      {selection.startTime.replace(':00 ', '')} - {selection.endTime.replace(':00 ', '')}

                    </p>

                  </div>

                  <div className="text-xs text-gray-500">

                    {(() => {

                      const start = timeToMinutes(selection.startTime)

                      const end = timeToMinutes(selection.endTime)

                      const duration = end - start

                      const hours = Math.floor(duration / 60)

                      const minutes = duration % 60

                      

                      if (hours === 0) return `${minutes}min`

                      if (minutes === 0) return `${hours}h`

                      return `${hours}h ${minutes}min`

                    })()}

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  )

}
