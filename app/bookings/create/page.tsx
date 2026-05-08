'use client';

import { useRouter } from 'next/navigation';
import { BookingForm } from '@/components/bookings/BookingForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCreateBooking } from '@/hooks/useBookings';
import { BookingPayload } from '@/lib/api/bookings';
import toast from 'react-hot-toast';

export default function CreateBookingPage() {
  const router = useRouter();
  const createMutation = useCreateBooking();

  const handleSubmit = async (payload: BookingPayload) => {
    await createMutation.mutateAsync(payload);
    toast.success('Pemesanan berhasil dibuat');
    router.replace('/bookings');
  };

  return (
    <div>
      <PageHeader
        title="Ruang Meeting"
        breadcrumbs={[
          { label: 'Ruang Meeting', href: '/bookings' },
          { label: 'Pesan Ruangan' },
        ]}
      />
      <BookingForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
