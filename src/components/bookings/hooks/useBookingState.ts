import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bookingService } from '@/services/bookingService'
import { SelectedBooking } from '@/types/bookings'

interface UseBookingStateProps {
  selectedDate: Date
  branchId?: string
}

export function useBookingState({ selectedDate, branchId }: UseBookingStateProps) {
  const [selectedBooking, setSelectedBooking] = useState<SelectedBooking | null>(null)

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch: refetchBookings
  } = useQuery({
    queryKey: ['bookings', selectedDate.toISOString().split('T')[0], branchId],
    queryFn: async () => {
      if (!branchId) {
        console.log('No hay branch_id seleccionado')
        return []
      }

      const response = await bookingService.getBookingsByDate(
        selectedDate.toISOString().split('T')[0],
        branchId
      )
      
      if (response.error) {
        throw new Error(response.error.message)
      }
      
      return response.data
    },
    enabled: !!branchId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 30000,
    cacheTime: 1000 * 60 * 5,
    retry: 2
  })

  const handleBookingCreated = () => {
    refetchBookings()
  }

  return {
    bookings,
    isLoading,
    isError,
    selectedBooking,
    setSelectedBooking,
    handleBookingCreated
  }
} 