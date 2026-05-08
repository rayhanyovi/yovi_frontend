'use client';

import { useRouter } from 'next/navigation';
import { Booking } from '@/lib/api/bookings';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const CONSUMPTION_LABELS: Record<string, string> = {
  SNACK_SIANG: 'Snack Siang',
  MAKAN_SIANG: 'Makan Siang',
  SNACK_SORE: 'Snack Sore',
};

interface Field {
  label: string;
  value: React.ReactNode;
}

function DetailField({ label, value }: Field) {
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  );
}

interface Props {
  booking: Booking;
  onDelete: () => void;
  deleteLoading?: boolean;
}

export function BookingDetail({ booking, onDelete, deleteLoading }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Detail Pemesanan</h2>
        {booking.is_owner && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/bookings/${booking.id}/edit`)}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteLoading}
              onClick={onDelete}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus
            </Button>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 py-6">
        <DetailField label="Unit" value={booking.unit.name} />
        <DetailField label="Ruang Meeting" value={booking.meeting_room.name} />
        <DetailField label="Kapasitas Ruangan" value={`${booking.meeting_room.capacity} Orang`} />
        <DetailField
          label="Tanggal Rapat"
          value={format(new Date(booking.meeting_date), 'd MMMM yyyy', { locale: id })}
        />
        <DetailField
          label="Waktu"
          value={`${booking.start_time} s/d ${booking.end_time}`}
        />
        <DetailField
          label="Jumlah Peserta"
          value={`${booking.participant_count} Orang`}
        />
        <DetailField
          label="Jenis Konsumsi"
          value={
            booking.consumptions.length === 0
              ? '-'
              : booking.consumptions.map((c) => CONSUMPTION_LABELS[c] || c).join(', ')
          }
        />
        <DetailField label="Dipesan Oleh" value={booking.user.name} />
        <DetailField
          label="Dibuat"
          value={format(new Date(booking.created_at), 'd MMM yyyy, HH:mm', { locale: id })}
        />
      </dl>
    </div>
  );
}
