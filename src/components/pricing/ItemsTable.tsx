"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { IconPlus, IconTrash, IconEdit, IconDots } from "@tabler/icons-react"
import { NewItemModal } from "./NewItemModal"
import { itemService } from "@/services/itemService"
import { toast } from "sonner"
import type { Item } from "@/types/items"
import { useBranchContext } from '@/contexts/BranchContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ItemsTable() {
  // 1. Hooks y estado
  const { currentBranch } = useBranchContext()
  const queryClient = useQueryClient()
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 2. Query para obtener items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items', currentBranch?.id],
    queryFn: () => {
      if (!currentBranch?.id) throw new Error('No hay una sede seleccionada')
      return itemService.getItemsByBranch(currentBranch.id)
    },
    enabled: !!currentBranch?.id,
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  // 3. Mutations
  const mutation = useMutation({
    mutationFn: async (itemData: Omit<Item, 'id'> & { id?: string }) => {
      if (!currentBranch?.id) throw new Error('No hay una sede seleccionada')
      
      if (itemData.id) {
        // Si hay ID, es una actualización
        return itemService.updateItem(itemData.id, itemData, currentBranch.id)
      } else {
        // Si no hay ID, es una creación
        return itemService.createItem(itemData, currentBranch.id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', currentBranch?.id] })
      setIsNewItemModalOpen(false)
      setEditingItem(null)
      toast.success(
        editingItem ? 'Artículo actualizado correctamente' : 'Artículo creado correctamente'
      )
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al guardar el artículo')
    }
  })

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentBranch?.id) throw new Error('No hay una sede seleccionada')
      return itemService.deleteItem(id, currentBranch.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', currentBranch?.id] })
      toast.success('Artículo eliminado correctamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el artículo')
    }
  })

  // 4. Handlers
  const handleNewItem = async (itemData: Omit<Item, 'id'>) => {
    try {
      await mutation.mutateAsync({
        ...itemData,
        id: editingItem?.id // Incluir el ID si estamos editando
      })
    } catch (error) {
      console.error('Error al guardar el artículo:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      console.error('Error al eliminar el artículo:', error)
    }
  }

  // 5. Filtrado de items (simplificado)
  const getFilteredItems = () => items

  // Renderizado del contenido basado en el estado
  const renderContent = () => {
    // Si no estamos en el cliente, mostramos un placeholder consistente
    if (!isClient) {
      return (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!currentBranch) {
      return (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <p className="text-gray-500">Selecciona una sede para ver sus artículos</p>
          <Button 
            variant="outline"
            onClick={() => document.getElementById('branch-selector')?.click()}
          >
            Seleccionar Sede
          </Button>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-medium">Lista de Artículos</h3>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsNewItemModalOpen(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2 text-sm"
            >
              <IconPlus className="h-5 w-5" />
              <span>Nuevo Artículo</span>
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <table className="min-w-full table-fixed bg-white">
            <thead>
              <tr>
                <th className="w-1/3 px-6 py-3 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="w-1/4 px-6 py-3 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="w-1/6 px-6 py-3 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="w-1/6 px-6 py-3 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Depósito
                </th>
                <th className="w-[68px] px-4 py-3 border-b border-gray-200"></th>
              </tr>
            </thead>
            <tbody>
              {getFilteredItems().map((item) => (
                <tr 
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 border-b border-gray-200">
                    <span className="text-sm font-medium">{item.name}</span>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-center">
                    <span className="text-sm text-gray-500">
                      {item.type === 'equipment' && 'Equipamiento'}
                      {item.type === 'accessory' && 'Accesorio'}
                      {item.type === 'consumable' && 'Consumible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-center">
                    <span className="text-sm text-gray-500">{item.stock}</span>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-center">
                    <span className="text-sm text-gray-500">
                      {item.requires_deposit ? `${item.deposit_amount}€` : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-gray-200">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
                            <IconDots className="h-4 w-4 text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => {
                            setEditingItem(item)
                            setIsNewItemModalOpen(true)
                          }}>
                            <IconEdit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <IconTrash className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <NewItemModal
          isOpen={isNewItemModalOpen}
          onClose={() => {
            setIsNewItemModalOpen(false)
            setEditingItem(null)
          }}
          onSave={handleNewItem}
          onDelete={handleDeleteItem}
          editingItem={editingItem || undefined}
          mode={editingItem ? 'edit' : 'create'}
        />
      </div>
    )
  }

  // Renderizado principal con estructura consistente
  return (
    <div className="p-4">
      {renderContent()}
    </div>
  )
} 