'use client';

import { useRouter } from 'next/navigation';
import { Table, Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Booking } from '@/lib/api/bookings';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const CONSUMPTION_LABELS: Record<string, string> = {
  SNACK_SIANG: 'Snack Siang',
  MAKAN_SIANG: 'Makan Siang',
  SNACK_SORE: 'Snack Sore',
};

interface Props {
  bookings: Booking[];
  pagination: { page: number; totalPages: number; total: number; limit: number };
  onPageChange: (page: number) => void;
  onDelete?: (id: number) => void;
}

export function BookingTable({ bookings, pagination, onPageChange, onDelete }: Props) {
  const router = useRouter();

  const columns: Column<Booking>[] = [
    {
      key: 'unit',
      header: 'Unit',
      render: (row) => <span className="font-semibold text-gray-800 uppercase text-xs">{row.unit.name}</span>,
    },
    {
      key: 'meeting_room',
      header: 'Ruang Meeting',
      render: (row) => <span className="text-gray-500">{row.meeting_room.name}</span>,
    },
    {
      key: 'capacity',
      header: 'Kapasitas',
      render: (row) => <span className="text-gray-500">{row.meeting_room.capacity} Orang</span>,
    },
    {
      key: 'meeting_date',
      header: 'Tanggal Rapat',
      render: (row) => (
        <span className="text-gray-600">
          {format(parseISO(row.meeting_date), 'd MMMM yyyy', { locale: id })}
        </span>
      ),
    },
    {
      key: 'time',
      header: 'Waktu',
      render: (row) => (
        <span className="text-gray-600 whitespace-nowrap">
          {row.start_time} s/d<br />{row.end_time}
        </span>
      ),
    },
    {
      key: 'participant_count',
      header: 'Jumlah Peserta',
      render: (row) => <span className="text-gray-500">{row.participant_count} Orang</span>,
    },
    {
      key: 'consumptions',
      header: 'Jenis Konsumsi',
      render: (row) => (
        <span className="text-gray-500">
          {row.consumptions.length === 0
            ? '-'
            : row.consumptions.map((c) => CONSUMPTION_LABELS[c] || c).join(', ')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) =>
        row.is_owner ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => router.push(`/bookings/${row.id}/edit`)}
              className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(row.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        data={bookings}
        onRowClick={(row) => router.push(`/bookings/${row.id}`)}
        keyExtractor={(row) => row.id}
        emptyMessage="Belum ada pemesanan ruangan"
      />
      <Pagination {...pagination} onPageChange={onPageChange} />
    </div>
  );
}
