"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Menu, Settings, LogOut, ChevronUp, ChevronDown } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const menuItems = [
  {
    title: "Reservas",
    href: "/dashboard/bookings",
  },
  {
    title: "Usuarios",
    href: "/dashboard/users",
  },
  {
    title: "Artículos",
    href: "/dashboard/pricing",
  },
  {
    title: "Promociones",
    href: "/dashboard/promotions",
  },
  {
    title: "Análisis",
    href: "/dashboard/analytics",
  }
]

const branches = [
  {
    id: 1,
    name: "Sede Principal",
    shortName: "SP"
  },
  {
    id: 2,
    name: "Sede Norte",
    shortName: "SN"
  },
  {
    id: 3,
    name: "Sede Sur",
    shortName: "SS"
  }
]

function SidebarHeader() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 p-4 cursor-pointer hover:bg-accent rounded-lg transition-colors">
          <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
            <span className="text-white font-bold">VE</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Sucursal</h3>
            <p className="text-sm text-muted-foreground">Sede Principal</p>
          </div>
          <div className="flex flex-col -space-y-1">
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-2" align="start" side="right">
        <div className="space-y-2">
          {branches.map((branch) => (
            <button
              key={branch.id}
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-sm"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium">{branch.shortName}</span>
              </div>
              <span className="font-medium">{branch.name}</span>
            </button>
          ))}
          <div className="border-t my-2" />
          <button
            className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm text-muted-foreground"
          >
            <span>Administrar sucursales</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SidebarFooter() {
  return (
    <div className="mt-auto border-t border-slate-200/25">
      <div className="flex items-center gap-2 p-4">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium">AA</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">Admin Account</h3>
          <p className="text-xs text-muted-foreground">admin@padel.com</p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <SidebarHeader />
      <ScrollArea className="flex-1">
        <nav className="flex flex-col px-6 mt-6">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "relative py-2.5 text-[15px] font-medium transition-all duration-500 ease-in-out",
                "before:absolute before:left-0 before:w-[2px] before:rounded-full before:h-[70%] before:top-[15%]",
                "before:transition-all before:duration-500 before:ease-in-out",
                pathname === item.href
                  ? "text-primary before:bg-primary/80"
                  : "text-gray-400 hover:text-gray-600 before:opacity-0 hover:before:opacity-30 before:bg-primary"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <SidebarFooter />
    </div>
  )
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="outline" size="icon" className="w-10 h-10">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0">
        <MobileNav />
      </SheetContent>
      <aside
        className={cn(
          "fixed hidden h-screen border-r border-slate-200/55 bg-background lg:block w-[240px]",
          className || ""
        )}
      >
        <div className="flex h-full flex-col">
          <SidebarHeader />
          <ScrollArea className="flex-1">
            <nav className="flex flex-col px-6 mt-6">
              {menuItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "relative py-2.5 text-[15px] font-medium transition-all duration-500 ease-in-out",
                    "before:absolute before:left-0 before:w-[2px] before:rounded-full before:h-[70%] before:top-[15%]",
                    "before:transition-all before:duration-500 before:ease-in-out",
                    pathname === item.href
                      ? "text-primary before:bg-primary/80"
                      : "text-gray-400 hover:text-gray-600 before:opacity-0 hover:before:opacity-30 before:bg-primary"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <SidebarFooter />
        </div>
      </aside>
    </Sheet>
  )
}
