'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useUnits } from '@/hooks/useUnits';
import { useRooms } from '@/hooks/useRooms';
import { useBookedTimes, useRoomAvailability } from '@/hooks/useAvailability';
import { Select, SelectOption } from '@/components/ui/Select';
import { DateInput } from '@/components/ui/DateInput';
import { TextInput } from '@/components/ui/TextInput';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BookingPayload } from '@/lib/api/bookings';
import toast from 'react-hot-toast';
import axios from 'axios';

const ALL_TIMES: string[] = [];
for (let h = 8; h <= 18; h++) {
  ALL_TIMES.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 18) ALL_TIMES.push(`${String(h).padStart(2, '0')}:30`);
}

const CONSUMPTION_OPTIONS = [
  { value: 'SNACK_SIANG', label: 'Snack Siang' },
  { value: 'MAKAN_SIANG', label: 'Makan Siang' },
  { value: 'SNACK_SORE', label: 'Snack Sore' },
];

interface FormValues {
  unit_id: string;
  meeting_room_id: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  participant_count: string;
  consumptions: string[];
  nominal_konsumsi: string;
}

interface Props {
  mode: 'create' | 'edit';
  defaultValues?: Partial<FormValues>;
  excludeBookingId?: number;
  onSubmit: (payload: BookingPayload) => Promise<void>;
}

function isSlotBooked(slot: string, bookedSlots: { start_time: string; end_time: string }[]) {
  return bookedSlots.some((b) => slot >= b.start_time && slot < b.end_time);
}

