"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { IconChevronDown, IconCheck } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

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
}

export function GroupedMultiSelect({ 
  value = [], 
  onChange, 
  options,
  placeholder = "Seleccionar..."
}: GroupedMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getDisplayValue = () => {
    if (!value || value.length === 0) {
      return placeholder
    }

    const selectedNames = value.map(id => {
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
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 rounded-lg border bg-white cursor-pointer",
          "focus:outline-none focus:border-gray-300",
          "transition-colors duration-200",
          "flex items-center justify-between"
        )}
      >
        <span className={cn(
          "text-sm truncate",
          (!value || value.length === 0) && "text-gray-400"
        )}>
          {getDisplayValue()}
        </span>
        <IconChevronDown 
          className={cn(
            "h-4 w-4 opacity-50 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </div>

      {isOpen && (
        <div 
          className={cn(
            "absolute top-full left-0 w-full mt-1",
            "bg-white border rounded-lg shadow-lg z-10",
            "animate-in fade-in-0 zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          )}
        >
          <div className="p-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange?.([])
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-sm rounded-md",
                "transition-colors duration-200",
                "hover:bg-gray-50",
                (!value || value.length === 0) ? "font-medium text-gray-900" : "text-gray-700"
              )}
            >
              Ninguna
            </button>

            {options.map((group) => (
              <div key={group.id} className="mt-2">
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
                      e.stopPropagation()
                      const newValue = value || []
                      const isSelected = newValue.includes(option.id)
                      
                      let updatedValue: string[]
                      if (isSelected) {
                        updatedValue = newValue.filter(x => x !== option.id)
                      } else {
                        updatedValue = [...newValue, option.id]
                      }
                      
                      onChange?.(updatedValue)
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm rounded-md",
                      "transition-colors duration-200",
                      "hover:bg-gray-50",
                      value?.includes(option.id) ? "font-medium text-gray-900" : "text-gray-700"
                    )}
                  >
                    <span className="flex items-center justify-between">
                      {option.name}
                      {value?.includes(option.id) && (
                        <IconCheck className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 