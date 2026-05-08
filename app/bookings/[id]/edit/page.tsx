'use client';

import { useRouter, useParams } from 'next/navigation';
import { BookingForm } from '@/components/bookings/BookingForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { useBooking, useUpdateBooking } from '@/hooks/useBookings';
import { BookingPayload } from '@/lib/api/bookings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import toast from 'react-hot-toast';

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: booking, isLoading, error, refetch } = useBooking(id);
  const updateMutation = useUpdateBooking(id);

  const handleSubmit = async (payload: BookingPayload) => {
    await updateMutation.mutateAsync(payload);
    toast.success('Pemesanan berhasil diperbarui');
    router.replace(`/bookings/${id}`);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error as Error} onRetry={refetch} />;
  if (!booking) return null;

  const defaultValues = {
    unit_id: String(booking.unit.id),
    meeting_room_id: String(booking.meeting_room.id),
    meeting_date: booking.meeting_date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    participant_count: String(booking.participant_count),
    consumptions: booking.consumptions,
    nominal_konsumsi: '',
  };

  return (
    <div>
      <PageHeader
        title="Ruang Meeting"
        breadcrumbs={[
          { label: 'Ruang Meeting', href: '/bookings' },
          { label: 'Edit Pemesanan' },
        ]}
      />
      <BookingForm
        mode="edit"
        defaultValues={defaultValues}
        excludeBookingId={id}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
