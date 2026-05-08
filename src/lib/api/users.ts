import client from './client';

export interface User {
  id: number;
  name: string;
  email: string;
}

export async function getUsers(): Promise<User[]> {
  const res = await client.get('/users');
  return res.data.data;
}
