import { useState } from "react"
import { motion } from "framer-motion"
import { IconSearch, IconPlus, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { Participant } from "../../types"

interface ParticipantStepProps {
  participants: Participant[]
  onParticipantAdd: (participant: Participant) => void
  onParticipantRemove: (participantId: string) => void
}

export function ParticipantStep({
  participants,
  onParticipantAdd,
  onParticipantRemove
}: ParticipantStepProps) {
  const [showNewParticipantForm, setShowNewParticipantForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentParticipant, setCurrentParticipant] = useState<Participant>({
    id: crypto.randomUUID(),
    fullName: '',
    dni: '',
    email: ''
  })

  return (
    <div className="space-y-6">
      {/* Lista de participantes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Participantes
            </span>
            {participants.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {participants.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowNewParticipantForm(!showNewParticipantForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-white bg-gray-100 hover:bg-gray-900 rounded-full transition-all duration-200"
          >
            {showNewParticipantForm ? (
              <>
                <IconSearch className="w-3.5 h-3.5" />
                Buscar existente
              </>
            ) : (
              <>
                <IconPlus className="w-3.5 h-3.5" />
                Crear nuevo
              </>
            )}
          </button>
        </div>

        {/* Lista de participantes agregados */}
        {participants.length > 0 && (
          <div className="grid gap-2">
            {participants.map(participant => (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] group hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">
                      {participant.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{participant.fullName}</span>
                    <span className="text-xs text-gray-500">
                      {participant.email || participant.dni}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onParticipantRemove(participant.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para agregar participantes */}
        <div className="mt-4">
          {showNewParticipantForm ? (
            <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]">
              <div className="space-y-3">
                <input
                  type="text"
                  value={currentParticipant.fullName}
                  onChange={(e) => setCurrentParticipant(prev => ({
                    ...prev,
                    fullName: e.target.value
                  }))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                  placeholder="Nombre completo"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={currentParticipant.dni}
                    onChange={(e) => setCurrentParticipant(prev => ({
                      ...prev,
                      dni: e.target.value
                    }))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                    placeholder="DNI"
                  />
                  <input
                    type="email"
                    value={currentParticipant.email || ''}
                    onChange={(e) => setCurrentParticipant(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                    placeholder="Email (opcional)"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (currentParticipant.fullName && currentParticipant.dni) {
                    onParticipantAdd(currentParticipant)
                    setCurrentParticipant({
                      id: crypto.randomUUID(),
                      fullName: '',
                      dni: '',
                      email: ''
                    })
                  }
                }}
                disabled={!currentParticipant.fullName.trim() || !currentParticipant.dni.trim()}
                className={cn(
                  "w-full p-2 rounded-lg text-sm font-medium transition-all duration-200",
                  currentParticipant.fullName.trim() && currentParticipant.dni.trim()
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                Agregar Participante
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] transition-all"
                  placeholder="Buscar participante existente..."
                />
                <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                  <button
                    onClick={() => {
                      setCurrentParticipant({
                        id: crypto.randomUUID(),
                        fullName: searchQuery,
                        dni: '12345678',
                        email: 'usuario@ejemplo.com'
                      })
                      onParticipantAdd(currentParticipant)
                      setSearchQuery('')
                    }}
                    className="w-full p-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                  >
                    {searchQuery}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {!showNewParticipantForm && participants.length === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[13px] text-gray-400 text-center"
          >
            Agrega al menos un participante para continuar
          </motion.p>
        )}
      </div>
    </div>
  )
} 