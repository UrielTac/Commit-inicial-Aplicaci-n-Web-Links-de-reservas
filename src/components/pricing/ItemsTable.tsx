"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconPlus, IconSettings, IconUser, IconTrash, IconEdit, IconFilter, IconDots, IconChevronLeft, IconChevronRight, IconPackage } from "@tabler/icons-react"
import { NewItemModal } from "./NewItemModal"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { type Item } from '@/types/items'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-3"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

// Datos de ejemplo
const initialItems: Item[] = [
  {
    id: '1',
    name: 'Raqueta Pro Carbon',
    type: 'equipment',
    pricing: { 60: 15, 120: 25 },
    defaultDuration: 60,
    stock: 10,
    requiresDeposit: true,
    depositAmount: 50,
    isActive: true
  },
  {
    id: '2',
    name: 'Pelotas Premium',
    type: 'consumable',
    pricing: { 60: 5 },
    defaultDuration: 60,
    stock: 100,
    requiresDeposit: false,
    isActive: true
  },
  {
    id: '3',
    name: 'Máquina Lanzapelotas',
    type: 'equipment',
    pricing: { 30: 20, 60: 35, 90: 45 },
    defaultDuration: 60,
    stock: 2,
    requiresDeposit: true,
    depositAmount: 200,
    isActive: true
  }
]

export function ItemsTable() {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    type: "",
  })
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const itemsPerPage = 10
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean
    itemId: string | null
    itemName: string
    position: { x: number; y: number }
  }>({
    isOpen: false,
    itemId: null,
    itemName: '',
    position: { x: 0, y: 0 }
  })

  const handleSaveItem = (itemData: Omit<Item, 'id'>) => {
    if (editingItem) {
      // Actualizar item existente
      setItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...itemData, id: editingItem.id }
          : item
      ))
      setEditingItem(null)
    } else {
      // Crear nuevo item y añadirlo al principio de la lista
      const newItem: Item = {
        ...itemData,
        id: `item-${Date.now()}`,
      }
      setItems(prev => [newItem, ...prev])
    }
    setIsNewItemModalOpen(false)
  }

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setIsNewItemModalOpen(true)
  }

  // Filtrar items
  const getFilteredItems = () => {
    return items.filter(item => {
      const matchesSearch = filters.search === "" || 
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesType = filters.type === "" || item.type === filters.type
      
      return matchesSearch && matchesType
    })
  }

  // Obtener items de la página actual
  const getCurrentPageItems = () => {
    const filteredItems = getFilteredItems()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredItems.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(getFilteredItems().length / itemsPerPage)

  // Función para obtener el estilo según el tipo de artículo
  const getTypeStyle = (type: string): string => {
    return 'bg-[#F3F4F6] text-[#6B6468] px-3 py-1 rounded-full text-sm font-medium'
  }

  // Función para formatear el precio
  const formatPrice = (pricing: { [key: number]: number }): string => {
    const prices = Object.entries(pricing)
    if (prices.length === 0) return 'No disponible'
    const [duration, price] = prices[0]
    return `${price}€/${duration}min`
  }

  // Función para manejar el clic en una fila
  const handleRowClick = (item: Item) => {
    setEditingItem(item)
    setIsNewItemModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setConfirmDelete({
      isOpen: true,
      itemId: item.id,
      itemName: item.name,
      position: {
        x: rect.left - 320, // ancho del popover
        y: rect.top
      }
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDelete.itemId) {
      handleDeleteItem(confirmDelete.itemId)
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium">
            Gestión de Artículos
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtros */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="p-2 bg-white hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
              >
                <IconFilter className="h-4 w-4" stroke={1.5} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm">Buscar por nombre</h4>
                  <Input
                    placeholder="Escriba para buscar..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      search: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">Tipo de artículo</h4>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters(prev => ({
                      ...prev,
                      type: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los tipos</SelectItem>
                      <SelectItem value="equipment">Equipamiento</SelectItem>
                      <SelectItem value="accessory">Accesorio</SelectItem>
                      <SelectItem value="consumable">Consumible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => setFilters({ search: "", type: "" })}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Botón de nuevo artículo - Actualizado para coincidir con BookingsTable */}
          <Button 
            onClick={() => {
              setEditingItem(null)
              setIsNewItemModalOpen(true)
            }}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2 text-sm shadow-sm transition-all duration-200"
          >
            <IconPlus className="h-5 w-5" />
            <span>Nuevo Artículo</span>
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <table className="min-w-full table-fixed bg-white">
          <thead>
            <tr>
              <th className="w-1/3 px-6 py-3 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Artículo
              </th>
              <th className="w-24 px-6 py-3 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="w-32 px-6 py-3 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Precio Base
              </th>
              <th className="w-32 px-6 py-3 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Garantía
              </th>
              <th className="w-20 px-4 py-3 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageItems().map((item) => (
              <tr 
                key={item.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(item)}
              >
                <td className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconPackage className="h-5 w-5 text-gray-500" />
                    </div>
                    <span className="ml-4 text-sm truncate">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-center">
                  <span className="text-sm text-gray-500">{item.stock}</span>
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-center">
                  <span className="text-sm text-gray-500">{formatPrice(item.pricing)}</span>
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-center">
                  <span className="text-sm text-gray-500">
                    {item.requiresDeposit ? `${item.depositAmount}€` : '-'}
                  </span>
                </td>
                <td className="px-4 py-4 border-b border-gray-200 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <div 
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={(e) => e.stopPropagation()} // Evitar que el clic en los tres puntos abra el modal
                      >
                        <IconDots className="h-4 w-4 text-gray-500" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditItem(item)
                        }}
                      >
                        <IconEdit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => handleDeleteClick(e, item)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex-1 text-sm text-gray-500">
          {getFilteredItems().length === 0 ? (
            "No se encontraron artículos"
          ) : (
            `${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, getFilteredItems().length)} de ${getFilteredItems().length} artículos`
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal */}
      <NewItemModal
        isOpen={isNewItemModalOpen}
        onClose={() => {
          setIsNewItemModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSaveItem}
        editingItem={editingItem || undefined}
        mode={editingItem ? 'edit' : 'create'}
      />

      <ConfirmationDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title="Eliminar artículo"
        description={`¿Estás seguro de que deseas eliminar "${confirmDelete.itemName}"? Esta acción no se puede deshacer.`}
        position={confirmDelete.position}
      />
    </div>
  )
} 