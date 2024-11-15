"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BookingsTable } from "@/components/bookings/BookingsTable"
import { CourtsTable } from "@/components/bookings/CourtsTable"
import { NewBookingModal } from "@/components/bookings/NewBookingModal/index"

export default function BookingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList>
          <TabsTrigger value="bookings">Reservaciones</TabsTrigger>
          <TabsTrigger value="courts">Canchas</TabsTrigger>
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