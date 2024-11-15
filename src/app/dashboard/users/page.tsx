"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MembersTable } from "@/components/MembersTable"

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="border-b border-slate-200/10">
          <TabsTrigger value="members">Miembros</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="bg-card">
            <MembersTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
