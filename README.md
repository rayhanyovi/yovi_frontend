# iMeeting Frontend

Next.js frontend for the iMeeting room booking application.

## Setup

Make sure the backend API is running on `http://localhost:4000`, then:

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Demo Auth Flow

There is no login page. The app automatically logs in as John Doe on first load, then the navbar account menu can switch between seeded users.

All demo users use the backend password `password123` under the hood.

## Useful Commands

```bash
npm run lint
npm run build
npm run dev
```