export function BookingForm({ mode, defaultValues, excludeBookingId, onSubmit }: Props) {
  const router = useRouter();
  const { data: units = [] } = useUnits();
  const { data: rooms = [] } = useRooms();

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      unit_id: '',
      meeting_room_id: '',
      meeting_date: '',
      start_time: '',
      end_time: '',
      participant_count: '',
      consumptions: [],
      nominal_konsumsi: '',
      ...defaultValues,
    },
  });

  const watchedRoomId = useWatch({ control, name: 'meeting_room_id' });
  const watchedDate = useWatch({ control, name: 'meeting_date' });
  const watchedStart = useWatch({ control, name: 'start_time' });
  const watchedEnd = useWatch({ control, name: 'end_time' });
  const prevStart = useRef(watchedStart);

  const selectedRoom = rooms.find((r) => String(r.id) === watchedRoomId);

  // Debounce refs for availability fetches
  const timesEnabled = !!watchedRoomId && !!watchedDate;
  const roomsEnabled = !!watchedDate && !!watchedStart && !!watchedEnd;

  const { data: bookedSlots = [] } = useBookedTimes(
    timesEnabled ? Number(watchedRoomId) : undefined,
    timesEnabled ? watchedDate : undefined,
    excludeBookingId
  );

  const { data: roomAvailability } = useRoomAvailability(
    roomsEnabled ? watchedDate : undefined,
    roomsEnabled ? watchedStart : undefined,
    roomsEnabled ? watchedEnd : undefined,
    excludeBookingId
  );

  // Clear end_time when start_time changes to an incompatible value
  useEffect(() => {
    if (prevStart.current !== watchedStart) {
      if (watchedEnd && watchedEnd <= watchedStart) {
        setValue('end_time', '');
      }
      prevStart.current = watchedStart;
    }
  }, [watchedStart, watchedEnd, setValue]);

  const startTimeOptions: SelectOption[] = useMemo(
    () =>
      ALL_TIMES.slice(0, -1).map((t) => ({
        value: t,
        label: t,
        disabled: isSlotBooked(t, bookedSlots),
        disabledLabel: 'Booked',
      })),
    [bookedSlots]
  );

  const endTimeOptions: SelectOption[] = useMemo(
    () =>
      ALL_TIMES.filter((t) => !watchedStart || t > watchedStart).map((t) => ({
        value: t,
        label: t,
        disabled: isSlotBooked(t, bookedSlots) && t !== watchedEnd,
        disabledLabel: 'Booked',
      })),
    [bookedSlots, watchedStart, watchedEnd]
  );

  const roomOptions: SelectOption[] = useMemo(
    () =>
      rooms.map((r) => {
        const avail = roomAvailability?.find((ra) => ra.id === r.id);
        const booked = avail ? !avail.available : false;
        return {
          value: String(r.id),
          label: `${r.name} (${r.capacity} orang)`,
          disabled: booked && String(r.id) !== watchedRoomId,
          disabledLabel: 'Booked',
        };
      }),
    [rooms, roomAvailability, watchedRoomId]
  );

  const unitOptions: SelectOption[] = units.map((u) => ({
    value: String(u.id),
    label: u.name,
  }));

  const today = new Date().toISOString().split('T')[0];

  const handleFormSubmit = async (values: FormValues) => {
    const payload: BookingPayload = {
      unit_id: Number(values.unit_id),
      meeting_room_id: Number(values.meeting_room_id),
      meeting_date: values.meeting_date,
      start_time: values.start_time,
      end_time: values.end_time,
      participant_count: Number(values.participant_count),
      consumptions: values.consumptions,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (err.response?.status === 409) {
          toast.error(data?.error?.message || 'Ruangan sudah dipesan pada waktu tersebut');
          return;
        }
        if (err.response?.status === 422 && data?.error?.details) {
          for (const detail of data.error.details) {
            setError(detail.field as keyof FormValues, { message: detail.message });
          }
          return;
        }
        toast.error(data?.error?.message || 'Terjadi kesalahan. Coba lagi.');
        return;
      }
      toast.error('Terjadi kesalahan. Coba lagi.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* Section 1: Room Info */}
      <Card className="mb-4">
        <div className="px-6 py-5">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Informasi Ruang Meeting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="unit_id"
              control={control}
              rules={{ required: 'Unit wajib dipilih' }}
              render={({ field }) => (
                <Select
                  label="Unit"
                  placeholder="Pilih Unit"
                  options={unitOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.unit_id?.message}
                />
              )}
            />
            <Controller
              name="meeting_room_id"
              control={control}
              rules={{ required: 'Ruang meeting wajib dipilih' }}
              render={({ field }) => (
                <Select
                  label="Pilihan Ruangan Meeting"
                  placeholder="Pilih Ruangan Meeting"
                  options={roomOptions}
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                  }}
                  error={errors.meeting_room_id?.message}
                />
              )}
            />
          </div>
          <div className="mt-4 max-w-xs">
            <TextInput
              label="Kapasitas Ruangan"
              placeholder="Kapasitas Ruangan"
              disabled
              value={selectedRoom ? `${selectedRoom.capacity} Orang` : ''}
              readOnly
            />
          </div>
        </div>
      </Card>

      {/* Section 2: Meeting Info */}
      <Card className="mb-4">
        <div className="px-6 py-5">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Informasi Rapat</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Controller
              name="meeting_date"
              control={control}
              rules={{ required: 'Tanggal rapat wajib diisi' }}
              render={({ field }) => (
                <DateInput
                  label="Tanggal Rapat"
                  required
                  min={today}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.meeting_date?.message}
                />
              )}
            />
            <Controller
              name="start_time"
              control={control}
              rules={{ required: 'Waktu mulai wajib dipilih' }}
              render={({ field }) => (
                <Select
                  label="Pilihan Waktu Mulai"
                  placeholder="Pilih Waktu Mulai"
                  options={startTimeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.start_time?.message}
                />
              )}
            />
            <Controller
              name="end_time"
              control={control}
              rules={{ required: 'Waktu selesai wajib dipilih' }}
              render={({ field }) => (
                <Select
                  label="Waktu Selesai"
                  placeholder="Pilih Waktu Selesai"
                  options={endTimeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.end_time?.message}
                  disabled={!watchedStart}
                />
              )}
            />
          </div>

          <div className="max-w-xs mb-4">
            <Controller
              name="participant_count"
              control={control}
              rules={{
                required: 'Jumlah peserta wajib diisi',
                min: { value: 1, message: 'Minimal 1 peserta' },
                validate: (v) =>
                  !selectedRoom || Number(v) <= selectedRoom.capacity
                    ? true
                    : `Melebihi kapasitas ruangan (${selectedRoom.capacity} orang)`,
              }}
              render={({ field }) => (
                <TextInput
                  label="Jumlah Peserta"
                  type="number"
                  placeholder="Masukan Jumlah Peserta"
                  min={1}
                  max={selectedRoom?.capacity}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.participant_count?.message}
                />
              )}
            />
          </div>

          <div className="mb-4">
            <Controller
              name="consumptions"
              control={control}
              render={({ field }) => (
                <CheckboxGroup
                  label="Jenis Konsumsi"
                  options={CONSUMPTION_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.consumptions?.message}
                />
              )}
            />
          </div>

          <div className="max-w-xs">
            <Controller
              name="nominal_konsumsi"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Nominal Konsumsi"
                  type="number"
                  placeholder=""
                  prefix="Rp"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3 mt-2">
        <Button type="button" variant="danger" onClick={() => router.push('/bookings')}>
          Batal
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {mode === 'edit' ? 'Simpan Perubahan' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
