"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { NewCourtModal } from "./NewCourtModal"

type SurfaceType = 'crystal' | 'synthetic' | 'clay' | 'grass' | 'rubber' | 'concrete' | 'panoramic' | 'premium'

interface Court {
  id: string
  name: string
  type: 'indoor' | 'outdoor'
  surface: SurfaceType
  isActive: boolean
  hasLighting: boolean
}

// Datos de ejemplo actualizados con los nuevos tipos de superficie
const initialCourts: Court[] = [
  { id: '1', name: 'Cancha Principal', type: 'indoor', surface: 'crystal', isActive: true, hasLighting: true },
  { id: '2', name: 'Cancha Exterior 1', type: 'outdoor', surface: 'synthetic', isActive: true, hasLighting: true },
  { id: '3', name: 'Cancha Exterior 2', type: 'outdoor', surface: 'clay', isActive: false, hasLighting: false },
  { id: '4', name: 'Cancha Cubierta', type: 'indoor', surface: 'premium', isActive: true, hasLighting: true },
]

export function CourtsTable() {
  const [courts, setCourts] = useState<Court[]>(initialCourts)
  const [popoverOpen, setPopoverOpen] = useState<Record<string, boolean>>({})
  const [isNewCourtModalOpen, setIsNewCourtModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | undefined>()

  const handleStatusChange = (courtId: string, newStatus: boolean) => {
    setPopoverOpen(prev => ({ ...prev, [courtId]: false }))
    setCourts(prevCourts =>
      prevCourts.map(court =>
        court.id === courtId ? { ...court, isActive: newStatus } : court
      )
    )
  }

  const handleNewCourt = (courtData: Omit<Court, 'id'>) => {
    if (editingCourt) {
      // Modo edición
      setCourts(prevCourts =>
        prevCourts.map(court =>
          court.id === editingCourt.id
            ? {
                ...court,
                ...courtData,
                type: courtData.isIndoor ? 'indoor' : 'outdoor'
              }
            : court
        )
      )
    } else {
      // Modo creación
      const newCourt: Court = {
        ...courtData,
        id: `${courts.length + 1}`,
        type: courtData.isIndoor ? 'indoor' : 'outdoor'
      }
      setCourts(prev => [...prev, newCourt])
    }
    setEditingCourt(undefined)
  }

  const handleDeleteCourt = (courtId: string) => {
    setCourts(prevCourts => prevCourts.filter(court => court.id !== courtId))
  }

  const handleCourtClick = (court: Court) => {
    setEditingCourt(court)
    setIsNewCourtModalOpen(true)
  }

  // Función actualizada para obtener el texto descriptivo
  const getCourtDescription = (type: string, surface: SurfaceType) => {
    const surfaceMap = {
      crystal: 'Cristal Panorámico',
      panoramic: 'Cristal Premium',
      premium: 'Cristal Pro',
      synthetic: 'Césped Sintético',
      clay: 'Tierra Batida',
      grass: 'Césped Natural',
      rubber: 'Goma Profesional',
      concrete: 'Hormigón Pulido'
    }
    const typeMap = {
      indoor: 'Cubierta',
      outdoor: 'Exterior'
    }
    return `${typeMap[type as keyof typeof typeMap]} • ${surfaceMap[surface]}`
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-xl font-medium">Lista de Canchas</h3>
        </div>

        <Button 
          onClick={() => setIsNewCourtModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center text-sm"
        >
          <IconPlus className="h-5 w-5 mr-2" />
          Nueva Cancha
        </Button>
      </div>

      {/* Lista de Canchas */}
      <div className="px-4 pb-4">
        <div className="space-y-3">
          {courts.map((court) => (
            <div
              key={court.id}
              onClick={() => handleCourtClick(court)}
              className="flex items-center justify-between p-4 rounded-lg border bg-white hover:border-black transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <h4 className="text-base font-medium">{court.name}</h4>
                <p className="text-sm text-gray-500">
                  {getCourtDescription(court.type, court.surface)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 mr-2">
                  {court.isActive ? 'Activa' : 'Suspendida'}
                </span>
                <Popover 
                  open={popoverOpen[court.id]} 
                  onOpenChange={(open) => {
                    if (court.isActive !== !court.isActive) {
                      setPopoverOpen(prev => ({ ...prev, [court.id]: open }))
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <div>
                      <Switch
                        checked={court.isActive}
                        onCheckedChange={() => {
                          setPopoverOpen(prev => ({ ...prev, [court.id]: true }))
                        }}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="end">
                    <div className="text-sm">
                      <p>¿Desea {court.isActive ? 'suspender' : 'activar'} esta cancha?</p>
                      <div className="flex justify-end gap-2 mt-2">
                        <button 
                          className="px-2 py-1 text-xs bg-gray-100 rounded-md hover:bg-gray-200"
                          onClick={() => handleStatusChange(court.id, !court.isActive)}
                        >
                          Sí
                        </button>
                        <button 
                          className="px-2 py-1 text-xs bg-black text-white rounded-md hover:bg-gray-800"
                          onClick={() => setPopoverOpen(prev => ({ ...prev, [court.id]: false }))}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewCourtModal
        isOpen={isNewCourtModalOpen}
        onClose={() => {
          setIsNewCourtModalOpen(false)
          setEditingCourt(undefined)
        }}
        onSave={handleNewCourt}
        onDelete={handleDeleteCourt}
        editingCourt={editingCourt}
        mode={editingCourt ? 'edit' : 'create'}
      />
    </div>
  )
} 