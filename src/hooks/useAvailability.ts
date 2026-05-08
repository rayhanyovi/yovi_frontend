import { useQuery } from '@tanstack/react-query';
import { getBookedTimes, getRoomAvailability } from '@/lib/api/availability';

export function useBookedTimes(roomId?: number, date?: string, excludeBookingId?: number) {
  return useQuery({
    queryKey: ['availability', 'times', roomId, date, excludeBookingId],
    queryFn: () => getBookedTimes(roomId!, date!, excludeBookingId),
    enabled: !!roomId && !!date,
    staleTime: 30_000,
  });
}

export function useRoomAvailability(
  date?: string,
  startTime?: string,
  endTime?: string,
  excludeBookingId?: number
) {
  return useQuery({
    queryKey: ['availability', 'rooms', date, startTime, endTime, excludeBookingId],
    queryFn: () => getRoomAvailability(date!, startTime!, endTime!, excludeBookingId),
    enabled: !!date && !!startTime && !!endTime,
    staleTime: 30_000,
  });
}
