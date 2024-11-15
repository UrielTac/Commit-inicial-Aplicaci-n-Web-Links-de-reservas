"use client"

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  validUntil: Date
  isActive: boolean
}

export function CouponsTable() {
  return (
    <div>
      {/* Implementación pendiente */}
    </div>
  )
}
