import client from './client';

export const DEMO_PASSWORD = 'password123';

export async function login(email: string, password: string) {
  const res = await client.post('/auth/login', { email, password });
  return res.data.data as { token: string; user: { id: number; name: string; email: string } };
}

export async function getMe() {
  const res = await client.get('/auth/me');
  return res.data.data as { id: number; name: string; email: string };
}
