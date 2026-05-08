import client from './client';

export interface BookedSlot {
  start_time: string;
  end_time: string;
  booking_id: number;
}

export interface RoomAvailability {
  id: number;
  name: string;
  capacity: number;
  available: boolean;
}

export async function getBookedTimes(
  roomId: number,
  date: string,
  excludeBookingId?: number
): Promise<BookedSlot[]> {
  const params: Record<string, string | number> = { room_id: roomId, date };
  if (excludeBookingId) params.exclude_booking_id = excludeBookingId;
  const res = await client.get('/availability/times', { params });
  return res.data.data.booked_slots;
}

export async function getRoomAvailability(
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: number
): Promise<RoomAvailability[]> {
  const params: Record<string, string | number> = { date, start_time: startTime, end_time: endTime };
  if (excludeBookingId) params.exclude_booking_id = excludeBookingId;
  const res = await client.get('/availability/rooms', { params });
  return res.data.data.rooms;
}
