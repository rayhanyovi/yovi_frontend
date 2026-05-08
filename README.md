# iMeeting Frontend

Next.js frontend untuk aplikasi booking ruang meeting iMeeting.

## Prerequisites

- Node.js 20+
- npm
- Backend API sudah berjalan di `http://localhost:4000`

## Setup Dari Awal

Pastikan backend sudah jalan dulu, lalu:

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

App berjalan di `http://localhost:3000`.

## Environment

File `.env.local.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Untuk development lokal:

```bash
cp .env.local.example .env.local
```

## Demo Auth Flow

Tidak ada halaman login. Saat app dibuka:

1. Frontend mengambil daftar user dari `GET /api/users`.
2. Kalau belum ada token, frontend otomatis login sebagai `john@example.com`.
3. User bisa diganti dari dropdown account di navbar.
4. Saat user diganti, token JWT baru disimpan dan data booking direfresh.

Semua demo user memakai password backend `password123`.

## Scripts

```bash
npm run dev    # start development server
npm run lint   # cek lint
npm run build  # cek production build
npm start      # start production server setelah build
```

## Pages

- `/bookings` - daftar booking dan pagination
- `/bookings/create` - form booking baru
- `/bookings/:id` - detail booking
- `/bookings/:id/edit` - edit booking

## Local Verification

```bash
npm run lint
npm run build
npm run dev
```

Lalu buka `http://localhost:3000/bookings`.
