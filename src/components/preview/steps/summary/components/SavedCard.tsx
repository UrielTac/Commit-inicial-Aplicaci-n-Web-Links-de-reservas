'use client';

import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";

interface SavedCardProps {
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  theme: 'light' | 'dark';
  isSelected?: boolean;
  onClick?: () => void;
}

export function SavedCard({
  last4,
  brand,
  expiryMonth,
  expiryYear,
  theme,
  isSelected,
  onClick
}: SavedCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full p-6 rounded-xl transition-all cursor-pointer",
        "border-2",
        isSelected
          ? theme === 'dark'
            ? "border-white bg-neutral-800"
            : "border-black bg-gray-50"
          : theme === 'dark'
          ? "border-neutral-700 hover:border-neutral-600"
          : "border-gray-200 hover:border-gray-300",
        "flex flex-col gap-4"
      )}
    >
      <div className="flex justify-between items-start">
        <CreditCard className={cn(
          "h-8 w-8",
          theme === 'dark' ? "text-white" : "text-black"
        )} />
        <span className={cn(
          "text-sm font-medium",
          theme === 'dark' ? "text-gray-300" : "text-gray-600"
        )}>
          {brand}
        </span>
      </div>
      
      <div className="space-y-1">
        <div className={cn(
          "text-lg font-medium tracking-wider",
          theme === 'dark' ? "text-white" : "text-black"
        )}>
          •••• •••• •••• {last4}
        </div>
        <div className={cn(
          "text-sm",
          theme === 'dark' ? "text-gray-400" : "text-gray-500"
        )}>
          Expira: {expiryMonth}/{expiryYear}
        </div>
      </div>
    </div>
  );
} 