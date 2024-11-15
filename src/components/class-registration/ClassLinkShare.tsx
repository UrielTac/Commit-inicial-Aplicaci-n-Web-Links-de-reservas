"use client"

import { useState } from "react"
import { IconCopy, IconCheck } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface ClassLinkShareProps {
  classId: string
}

export function ClassLinkShare({ classId }: ClassLinkShareProps) {
  const [copied, setCopied] = useState(false)
  
  // En producción, esto vendría de una variable de entorno
  const baseUrl = window.location.origin
  const classLink = `${baseUrl}/inscripcion/${classId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(classLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm text-gray-600">
        {classLink}
      </div>
      <button
        onClick={copyToClipboard}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          copied 
            ? "bg-green-50 text-green-600" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        {copied ? (
          <IconCheck className="h-4 w-4" />
        ) : (
          <IconCopy className="h-4 w-4" />
        )}
      </button>
    </div>
  )
} 