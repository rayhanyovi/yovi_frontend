import client from './client';

export interface Unit {
  id: number;
  name: string;
}

export async function getUnits(): Promise<Unit[]> {
  const res = await client.get('/units');
  return res.data.data;
}
