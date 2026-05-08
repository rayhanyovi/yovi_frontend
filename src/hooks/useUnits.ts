import { useQuery } from '@tanstack/react-query';
import { getUnits } from '@/lib/api/units';

export function useUnits() {
  return useQuery({ queryKey: ['units'], queryFn: getUnits, staleTime: Infinity });
}
