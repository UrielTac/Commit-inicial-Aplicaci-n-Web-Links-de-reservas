"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BookingsTable } from "@/components/bookings/BookingsTable"
import { CourtsTable } from "@/components/bookings/CourtsTable"
import { NewBookingModal } from "@/components/bookings/NewBookingModal/index"
import { useBookings } from '@/hooks/useBookings'

export default function BookingsPage() {
  const { bookings, isLoading } = useBookings()
  
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList>
          <TabsTrigger 
            value="bookings"
            className="data-[state=inactive]:text-gray-500"
          >
            Reservaciones
          </TabsTrigger>
          <TabsTrigger 
            value="courts"
            className="data-[state=inactive]:text-gray-500"
          >
            Canchas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <div className="bg-card">
            <BookingsTable />
          </div>
        </TabsContent>

        <TabsContent value="courts">
          <div className="bg-card">
            <CourtsTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 