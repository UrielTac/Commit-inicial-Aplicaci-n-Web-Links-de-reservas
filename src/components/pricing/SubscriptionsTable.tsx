"use client"























import { useState } from "react"















import { IconPlus, IconFilter, IconChevronDown, IconDots, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"















import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"















import { Input } from "@/components/ui/input"















import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"















// Agregar esta importación
import { NewSubscriptionModal } from "./NewSubscriptionModal"































// Datos de ejemplo















const MOCK_SUBSCRIPTIONS: Subscription[] = [















  {















    id: "1",















    name: "Plan Básico",















    price: 29.99,















    interval: 'monthly',















    features: ["Acceso a canchas", "Reservas básicas"],















    isActive: true,















    launchDate: "2024-04-01",    // Fecha de lanzamiento















    startDate: "2024-04-01",     // Fecha de inicio















    endDate: "2024-12-31"        // Fecha de fin















  },















  {















    id: "2",















    name: "Plan Premium",















    price: 49.99,















    interval: 'monthly',















    features: ["Acceso a canchas", "Reservas premium", "Máquina de bolas"],















    isActive: true,















    launchDate: "2024-03-15",















    startDate: "2024-03-15",















    endDate: "2024-12-31"















  },















  // ... más datos de ejemplo















]































interface ColumnConfig {















  id: string















  title: string















  isVisible: boolean















}






























// Actualizar la interfaz Subscription
interface Subscription {
  id: string
  name: string
  price: number
  interval: 'monthly' | 'yearly'
  features: string[]
  isActive: boolean
  launchDate: string
  startDate: string
  endDate: string
  description?: string
  isDefault?: boolean
  isPublic?: boolean
  requirePayment?: boolean
  retentionTime?: number
  requireAdvancePayment?: boolean
  preventCancellation?: boolean
}































export function SubscriptionsTable() {







  const [subscriptionsData, setSubscriptionsData] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS)















  const [selectedRows, setSelectedRows] = useState<string[]>([])















  const [currentPage, setCurrentPage] = useState(1)















  const [filters, setFilters] = useState({















    search: "",















    status: "",















    interval: ""















  })















  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({















    name: true,















    price: true,















    interval: true,















    status: true,















    launchDate: true,















    period: true, // Nueva columna combinada















  })































  const itemsPerPage = 10































  // Configuración de columnas disponibles















  const availableColumns: ColumnConfig[] = [















    { id: 'name', title: 'Nombre', isVisible: columnVisibility.name },















    { id: 'price', title: 'Precio', isVisible: columnVisibility.price },















    { id: 'interval', title: 'Intervalo', isVisible: columnVisibility.interval },















    { id: 'status', title: 'Estado', isVisible: columnVisibility.status },















    { id: 'launchDate', title: 'Lanzamiento', isVisible: columnVisibility.launchDate },















    { id: 'period', title: 'Periodo', isVisible: columnVisibility.period },















  ]































  // Función para filtrar suscripciones















  const getFilteredSubscriptions = () => {















    return subscriptionsData.filter(subscription => {















      const matchesSearch = filters.search === "" || 















        subscription.name.toLowerCase().includes(filters.search.toLowerCase())















      















      const matchesStatus = filters.status === "" || 















        (filters.status === "active" ? subscription.isActive : !subscription.isActive)















      















      const matchesInterval = filters.interval === "" || subscription.interval === filters.interval































      return matchesSearch && matchesStatus && matchesInterval















    })















  }































  const totalPages = Math.ceil(getFilteredSubscriptions().length / itemsPerPage)















  const currentSubscriptions = getFilteredSubscriptions().slice(















    (currentPage - 1) * itemsPerPage,















    currentPage * itemsPerPage















  )































  // Función auxiliar para formatear la fecha















  function formatDate(dateString: string) {















    const date = new Date(dateString)















    return date.toLocaleDateString('es-ES', {















      day: '2-digit',















      month: '2-digit',















      year: '2-digit'















    })















  }































  // Agregar estado para controlar el modal
  const [isNewSubscriptionModalOpen, setIsNewSubscriptionModalOpen] = useState(false)































  // Agregar función para crear nueva suscripción
  const handleCreateSubscription = (subscriptionData: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      ...subscriptionData,
      id: Math.random().toString(36).substr(2, 9), // Generar ID único
      isActive: true // Por defecto activa
    }

    setSubscriptionsData(prev => [...prev, newSubscription])
    setIsNewSubscriptionModalOpen(false)
  }































  return (







    <div className="p-4">















      <div className="flex justify-between items-center mb-6">















        <h3 className="text-xl font-medium">Lista de Suscripciones</h3>















        <div className="flex space-x-2">















          <button 















            onClick={() => setIsNewSubscriptionModalOpen(true)}















            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center text-sm"















          >















            <IconPlus className="h-5 w-5 mr-2" />















            Crear Suscripción















          </button>































          {/* Botón de Columnas */}







          <DropdownMenu>







            <DropdownMenuTrigger>







              <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center text-sm">







                Columnas







                <IconChevronDown className="h-4 w-4 ml-2 text-gray-500" />







              </div>







            </DropdownMenuTrigger>







            <DropdownMenuContent align="end" className="w-[150px]">







              {availableColumns.map((column) => (







                <DropdownMenuCheckboxItem







                  key={column.id}







                  className="capitalize"







                  checked={columnVisibility[column.id]}







                  onCheckedChange={(value) => {







                    setColumnVisibility(prev => ({







                      ...prev,







                      [column.id]: value







                    }))







                  }}







                >







                  {column.title}







                </DropdownMenuCheckboxItem>







              ))}







            </DropdownMenuContent>







          </DropdownMenu>































          {/* Botón de Filtros */}
          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center text-sm">
            <IconFilter className="h-5 w-5 text-gray-500" />
          </button>

















        </div>















      </div>































      {/* Tabla */}















      <div className="border rounded-md">















        <table className="min-w-full divide-y divide-gray-200">















          <thead className="bg-gray-50">















            <tr>















              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">















              </th>















              {columnVisibility.name && (















                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">















                  Nombre















                </th>















              )}















              {columnVisibility.price && (















                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">















                  Precio















                </th>















              )}















              {columnVisibility.interval && (















                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">















                  Intervalo















                </th>















              )}















              {columnVisibility.status && (















                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">















                  Estado















                </th>















              )}















              {columnVisibility.launchDate && (















                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">















                  Lanzamiento















                </th>















              )}















              {columnVisibility.period && (















                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">















                  Periodo















                </th>















              )}















              <th scope="col" className="relative px-6 py-3">















                <span className="sr-only">Acciones</span>















              </th>















            </tr>















          </thead>















          <tbody className="bg-white divide-y divide-gray-200">















            {currentSubscriptions.map((subscription) => (















              <tr key={subscription.id}>















                <td className="px-6 py-4 whitespace-nowrap">















                  <input















                    type="checkbox"















                    className="rounded border-gray-300 text-black focus:ring-black"















                    checked={selectedRows.includes(subscription.id)}















                    onChange={(e) => {















                      if (e.target.checked) {















                        setSelectedRows([...selectedRows, subscription.id])















                      } else {















                        setSelectedRows(selectedRows.filter(id => id !== subscription.id))















                      }















                    }}















                  />















                </td>















                {columnVisibility.name && (















                  <td className="px-6 py-4 whitespace-nowrap">















                    <div className="text-sm font-medium text-gray-900">{subscription.name}</div>















                  </td>















                )}















                {columnVisibility.price && (















                  <td className="px-6 py-4 whitespace-nowrap text-right">















                    <div className="text-sm text-gray-900">${subscription.price}</div>















                  </td>















                )}















                {columnVisibility.interval && (















                  <td className="px-6 py-4 whitespace-nowrap text-center">















                    <div className="text-sm text-gray-900">















                      {subscription.interval === 'monthly' ? 'Mensual' : 'Anual'}















                    </div>















                  </td>















                )}















                {columnVisibility.status && (















                  <td className="px-6 py-4 whitespace-nowrap text-center">















                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${















                      subscription.isActive 















                        ? 'bg-green-100 text-green-800' 















                        : 'bg-red-100 text-red-800'















                    }`}>















                      {subscription.isActive ? 'Activo' : 'Inactivo'}















                    </span>















                  </td>















                )}















                {columnVisibility.launchDate && (















                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">















                    {formatDate(subscription.launchDate)}















                  </td>















                )}















                {columnVisibility.period && (















                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">















                    {`${formatDate(subscription.startDate)} - ${formatDate(subscription.endDate)}`}















                  </td>















                )}















                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">







                  <DropdownMenu>







                    <DropdownMenuTrigger>







                      <div className="text-gray-400 hover:text-gray-500">







                        <IconDots className="h-4 w-4" />







                      </div>







                    </DropdownMenuTrigger>







                    <DropdownMenuContent align="end">







                      <DropdownMenuItem>







                        Editar







                      </DropdownMenuItem>







                      <DropdownMenuItem className="text-red-600">







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
          {getFilteredSubscriptions().length === 0 ? (
            "No se encontraron suscripciones"
          ) : (
            `${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, getFilteredSubscriptions().length)} de ${getFilteredSubscriptions().length} suscripciones`
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Página {currentPage} de {totalPages}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Agregar el modal al final del componente */}
      <NewSubscriptionModal 
        isOpen={isNewSubscriptionModalOpen}
        onClose={() => setIsNewSubscriptionModalOpen(false)}
        onSave={handleCreateSubscription}
      />
    </div>
  )
}