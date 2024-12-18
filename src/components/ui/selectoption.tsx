"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface SelectOptionProps {
  value: 'monthly' | 'quarterly'
  onValueChange: (value: 'monthly' | 'quarterly') => void
}

export function SelectOption({ value, onValueChange }: SelectOptionProps) {
  return (
    <div className="inline-flex h-9 rounded-lg bg-input/50 p-0.5">
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className="group relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:bg-background after:shadow-sm after:shadow-black/5 after:outline-offset-2 after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 has-[:focus-visible]:after:outline-ring/70 data-[state=monthly]:after:translate-x-0 data-[state=quarterly]:after:translate-x-full"
        data-state={value}
      >
        <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center whitespace-nowrap px-4 transition-colors group-data-[state=quarterly]:text-muted-foreground/70">
          Mensual
          <RadioGroupItem value="monthly" className="sr-only" />
        </label>
        <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center whitespace-nowrap px-4 transition-colors group-data-[state=monthly]:text-muted-foreground/70">
          <span>
            Trimestral{" "}
            <span className="transition-colors group-data-[state=monthly]:text-muted-foreground/70 group-data-[state=quarterly]:text-emerald-500">
              -10%
            </span>
          </span>
          <RadioGroupItem value="quarterly" className="sr-only" />
        </label>
      </RadioGroup>
    </div>
  )
}