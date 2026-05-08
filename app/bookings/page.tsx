'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookings, useDeleteBooking } from '@/hooks/useBookings';
import { BookingTable } from '@/components/bookings/BookingTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import toast from 'react-hot-toast';

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, error, refetch } = useBookings(page);
  const deleteMutation = useDeleteBooking();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Pemesanan berhasil dihapus');
      setDeleteId(null);
    } catch {
      toast.error('Gagal menghapus pemesanan');
    }
  };

  return (
    <div>
      <PageHeader
        title="Ruang Meeting"
        breadcrumbs={[{ label: 'Ruang Meeting' }]}
        showBack={false}
        actions={
          <Button onClick={() => router.push('/bookings/create')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Pesan Ruangan
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="p-4">
            <ErrorAlert error={error as Error} onRetry={refetch} />
          </div>
        ) : data ? (
          <BookingTable
            bookings={data.data}
            pagination={data.pagination}
            onPageChange={(p) => router.push(`/bookings?page=${p}`)}
            onDelete={(id) => setDeleteId(id)}
          />
        ) : null}
      </Card>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hapus Pemesanan</h3>
            <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus pemesanan ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
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

export default function BookingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BookingsContent />
    </Suspense>
  );
}
