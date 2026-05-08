'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBooking, useDeleteBooking } from '@/hooks/useBookings';
import { BookingDetail } from '@/components/bookings/BookingDetail';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import toast from 'react-hot-toast';

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: booking, isLoading, error, refetch } = useBooking(id);
  const deleteMutation = useDeleteBooking();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Pemesanan berhasil dihapus');
      router.replace('/bookings');
    } catch {
      toast.error('Gagal menghapus pemesanan');
      setConfirmDelete(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Ruang Meeting"
        breadcrumbs={[
          { label: 'Ruang Meeting', href: '/bookings' },
          { label: 'Detail Pemesanan' },
        ]}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAlert error={error as Error} onRetry={refetch} />
      ) : booking ? (
        <BookingDetail
          booking={booking}
          onDelete={() => setConfirmDelete(true)}
          deleteLoading={deleteMutation.isPending}
        />
      ) : null}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hapus Pemesanan</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus pemesanan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Batal
              </Button>
              <Button variant="danger" loading={deleteMutation.isPending} onClick={handleDelete}>
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
