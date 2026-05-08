import { useQuery } from '@tanstack/react-query';
import { getRooms } from '@/lib/api/rooms';

export function useRooms() {
  return useQuery({ queryKey: ['rooms'], queryFn: getRooms, staleTime: Infinity });
}
