import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, getBooking, createBooking, updateBooking, deleteBooking, BookingPayload } from '@/lib/api/bookings';

export function useBookings(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['bookings', page, limit],
    queryFn: () => getBookings(page, limit),
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => getBooking(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookingPayload) => createBooking(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useUpdateBooking(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<BookingPayload>) => updateBooking(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
