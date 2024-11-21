"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Branch, BranchFormData } from "@/types/branch"
import { branchService } from "@/services/branchService"
import { useOrganization } from "@/hooks/useOrganization"
import { NewBranchModal } from "./NewBranchModal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { IconPlus, IconTrash, IconEdit, IconMapPin, IconPhone, IconUser, IconLoader, IconRefresh } from "@tabler/icons-react"
import { toast } from "@/components/ui/use-toast"
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { EditBranchModal } from "./EditBranchModal"

export function BranchSettings() {
  const { organizationId } = useOrganization()
  const [isNewBranchModalOpen, setIsNewBranchModalOpen] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null)
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null)
  const queryClient = useQueryClient()

  // Usar React Query para manejar el estado y caché de las sedes
  const { 
    data: branches = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['branches', organizationId],
    queryFn: () => branchService.getBranches(organizationId!).then(res => res.data || []),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // Datos considerados frescos por 5 minutos
    cacheTime: 30 * 60 * 1000, // Mantener en caché por 30 minutos
  })

  // Mutación para crear sedes
  const createBranchMutation = useMutation({
    mutationFn: (formData: BranchFormData) => 
      branchService.createBranch(formData, organizationId!),
    onSuccess: (response) => {
      if (response.data) {
        // Actualizar la caché optimistamente
        queryClient.setQueryData(['branches', organizationId], 
          (old: Branch[] = []) => [response.data!, ...old]
        )
        setIsNewBranchModalOpen(false)
        toast({
          title: "Éxito",
          description: "La sede se ha creado correctamente",
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear sede",
        description: error.message || "No se pudo crear la sede",
        variant: "destructive",
      })
    }
  })

  // Mutación para eliminar sedes
  const deleteBranchMutation = useMutation({
    mutationFn: (branchId: string) => 
      branchService.deleteBranch(branchId),
    onMutate: async (branchId) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries(['branches', organizationId])

      // Guardar el estado anterior
      const previousBranches = queryClient.getQueryData(['branches', organizationId])

      // Actualizar la caché optimistamente
      queryClient.setQueryData(['branches', organizationId], 
        (old: Branch[] = []) => old.filter(b => b.id !== branchId)
      )

      return { previousBranches }
    },
    onSuccess: () => {
      toast({
        title: "Sede eliminada",
        description: "La sede se ha eliminado correctamente",
      })
      setBranchToDelete(null)
    },
    onError: (error: any, _, context) => {
      // Revertir a los datos anteriores en caso de error
      queryClient.setQueryData(['branches', organizationId], context?.previousBranches)
      toast({
        title: "Error al eliminar sede",
        description: error.message || "No se pudo eliminar la sede",
        variant: "destructive",
      })
    }
  })

  // Mutación para actualizar sedes
  const updateBranchMutation = useMutation({
    mutationFn: ({ branchId, formData }: { branchId: string, formData: BranchFormData }) => 
      branchService.updateBranch(branchId, formData, organizationId!),
    onSuccess: (response) => {
      if (response.data) {
        // Actualizar la caché optimistamente
        queryClient.setQueryData(['branches', organizationId], 
          (old: Branch[] = []) => old.map(b => 
            b.id === response.data!.id ? response.data! : b
          )
        )
        setBranchToEdit(null)
        toast({
          title: "Éxito",
          description: "La sede se ha actualizado correctamente",
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar sede",
        description: error.message || "No se pudo actualizar la sede",
        variant: "destructive",
      })
    }
  })

  // Memoizar el renderizado de las tarjetas para evitar re-renders innecesarios
  const renderBranchCards = useMemo(() => {
    if (branches.length === 0 && !isLoading) {
      return (
        <div className="col-span-2 text-center py-8 text-gray-500">
          No hay sedes registradas
        </div>
      )
    }

    return branches.map((branch) => (
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
                branch.is_active 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}>
                {branch.is_active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-900"
              onClick={() => setBranchToEdit(branch)}
            >
              <IconEdit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-600"
              onClick={() => setBranchToDelete(branch)}
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
          {branch.manager_id && (
            <div className="flex items-center gap-2 text-gray-600">
              <IconUser className="h-4 w-4 flex-shrink-0" />
              <span>{branch.manager_id}</span>
            </div>
          )}
        </div>

        {/* Contador de canchas */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Canchas disponibles</span>
            <span className="text-sm font-medium">{branch.courts}</span>
          </div>
        </div>
      </div>
    ))
  }, [branches, isLoading])

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado con botones */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-medium">Lista de Sedes</h3>
          {isLoading && <IconLoader className="h-4 w-4 animate-spin" />}
          {!isLoading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="h-8 w-8 text-gray-500 hover:text-gray-900"
            >
              <IconRefresh className="h-4 w-4" />
            </Button>
          )}
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
        {renderBranchCards}
      </div>

      {/* Modales */}
      <NewBranchModal 
        isOpen={isNewBranchModalOpen}
        onClose={() => setIsNewBranchModalOpen(false)}
        onSave={(formData) => createBranchMutation.mutate(formData)}
      />

      <ConfirmDialog
        isOpen={!!branchToDelete}
        onClose={() => setBranchToDelete(null)}
        onConfirm={() => branchToDelete && deleteBranchMutation.mutate(branchToDelete.id)}
        title="Eliminar sede"
        description={`¿Estás seguro de que deseas eliminar la sede "${branchToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      <EditBranchModal 
        branch={branchToEdit}
        isOpen={!!branchToEdit}
        onClose={() => setBranchToEdit(null)}
        onSave={(branchId, formData) => 
          updateBranchMutation.mutate({ branchId, formData })
        }
      />
    </div>
  )
} 