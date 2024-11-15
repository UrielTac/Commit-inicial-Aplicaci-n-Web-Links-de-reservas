"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { IconClock } from "@tabler/icons-react"
import * as SelectPrimitive from "@radix-ui/react-select"

interface TimeSelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  label?: string
  options: string[]
}

const TimeSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  TimeSelectProps
>(({ className, label, options, ...props }, ref) => {
  return (
    <div className="relative">
      {label && (
        <label className="text-xs font-medium text-gray-500 mb-1.5 block">
          {label}
        </label>
      )}
      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            "w-full appearance-none pl-8 pr-4 py-1.5 text-sm rounded-md transition-colors",
            "border border-gray-200 hover:border-gray-300",
            "focus:border-black focus:ring-0 outline-none",
            "bg-white data-[placeholder]:text-gray-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <SelectPrimitive.Value />
            <SelectPrimitive.Icon>
              <IconClock className="h-3.5 w-3.5 text-gray-500" />
            </SelectPrimitive.Icon>
          </div>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              "relative z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-950 shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
              "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            )}
            position="popper"
            align="start"
          >
            <SelectPrimitive.Viewport 
              className={cn(
                "p-1",
                "max-h-[180px] overflow-y-auto",
                "scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent",
                "hover:scrollbar-thumb-gray-300"
              )}
            >
              {options.map((time) => (
                <SelectPrimitive.Item
                  key={time}
                  value={time}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
                    "focus:bg-gray-100 focus:text-gray-900",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    "data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900",
                    "data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-900"
                  )}
                >
                  <SelectPrimitive.ItemText>{time}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
})

TimeSelect.displayName = "TimeSelect"

export { TimeSelect } 