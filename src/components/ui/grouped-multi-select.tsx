"use client"

import * as React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { IconChevronDown, IconCheck, IconLoader2 } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

interface Option {
  id: string
  name: string
}

interface Group {
  id: string
  name: string
  options: Option[]
}

export interface GroupedMultiSelectProps {
  value?: string[]
  onChange?: (value: string[]) => void
  options: Group[]
  placeholder?: string
  isLoading?: boolean
  error?: any
}

export function GroupedMultiSelect({ 
  value = [], 
  onChange, 
  options,
  placeholder = "Seleccionar...",
  isLoading = false,
  error
}: GroupedMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  // Asegurarnos de que value siempre sea un array
  const safeValue = useMemo(() => {
    return Array.isArray(value) ? value : []
  }, [value])

  // Manejar la selección de opciones
  const handleOptionSelect = useCallback((optionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const isSelected = safeValue.includes(optionId)
    const updatedValue = isSelected
      ? safeValue.filter(id => id !== optionId)
      : [...safeValue, optionId]
    
    console.log('GroupedMultiSelect - Selección actualizada:', {
      prevValue: safeValue,
      newValue: updatedValue,
      added: !isSelected ? optionId : null,
      removed: isSelected ? optionId : null
    })
    
    onChange?.(updatedValue)
    // No cerramos el dropdown aquí
  }, [safeValue, onChange])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portal = document.querySelector('[role="listbox"]')
        if (portal && !portal.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top
        const popupHeight = 300 // max-height del popup

        // Decidir si mostrar arriba o abajo
        const showAbove = spaceBelow < popupHeight && spaceAbove > spaceBelow

        setPosition({
          top: showAbove 
            ? rect.top + window.scrollY - popupHeight 
            : rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  const getDisplayValue = () => {
    if (isLoading) return "Cargando..."
    if (error) return "Error al cargar datos"
    if (!safeValue || safeValue.length === 0) return placeholder

    const selectedNames = safeValue.map(id => {
      for (const group of options) {
        const option = group.options.find(opt => opt.id === id)
        if (option) return option.name
      }
      return ''
    }).filter(Boolean)

    return selectedNames.join(", ")
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 rounded-lg border bg-white",
          "focus:outline-none focus:border-gray-300",
          "transition-colors duration-200",
          "flex items-center justify-between",
          isLoading ? "cursor-wait" : "cursor-pointer",
          error && "border-red-500"
        )}
      >
        <span className={cn(
          "text-sm truncate",
          (!safeValue.length) && "text-gray-400",
          error && "text-red-500"
        )}>
          {getDisplayValue()}
        </span>
        {isLoading ? (
          <IconLoader2 className="h-4 w-4 animate-spin text-gray-500" />
        ) : (
          <IconChevronDown 
            className={cn(
              "h-4 w-4 opacity-50 transition-transform duration-200",
              isOpen && "transform rotate-180"
            )} 
          />
        )}
      </div>

      {isOpen && !isLoading && !error && createPortal(
        <div 
          className="fixed z-50"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`
          }}
          role="listbox"
          aria-label="Opciones disponibles"
          tabIndex={-1}
        >
          <div className={cn(
            "bg-white border rounded-lg shadow-lg",
            "animate-in fade-in-0 zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
          )}>
            <div className="p-1" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange?.([])
                }}
                role="option"
                aria-selected={safeValue.length === 0}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm rounded-md",
                  "transition-colors duration-200",
                  "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                  (!safeValue.length) ? "font-medium text-gray-900" : "text-gray-700"
                )}
              >
                Ninguna
              </button>

              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No hay opciones disponibles
                </div>
              ) : (
                options.map((group) => (
                  <div key={group.id} className="mt-2" role="group" aria-label={group.name}>
                    <div className="px-3 py-1.5">
                      <span className="text-sm font-medium text-gray-900">
                        {group.name}
                      </span>
                    </div>
                    {group.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={(e) => {
                          handleOptionSelect(option.id, e)
                        }}
                        role="option"
                        aria-selected={safeValue.includes(option.id)}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm rounded-md",
                          "transition-colors duration-200",
                          "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                          safeValue.includes(option.id) ? "font-medium text-gray-900" : "text-gray-700"
                        )}
                      >
                        <span className="flex items-center justify-between">
                          {option.name}
                          {safeValue.includes(option.id) && (
                            <IconCheck className="h-4 w-4" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {error && (
        <div className="mt-1 text-sm text-red-500">
          {error.message || "Error al cargar las opciones"}
        </div>
      )}
    </div>
  )
} 