import client from './client';

export interface Room {
  id: number;
  name: string;
  capacity: number;
}

export async function getRooms(): Promise<Room[]> {
  const res = await client.get('/rooms');
  return res.data.data;
}
