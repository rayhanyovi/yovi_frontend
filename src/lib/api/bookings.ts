import client from './client';

export interface Booking {
  id: number;
  unit: { id: number; name: string };
  meeting_room: { id: number; name: string; capacity: number };
  meeting_date: string;
  start_time: string;
  end_time: string;
  participant_count: number;
  consumptions: string[];
  user: { id: number; name: string };
  is_owner?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BookingPayload {
  unit_id: number;
  meeting_room_id: number;
  meeting_date: string;
  start_time: string;
  end_time: string;
  participant_count: number;
  consumptions: string[];
}

export interface PaginatedBookings {
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getBookings(page = 1, limit = 10): Promise<PaginatedBookings> {
  const res = await client.get('/bookings', { params: { page, limit } });
  return { data: res.data.data, pagination: res.data.pagination };
}

export async function getBooking(id: number): Promise<Booking> {
  const res = await client.get(`/bookings/${id}`);
  return res.data.data;
}

export async function createBooking(payload: BookingPayload): Promise<Booking> {
  const res = await client.post('/bookings', payload);
  return res.data.data;
}

export async function updateBooking(id: number, payload: Partial<BookingPayload>): Promise<Booking> {
  const res = await client.patch(`/bookings/${id}`, payload);
  return res.data.data;
}

export async function deleteBooking(id: number): Promise<void> {
  await client.delete(`/bookings/${id}`);
}
