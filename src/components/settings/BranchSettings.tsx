"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconPlus, IconTrash, IconEdit, IconMapPin, IconPhone, IconUser } from "@tabler/icons-react"
import { NewBranchModal } from "./NewBranchModal"

interface Branch {
  id: number
  name: string
  address: string
  phone: string
  isActive: boolean
  manager: string
  courts: number
}

export function BranchSettings() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: 1,
      name: "Sede Principal",
      address: "Calle Principal 123",
      phone: "+34 123 456 789",
      isActive: true,
      manager: "Juan Pérez",
      courts: 6
    },
    {
      id: 2,
      name: "Sede Norte",
      address: "Avenida Norte 456",
      phone: "+34 987 654 321",
      isActive: true,
      manager: "María García",
      courts: 4
    }
  ])

  const [isNewBranchModalOpen, setIsNewBranchModalOpen] = useState(false)

  const handleSaveBranch = (branchData: any) => {
    setBranches(prev => [...prev, {
      id: prev.length + 1,
      ...branchData,
      courts: 0 // Valor inicial
    }])
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado con botón de nueva sede */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-xl font-medium">Lista de Sedes</h3>
        </div>
        <Button 
          onClick={() => setIsNewBranchModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2 text-sm shadow-sm transition-all duration-200"
        >
          <IconPlus className="h-5 w-5" />
          <span>Nueva Sede</span>
        </Button>
      </div>

      {/* Lista de sucursales */}
      <div className="grid gap-4 md:grid-cols-2">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="group relative p-6 border border-gray-200 rounded-lg bg-white hover:border-black transition-all duration-200"
          >
            {/* Encabezado de la tarjeta */}
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-medium">{branch.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    branch.isActive 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {branch.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-900"
                >
                  <IconEdit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Información de la sucursal */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <IconMapPin className="h-4 w-4 flex-shrink-0" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <IconPhone className="h-4 w-4 flex-shrink-0" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <IconUser className="h-4 w-4 flex-shrink-0" />
                <span>{branch.manager}</span>
              </div>
            </div>

            {/* Contador de canchas */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Canchas disponibles</span>
                <span className="text-sm font-medium">{branch.courts}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NewBranchModal 
        isOpen={isNewBranchModalOpen}
        onClose={() => setIsNewBranchModalOpen(false)}
        onSave={handleSaveBranch}
      />
    </div>
  )
} 