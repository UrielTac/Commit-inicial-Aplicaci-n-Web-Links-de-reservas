"use client"



import * as React from "react"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

import { cn } from "@/lib/utils"



const Collapsible = CollapsiblePrimitive.Root



const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger



const CollapsibleContent = React.forwardRef<

  React.ElementRef<typeof CollapsiblePrimitive.Content>,

  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>

>(({ className, children, ...props }, ref) => (

  <CollapsiblePrimitive.Content

    ref={ref}

    className={cn(

      "overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",

      className

    )}

    {...props}

  >

    <div className="pb-1">{children}</div>

  </CollapsiblePrimitive.Content>

))

CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName



export {

  Collapsible,

  CollapsibleTrigger,

  CollapsibleContent,

} 
