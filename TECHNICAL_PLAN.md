# iMeeting — Meeting Room Booking Application

## Technical Implementation Plan

---

## 1. Project Overview

**iMeeting** is an internal meeting-room booking application for a company with multiple divisions (units). Users can browse existing bookings, reserve rooms with time-slot and consumption options, and manage their own bookings (edit/delete). The system enforces conflict-free scheduling so no two bookings overlap on the same room.

**Scope:** Technical interview project — clean, working CRUD with correct conflict logic, good validation, polished-but-simple UI, and Dockerized database.

---

## 2. Recommended Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Frontend (Next.js) │  HTTP   │  Backend (Express.js)│
│   localhost:3000     │ ──────> │  localhost:4000      │
└─────────────────────┘         └──────────┬──────────┘
                                           │
                                           │ TCP :5432
                                           ▼
                                ┌─────────────────────┐
                                │  PostgreSQL (Docker) │
                                │  localhost:5432      │
                                └─────────────────────┘
```

- **Frontend** and **Backend** are separate repos, run independently.
- **PostgreSQL** runs in Docker via `docker-compose.yml` inside the backend repo.
- Communication is REST/JSON over HTTP.
- CORS is enabled on the backend for `http://localhost:3000`.

---

## 3. Repository Split

### Repo 1: `imeeting-backend`

```
imeeting-backend/
├── docker-compose.yml
├── Dockerfile                 # optional, for containerized backend
├── .env.example
├── package.json
├── knexfile.js                # Knex.js configuration
├── src/
│   ├── index.js               # Express app entry point
│   ├── app.js                 # Express app setup (middleware, routes)
│   ├── config/
│   │   └── database.js        # Knex instance export
│   ├── routes/
│   │   ├── index.js           # Route aggregator
│   │   ├── auth.routes.js     # POST /login, GET /me
│   │   ├── users.routes.js    # GET /users (list all, for account switcher)
│   │   ├── units.routes.js
│   │   ├── rooms.routes.js
│   │   ├── bookings.routes.js
│   │   └── availability.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── units.controller.js
│   │   ├── rooms.controller.js
│   │   ├── bookings.controller.js
│   │   └── availability.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── users.service.js
│   │   ├── units.service.js
│   │   ├── rooms.service.js
│   │   ├── bookings.service.js
│   │   └── availability.service.js
│   ├── repositories/
│   │   ├── users.repository.js
│   │   ├── units.repository.js
│   │   ├── rooms.repository.js
│   │   └── bookings.repository.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # Verify JWT, attach req.user
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── validators/
│   │   ├── booking.validator.js
│   │   └── auth.validator.js
│   └── utils/
│       ├── ApiError.js
│       ├── ApiResponse.js
│       └── timeSlots.js
├── database/
│   ├── migrations/
│   │   ├── 001_create_users.js
│   │   ├── 002_create_units.js
│   │   ├── 003_create_meeting_rooms.js
│   │   └── 004_create_bookings.js
│   └── seeds/
│       └── 001_seed_all.js
└── README.md
```

### Repo 2: `imeeting-frontend`

```
imeeting-frontend/
├── package.json
├── next.config.js
├── .env.local.example
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── layout.jsx            # Root layout with Navbar + Sidebar
│   │   ├── page.jsx              # Redirect to /bookings
│   │   └── bookings/
│   │       ├── page.jsx           # Booking list page
│   │       ├── create/
│   │       │   └── page.jsx       # Create booking form
│   │       ├── [id]/
│   │       │   ├── page.jsx       # Booking detail page
│   │       │   └── edit/
│   │       │       └── page.jsx   # Edit booking form
│   │       └── loading.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── UserDropdown.jsx     # Avatar + name click → dropdown menu
│   │   │   └── AccountSwitcher.jsx  # "Change Account" sub-menu with user list
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── DateInput.jsx
│   │   │   ├── TextInput.jsx
│   │   │   ├── CheckboxGroup.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorAlert.jsx
│   │   └── bookings/
│   │       ├── BookingTable.jsx
│   │       ├── BookingForm.jsx
│   │       └── BookingDetail.jsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.js          # Axios instance with base URL + auth header
│   │   │   ├── bookings.js        # Booking API functions
│   │   │   ├── rooms.js           # Room API functions
│   │   │   ├── units.js           # Unit API functions
│   │   │   ├── availability.js    # Availability API functions
│   │   │   ├── auth.js             # login(email, password) → token + user
│   │   │   └── users.js            # GET /users (list all, for account switcher)
│   │   ├── types.js               # JSDoc type definitions (or .ts if using TypeScript)
│   │   └── utils.js               # formatDate, formatTime, etc.
│   ├── hooks/
│   │   ├── useBookings.js
│   │   ├── useRooms.js
│   │   ├── useUnits.js
│   │   ├── useAvailability.js
│   │   └── useAuth.js             # convenience hook for AuthContext
│   └── context/
│       └── AuthContext.jsx         # Holds current user + token, auto-login on switch
└── README.md
```

---

## 4. Backend Technical Plan

### Framework & Libraries

| Library | Purpose |
|---|---|
| `express` | HTTP framework |
| `knex` | SQL query builder + migrations + seeds |
| `pg` | PostgreSQL driver |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |
| `jsonwebtoken` | JWT token generation/verification |
| `bcryptjs` | Password hashing (seeded users still have hashed passwords) |
| `express-validator` | Request validation |
| `helmet` | Security headers |
| `morgan` | Request logging |

### Why Knex.js (not Prisma, not Sequelize)

For a technical interview project, Knex strikes the right balance: it's a thin query builder with excellent migration/seed support, lets you write readable SQL-like code, and doesn't hide the database. It shows SQL proficiency without the boilerplate of raw `pg` queries.

---

## 5. Database Schema

### 5.1 Table: `users`

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

### 5.2 Table: `units`

```sql
CREATE TABLE units (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'Unit Keuangan'
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

### 5.3 Table: `meeting_rooms`

```sql
CREATE TABLE meeting_rooms (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'Ruang Prambanan'
  capacity   INTEGER      NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

### 5.4 Table: `bookings`

```sql
CREATE TABLE bookings (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id         INTEGER      NOT NULL REFERENCES units(id),
  meeting_room_id INTEGER      NOT NULL REFERENCES meeting_rooms(id),
  meeting_date    DATE         NOT NULL,
  start_time      TIME         NOT NULL,  -- e.g. '11:00'
  end_time        TIME         NOT NULL,  -- e.g. '13:00'
  participant_count INTEGER    NOT NULL CHECK (participant_count > 0),
  consumptions    TEXT[]       NOT NULL DEFAULT '{}',
      -- PostgreSQL text array: {'SNACK_SIANG','MAKAN_SIANG'}
      -- Valid values: 'MAKAN_SIANG', 'SNACK_SIANG', 'SNACK_SORE'
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_time_order CHECK (start_time < end_time)
);
```

**Why `TEXT[]` instead of a junction table?**

The consumption types are a small fixed set (3 values). For this scope, a PostgreSQL text array is simpler, avoids an extra table + joins, and is still queryable. A junction table (`booking_consumptions`) would be correct for a production app with evolving consumption types, but is overkill here.

If the interviewer prefers a normalized approach, the alternative is:

```sql
-- ALTERNATIVE (not recommended for this scope):
CREATE TABLE booking_consumptions (
  id         SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type       VARCHAR(20) NOT NULL CHECK (type IN ('MAKAN_SIANG','SNACK_SIANG','SNACK_SORE'))
);
```

### 5.5 Indexes

```sql
-- Critical index for overlap conflict checks (most important query in the app)
CREATE INDEX idx_bookings_room_date
  ON bookings (meeting_room_id, meeting_date);

-- For listing bookings by user (ownership queries)
CREATE INDEX idx_bookings_user
  ON bookings (user_id);

-- For date-range queries on the list page
CREATE INDEX idx_bookings_date
  ON bookings (meeting_date);
```

### 5.6 Entity Relationships

```
users 1──────M bookings
units 1──────M bookings
meeting_rooms 1──────M bookings
```

- A user can create many bookings.
- A unit can be associated with many bookings.
- A meeting room can have many bookings (but not overlapping).
- Each booking belongs to exactly one user, one unit, and one meeting room.

---

## 6. API Design

### 6.1 Base URL

```
http://localhost:4000/api
```

### 6.2 Standard Response Formats

**Success (single resource):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Success (list with pagination):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1000,
    "totalPages": 100
  }
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "participant_count", "message": "Must not exceed room capacity (10)" },
      { "field": "start_time", "message": "Must be in 30-minute intervals (e.g. 08:00, 08:30)" }
    ]
  }
}
```

**Conflict Error (409):**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Room 'Ruang Prambanan' is already booked on 2024-12-11 from 11:00 to 13:00"
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found"
  }
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only edit your own bookings"
  }
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

---

### 6.3 Auth Endpoints

The backend has full JWT auth. There is **no login page** — the frontend's AccountSwitcher component calls the login endpoint automatically with hardcoded credentials when the user picks an account.

#### `POST /api/auth/login`

Authenticate and receive a JWT token. Called by the frontend's AccountSwitcher — never by a login form.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### `GET /api/auth/me`

Get current user from token. Requires `Authorization: Bearer <token>` header.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 6.4 Users Endpoint

#### `GET /api/users`

Returns all seeded users (id, name, email only — no password). Used by the frontend AccountSwitcher to render the list of available accounts. **This endpoint is public** (no auth required) since it powers the account switcher before any token exists.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" },
    { "id": 3, "name": "Ahmad Rizky", "email": "ahmad@example.com" }
  ]
}
```

---

### 6.6 Units Endpoints

#### `GET /api/units`

Returns all units. No pagination needed (small dataset).

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Unit Keuangan" },
    { "id": 2, "name": "Unit SDM" },
    { "id": 3, "name": "Unit Marketing" },
    { "id": 4, "name": "Unit IT" }
  ]
}
```

---

### 6.7 Meeting Rooms Endpoints

#### `GET /api/rooms`

Returns all meeting rooms. No pagination needed.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Ruang Prambanan", "capacity": 10 },
    { "id": 2, "name": "Ruang Borobudur", "capacity": 20 },
    { "id": 3, "name": "Ruang Merapi", "capacity": 8 },
    { "id": 4, "name": "Ruang Bromo", "capacity": 15 }
  ]
}
```

---

### 6.8 Bookings Endpoints

All booking endpoints require `Authorization: Bearer <token>`.

#### `GET /api/bookings`

List bookings with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page (max 50) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "unit": { "id": 1, "name": "Unit Keuangan" },
      "meeting_room": { "id": 1, "name": "Ruang Prambanan", "capacity": 10 },
      "meeting_date": "2024-12-11",
      "start_time": "11:00",
      "end_time": "13:00",
      "participant_count": 8,
      "consumptions": ["SNACK_SIANG", "MAKAN_SIANG"],
      "user": { "id": 1, "name": "John Doe" },
      "created_at": "2024-12-10T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1000,
    "totalPages": 100
  }
}
```

#### `GET /api/bookings/:id`

Get a single booking detail.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "unit": { "id": 1, "name": "Unit Keuangan" },
    "meeting_room": { "id": 1, "name": "Ruang Prambanan", "capacity": 10 },
    "meeting_date": "2024-12-11",
    "start_time": "11:00",
    "end_time": "13:00",
    "participant_count": 8,
    "consumptions": ["SNACK_SIANG", "MAKAN_SIANG"],
    "user": { "id": 1, "name": "John Doe" },
    "is_owner": true,
    "created_at": "2024-12-10T08:00:00Z",
    "updated_at": "2024-12-10T08:00:00Z"
  }
}
```

**Note:** `is_owner` is computed by comparing `booking.user_id` with the authenticated user's ID. This field tells the frontend whether to show edit/delete buttons.

#### `POST /api/bookings`

Create a new booking.

**Request Body:**
```json
{
  "unit_id": 1,
  "meeting_room_id": 1,
  "meeting_date": "2024-12-11",
  "start_time": "11:00",
  "end_time": "13:00",
  "participant_count": 8,
  "consumptions": ["SNACK_SIANG", "MAKAN_SIANG"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "unit_id": 1,
    "meeting_room_id": 1,
    "meeting_date": "2024-12-11",
    "start_time": "11:00",
    "end_time": "13:00",
    "participant_count": 8,
    "consumptions": ["SNACK_SIANG", "MAKAN_SIANG"],
    "user_id": 1,
    "created_at": "2024-12-10T08:00:00Z"
  }
}
```

**Possible Errors:**
- 422 — validation errors
- 409 — booking conflict (overlapping time on same room)

#### `PATCH /api/bookings/:id`

Update a booking. Only the owner can update. Same body as POST (all fields optional — only send fields to update).

**Request Body (partial update):**
```json
{
  "start_time": "14:00",
  "end_time": "15:30",
  "participant_count": 5
}
```

**Response (200):** Same shape as GET single booking.

**Possible Errors:**
- 403 — not the owner
- 409 — new time conflicts with another booking
- 422 — validation errors

#### `DELETE /api/bookings/:id`

Delete a booking. Only the owner can delete.

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Booking deleted successfully" }
}
```

**Possible Errors:**
- 403 — not the owner
- 404 — not found

---

### 6.9 Availability Endpoints

These are the key UX endpoints that power the booking conflict prevention on the frontend.

#### `GET /api/availability/times?room_id=1&date=2024-12-11`

Returns booked time ranges for a specific room on a specific date. The frontend uses this to disable already-booked time slots.

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `room_id` | integer | yes | Meeting room ID |
| `date` | string (YYYY-MM-DD) | yes | Date to check |
| `exclude_booking_id` | integer | no | Exclude this booking (for edit mode) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "room_id": 1,
    "date": "2024-12-11",
    "booked_slots": [
      { "start_time": "09:00", "end_time": "10:30", "booking_id": 42 },
      { "start_time": "11:00", "end_time": "13:00", "booking_id": 55 },
      { "start_time": "15:00", "end_time": "16:00", "booking_id": 78 }
    ]
  }
}
```

The frontend will iterate through all 30-minute slots (08:00, 08:30, ..., 17:30) and mark a slot as disabled if it falls within any `booked_slots` range.

#### `GET /api/availability/rooms?date=2024-12-11&start_time=11:00&end_time=13:00`

Returns which rooms are available or booked for a given date + time range. The frontend uses this to disable already-booked rooms.

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `date` | string (YYYY-MM-DD) | yes | Date to check |
| `start_time` | string (HH:mm) | yes | Start time |
| `end_time` | string (HH:mm) | yes | End time |
| `exclude_booking_id` | integer | no | Exclude this booking (for edit mode) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-11",
    "start_time": "11:00",
    "end_time": "13:00",
    "rooms": [
      { "id": 1, "name": "Ruang Prambanan", "capacity": 10, "available": false },
      { "id": 2, "name": "Ruang Borobudur", "capacity": 20, "available": true },
      { "id": 3, "name": "Ruang Merapi", "capacity": 8, "available": true },
      { "id": 4, "name": "Ruang Bromo", "capacity": 15, "available": true }
    ]
  }
}
```

---

## 7. Booking Conflict Logic

This is the most critical business logic in the application.

### 7.1 Overlap Detection Rule

Two bookings conflict if they are on the **same room**, on the **same date**, and their time ranges overlap.

**Overlap condition:**
```
newStart < existingEnd AND newEnd > existingStart
```

This correctly handles all overlap cases:

```
Case 1: Partial overlap (new starts during existing)
  Existing:  |----11:00====13:00----|
  New:             |----12:00====14:00----|
  → 12:00 < 13:00 AND 14:00 > 11:00 → TRUE (conflict)

Case 2: Partial overlap (new ends during existing)
  Existing:       |----11:00====13:00----|
  New:       |----10:00====12:00----|
  → 10:00 < 13:00 AND 12:00 > 11:00 → TRUE (conflict)

Case 3: New completely inside existing
  Existing:  |----10:00============14:00----|
  New:             |----11:00====13:00----|
  → 11:00 < 14:00 AND 13:00 > 10:00 → TRUE (conflict)

Case 4: New completely contains existing
  Existing:       |----11:00====13:00----|
  New:       |----10:00================15:00----|
  → 10:00 < 13:00 AND 15:00 > 11:00 → TRUE (conflict)

Case 5: Adjacent (not overlapping — should be ALLOWED)
  Existing:  |----11:00====13:00----|
  New:                              |----13:00====14:00----|
  → 13:00 < 13:00? → FALSE → No conflict (allowed!)

Case 6: No overlap
  Existing:  |----11:00====13:00----|
  New:                                   |----14:00====15:00----|
  → 14:00 < 13:00? → FALSE → No conflict (allowed!)
```

### 7.2 SQL Query for Conflict Check

Used in `bookings.repository.js` when creating or updating a booking:

```sql
-- Check if any existing booking conflicts with the proposed booking
SELECT id, start_time, end_time
FROM bookings
WHERE meeting_room_id = $1          -- same room
  AND meeting_date = $2             -- same date
  AND start_time < $4               -- existing starts before new ends
  AND end_time > $3                 -- existing ends after new starts
  AND id != $5                      -- exclude current booking (for updates)
LIMIT 1;
```

**Parameters:**
- `$1` = meeting_room_id
- `$2` = meeting_date
- `$3` = new start_time
- `$4` = new end_time
- `$5` = booking ID to exclude (use `0` or `-1` for new bookings)

**If this query returns any row, the booking conflicts and must be rejected with a 409 response.**

### 7.3 Knex.js Implementation

```javascript
// bookings.repository.js

async function findConflict(roomId, date, startTime, endTime, excludeBookingId = 0) {
  const conflict = await knex('bookings')
    .where('meeting_room_id', roomId)
    .where('meeting_date', date)
    .where('start_time', '<', endTime)
    .where('end_time', '>', startTime)
    .whereNot('id', excludeBookingId)
    .first();

  return conflict || null;  // null means no conflict
}
```

### 7.4 Service Layer Usage

```javascript
// bookings.service.js

async function createBooking(userId, bookingData) {
  // 1. Validate room exists
  const room = await roomsRepository.findById(bookingData.meeting_room_id);
  if (!room) throw new ApiError(404, 'NOT_FOUND', 'Meeting room not found');

  // 2. Validate unit exists
  const unit = await unitsRepository.findById(bookingData.unit_id);
  if (!unit) throw new ApiError(404, 'NOT_FOUND', 'Unit not found');

  // 3. Validate participant count vs capacity
  if (bookingData.participant_count > room.capacity) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Participant count exceeds room capacity', [
      { field: 'participant_count', message: `Must not exceed room capacity (${room.capacity})` }
    ]);
  }

  // 4. Check for booking conflict
  const conflict = await bookingsRepository.findConflict(
    bookingData.meeting_room_id,
    bookingData.meeting_date,
    bookingData.start_time,
    bookingData.end_time
  );
  if (conflict) {
    throw new ApiError(409, 'BOOKING_CONFLICT',
      `Room is already booked on ${bookingData.meeting_date} from ${conflict.start_time} to ${conflict.end_time}`
    );
  }

  // 5. Create the booking
  return bookingsRepository.create({ ...bookingData, user_id: userId });
}
```

### 7.5 Availability Queries

**Booked times for a room on a date:**

```sql
SELECT id AS booking_id, start_time, end_time
FROM bookings
WHERE meeting_room_id = $1
  AND meeting_date = $2
  AND id != $3              -- exclude_booking_id (0 for new)
ORDER BY start_time;
```

**Unavailable rooms for a date + time range:**

```sql
SELECT DISTINCT meeting_room_id
FROM bookings
WHERE meeting_date = $1
  AND start_time < $3       -- existing starts before new ends
  AND end_time > $2          -- existing ends after new starts
  AND id != $4;              -- exclude_booking_id
```

Then in the service, compare this list against all rooms to mark `available: true/false`.

---

## 8. Frontend Technical Plan

### 8.1 Tech Stack

| Library | Purpose |
|---|---|
| `next` (v14+, App Router) | React framework |
| `tailwindcss` | Utility-first CSS |
| `axios` | HTTP client |
| `@tanstack/react-query` | Server state management, caching, refetching |
| `react-hook-form` | Form state management + validation |
| `date-fns` | Date formatting (lightweight) |
| `react-hot-toast` | Toast notifications for success/error |

### 8.2 Why These Choices

- **TanStack Query**: Handles caching, loading states, error states, and refetching out of the box. Avoids manual `useState` + `useEffect` for every API call. Demonstrates modern React patterns in an interview.
- **React Hook Form**: Performant form library that avoids re-renders. Built-in validation. Works well with controlled and uncontrolled inputs.
- **Tailwind CSS**: Fast styling, no context-switching to CSS files, easy to match the screenshot's clean dashboard aesthetic.

---

## 9. UI / Page Breakdown

### 9.1 App Layout

Every page shares a common layout (there is no login page):

```
┌────────────────────────────────────────────────────┐
│  Navbar (teal gradient, logo left, user avatar right)│
├──────┬─────────────────────────────────────────────┤
│      │                                             │
│ Side │        Main Content Area                    │
│ bar  │        (white bg, padded)                   │
│      │                                             │
│ Home │                                             │
│ User │                                             │
│      │                                             │
└──────┴─────────────────────────────────────────────┘
```

- **Navbar:** Fixed top. Height ~60px. Teal/dark gradient. Logo "FTL iMeeting" on left. Bell icon + **UserDropdown** on right.
- **Sidebar:** Fixed left. Width ~60px. Icons only: Home icon, Users icon. Active state highlights.
- **Main Content:** Scrollable. Max-width container. Padding on all sides.

### 9.2 UserDropdown + AccountSwitcher (no login page)

There is **no login page**. Instead, the Navbar contains a **UserDropdown** component on the right side that displays the current user's avatar and name. Clicking it opens a dropdown menu.

**UserDropdown** — the main dropdown that opens on click of the avatar/name area in the Navbar:

```
┌──────────────────────────┐
│  ● John Doe              │  ← avatar + name (current user)
│    john@example.com      │  ← email subtitle
│──────────────────────────│
│  ⚙  Settings             │  ← placeholder (disabled, for show)
│  🔄 Change Account    ▸  │  ← hover opens AccountSwitcher submenu
│──────────────────────────│
│  ↪  Logout               │  ← clears token, falls back to default user
│                          │
└──────────────────────────┘
```

**AccountSwitcher** — the flyout submenu that appears when hovering "Change Account":

```
                           ┌──────────────────────────┐
                           │  ● John Doe        ✓     │  ← current (check mark)
                           │  ● Jane Smith            │  ← click to switch
                           │  ● Ahmad Rizky           │  ← click to switch
                           └──────────────────────────┘
```

**How it works under the hood:**

1. On app mount, the frontend calls `GET /api/users` to fetch the list of all seeded users. This list is stored in AuthContext.
2. On first load (no token in localStorage), the app **automatically logs in as the first user** (John Doe) by calling `POST /api/auth/login` with `{ email: "john@example.com", password: "password123" }`. This happens silently — no login page.
3. All seeded users share the same password: `password123`. The frontend hardcodes this.
4. When the user clicks a different account in the AccountSwitcher, the frontend calls `POST /api/auth/login` with the selected user's email + the hardcoded password.
5. The returned JWT replaces the old one in localStorage. The AuthContext updates `currentUser`. All TanStack Query caches are invalidated so data refetches with the new token.
6. The page refreshes its data — bookings now show correct `is_owner` flags for the new user.

**Why this design:**

- The backend has **real JWT auth** — middleware verifies tokens, ownership checks work properly, the interviewer can see proper auth patterns.
- The frontend just skips the login form and automates the credential submission. This is a helper/convenience for interview demo purposes only.
- Switching accounts is instant and lets the interviewer test ownership logic easily (create a booking as John, switch to Jane, confirm edit/delete are hidden).

### 9.3 Booking List Page (`/bookings`)

```
┌─────────────────────────────────────────────────────────┐
│  ← (back)  Ruang Meeting                               │
│             Ruang Meeting                    [+ Pesan Ruangan]
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ UNIT | RUANG MEETING | KAPASITAS | TANGGAL | ...│    │
│  │──────┼───────────────┼───────────┼─────────┼────│    │
│  │ ...  │  ...          │  ...      │  ...    │ ...│    │
│  │ ...  │  ...          │  ...      │  ...    │ ...│    │
│  ├─────────────────────────────────────────────────┤    │
│  │  Showing 1-10 of 1000      [← 1 2 3 4 5 →]    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Table headers: UNIT, RUANG MEETING, KAPASITAS, TANGGAL RAPAT, WAKTU, JUMLAH PESERTA, JENIS KONSUMSI
- Each row is clickable — navigates to `/bookings/[id]` detail page
- Add an AKSI (Actions) column at the end showing Edit/Delete icons if `is_owner` is true
- Pagination at bottom of table
- "Pesan Ruangan" button at top right navigates to `/bookings/create`

### 9.4 Booking Detail Page (`/bookings/[id]`)

- Shows all booking fields in a read-only card layout.
- If `is_owner`, show "Edit" and "Delete" buttons.
- "Edit" navigates to `/bookings/[id]/edit`.
- "Delete" shows a confirmation dialog, then calls DELETE API and redirects to `/bookings`.

### 9.5 Create Booking Page (`/bookings/create`)

```
┌─────────────────────────────────────────────────────────┐
│  ← (back)  Ruang Meeting                               │
│             Ruang Meeting > Pesan Ruangan               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─ Informasi Ruang Meeting ────────────────────────┐   │
│  │                                                  │   │
│  │  Unit [select ▼]      Pilihan Ruang Meeting [▼]  │   │
│  │                                                  │   │
│  │  Kapasitas Ruangan [readonly: auto-filled]       │   │
│  │                                                  │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Informasi Rapat                                  │   │
│  │                                                  │   │
│  │  Tanggal Rapat [date]                            │   │
│  │  Pilihan Waktu Mulai [▼]   Waktu Selesai [▼]    │   │
│  │  Jumlah Peserta [number]                         │   │
│  │                                                  │   │
│  │  Jenis Konsumsi                                  │   │
│  │  ☐ Snack Siang                                   │   │
│  │  ☐ Makan Siang                                   │   │
│  │  ☐ Snack Sore                                    │   │
│  │                                                  │   │
│  │  Nominal Konsumsi  [Rp ________] (optional)      │   │
│  │                                                  │   │
│  ├──────────────────────────────────────────────────┤   │
│  │              [Batal]   [Simpan]                   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.6 Edit Booking Page (`/bookings/[id]/edit`)

Same form as Create, but pre-populated with existing booking data. Uses `exclude_booking_id` when fetching availability so the current booking's own slot doesn't appear as "booked."

---

## 10. Component Breakdown

### 10.1 Layout Components

| Component | File | Props | Notes |
|---|---|---|---|
| `Navbar` | `components/layout/Navbar.jsx` | none (reads auth context) | Logo, notification bell, renders `UserDropdown` on right |
| `Sidebar` | `components/layout/Sidebar.jsx` | none (reads pathname) | Home + Users icons, active state |
| `PageHeader` | `components/layout/PageHeader.jsx` | `title`, `breadcrumbs`, `actions` | Back button, title, breadcrumb trail, optional action buttons slot |
| `UserDropdown` | `components/layout/UserDropdown.jsx` | none (reads auth context) | Click avatar/name → dropdown with user info, "Change Account", "Logout" |
| `AccountSwitcher` | `components/layout/AccountSwitcher.jsx` | `users`, `currentUserId`, `onSwitch` | Flyout submenu listing all users. Check mark on current. Click triggers `onSwitch(user)` which calls login endpoint with hardcoded password |

### 10.2 UI Components

| Component | File | Props |
|---|---|---|
| `Button` | `components/ui/Button.jsx` | `variant` ("primary" / "danger" / "outline"), `size`, `disabled`, `loading`, `onClick`, `children` |
| `Card` | `components/ui/Card.jsx` | `children`, `className` |
| `Select` | `components/ui/Select.jsx` | `label`, `name`, `options` (array of `{value, label, disabled, disabledLabel}`), `value`, `onChange`, `error`, `placeholder` |
| `DateInput` | `components/ui/DateInput.jsx` | `label`, `name`, `value`, `onChange`, `error`, `min` |
| `TextInput` | `components/ui/TextInput.jsx` | `label`, `name`, `type`, `value`, `onChange`, `error`, `disabled`, `prefix` |
| `CheckboxGroup` | `components/ui/CheckboxGroup.jsx` | `label`, `name`, `options`, `value` (array), `onChange`, `error` |
| `Table` | `components/ui/Table.jsx` | `columns` (array of `{key, header, render?}`), `data`, `onRowClick`, `emptyMessage` |
| `Pagination` | `components/ui/Pagination.jsx` | `page`, `totalPages`, `total`, `limit`, `onPageChange` |
| `LoadingSpinner` | `components/ui/LoadingSpinner.jsx` | none |
| `EmptyState` | `components/ui/EmptyState.jsx` | `message` |
| `ErrorAlert` | `components/ui/ErrorAlert.jsx` | `error`, `onRetry` |

### 10.3 Feature Components

| Component | File | Description |
|---|---|---|
| `BookingTable` | `components/bookings/BookingTable.jsx` | Wraps Table + Pagination, formats booking data for display |
| `BookingForm` | `components/bookings/BookingForm.jsx` | The full create/edit form with all field logic, availability fetching, and validation |
| `BookingDetail` | `components/bookings/BookingDetail.jsx` | Read-only display of a booking with owner action buttons |

---

## 11. Form Behavior and Validation

### 11.1 React Hook Form Setup

```javascript
const form = useForm({
  defaultValues: {
    unit_id: '',
    meeting_room_id: '',
    meeting_date: '',
    start_time: '',
    end_time: '',
    participant_count: '',
    consumptions: [],
  },
});
```

### 11.2 Client-Side Validation Rules

| Field | Rules |
|---|---|
| `unit_id` | Required |
| `meeting_room_id` | Required |
| `meeting_date` | Required, must be today or future |
| `start_time` | Required, must be in 30-min intervals |
| `end_time` | Required, must be in 30-min intervals, must be after `start_time` |
| `participant_count` | Required, positive integer, must not exceed selected room's capacity |
| `consumptions` | Optional (empty array is valid) |

### 11.3 Server-Side Validation (express-validator)

Implemented in `validators/booking.validator.js`:

```javascript
const createBookingRules = [
  body('unit_id').isInt({ min: 1 }).withMessage('Unit is required'),
  body('meeting_room_id').isInt({ min: 1 }).withMessage('Meeting room is required'),
  body('meeting_date').isDate({ format: 'YYYY-MM-DD' }).withMessage('Valid date required'),
  body('start_time').matches(/^([01]\d|2[0-3]):(00|30)$/).withMessage('Must be in 30-minute intervals'),
  body('end_time').matches(/^([01]\d|2[0-3]):(00|30)$/).withMessage('Must be in 30-minute intervals'),
  body('end_time').custom((endTime, { req }) => {
    if (endTime <= req.body.start_time) throw new Error('End time must be after start time');
    return true;
  }),
  body('participant_count').isInt({ min: 1 }).withMessage('Must be a positive number'),
  body('consumptions').isArray().withMessage('Must be an array'),
  body('consumptions.*').isIn(['MAKAN_SIANG', 'SNACK_SIANG', 'SNACK_SORE']).withMessage('Invalid consumption type'),
];
```

### 11.4 Error Display Strategy

- Each form field shows its own error message below the input in red text.
- Server-side validation errors (422) are mapped to the corresponding field by the `field` key in the error details array.
- Conflict errors (409) are displayed as a toast notification at the top of the page.
- Network errors are displayed as a generic error alert.

### 11.5 Field Interaction Flow

```
1. User selects Unit → no side effects
2. User selects Ruang Meeting →
   a. Kapasitas Ruangan auto-fills (from rooms data already loaded)
   b. If meeting_date is already set, fetch booked time slots
3. User selects Tanggal Rapat →
   a. If meeting_room_id is set, fetch booked time slots → disable times
   b. If start_time + end_time are set, fetch unavailable rooms → disable rooms
4. User selects Waktu Mulai →
   a. Clear Waktu Selesai if it's now invalid (earlier or equal)
   b. Filter Waktu Selesai options (only show times after Waktu Mulai)
5. User selects Waktu Selesai →
   a. If date + start + end are set, fetch unavailable rooms → disable rooms
6. User enters Jumlah Peserta →
   a. Validate against room capacity on blur
7. User clicks Simpan →
   a. Run all client-side validation
   b. If valid, POST to backend
   c. If 201, show success toast + redirect to /bookings
   d. If 409, show conflict toast
   e. If 422, map errors to fields
```

---

## 12. Availability UX

### 12.1 Case 1: Room + Date Selected → Disable Times

**Trigger:** When both `meeting_room_id` AND `meeting_date` have values.

**API Call:**
```
GET /api/availability/times?room_id=1&date=2024-12-11
```

**Frontend Logic:**

```javascript
// Generate all 30-min slots from 08:00 to 18:00
const ALL_SLOTS = ['08:00','08:30','09:00', ... ,'17:30','18:00'];

// For each slot, check if it falls inside any booked range
function isSlotBooked(slot, bookedSlots) {
  return bookedSlots.some(b => slot >= b.start_time && slot < b.end_time);
}

// Render each option:
// { value: '11:00', label: '11:00', disabled: true, disabledLabel: 'Booked' }
// { value: '14:00', label: '14:00', disabled: false }
```

A disabled option in the Select dropdown appears grayed out with a "(Booked)" label next to the time.

### 12.2 Case 2: Date + Time Selected → Disable Rooms

**Trigger:** When `meeting_date` AND `start_time` AND `end_time` all have values.

**API Call:**
```
GET /api/availability/rooms?date=2024-12-11&start_time=11:00&end_time=13:00
```

**Frontend Logic:**

```javascript
// Rooms response has available: true/false per room
// Render each option:
// { value: 1, label: 'Ruang Prambanan (10 orang)', disabled: true, disabledLabel: 'Booked' }
// { value: 2, label: 'Ruang Borobudur (20 orang)', disabled: false }
```

### 12.3 Edit Mode

When editing, pass `exclude_booking_id` to both availability endpoints so the booking's own slot doesn't block itself.

### 12.4 Debouncing

Availability API calls should be debounced (300ms) since field changes can happen rapidly. Use a simple `setTimeout` debounce in the `useEffect` that watches the relevant fields.

---

## 13. Auth and Ownership Strategy

### Approach: Real JWT Backend + AccountSwitcher Frontend (No Login Page)

The backend implements **full JWT authentication** — real middleware, real token verification, real ownership checks. The only difference from a production app is that the frontend has no login page. Instead, it uses an **AccountSwitcher** component that calls the login endpoint automatically with hardcoded credentials.

This is the best fit for a technical interview project because:
- The backend demonstrates real auth patterns (JWT, middleware, protected routes) — the interviewer sees proper implementation.
- The frontend is faster to demo — no need to type credentials, just click a user in the dropdown.
- Ownership logic is easy to test — switch accounts and see edit/delete buttons appear/disappear.
- It's still a proper auth flow under the hood (token in header, middleware verification, expiry).

### Backend Implementation (real JWT, no shortcuts)

1. **Seeded users** with bcrypt-hashed passwords. All users share the same password: `password123`.
2. **Login endpoint** (`POST /api/auth/login`) validates email + bcrypt password, returns JWT.
3. **JWT payload**: `{ userId: 1, email: 'john@example.com' }`, expires in 24h.
4. **Auth middleware**: Extracts JWT from `Authorization: Bearer <token>`, verifies, attaches `req.user = { id, email }`.
5. **All booking endpoints** require auth middleware.
6. **Users, units, and rooms endpoints** are public (no auth needed — reference data + account switcher data).
7. **Users endpoint** (`GET /api/users`) returns all users without passwords — used by the AccountSwitcher.

### Frontend Implementation (auto-login, no login page)

1. On app mount, `AuthContext` checks localStorage for an existing token.
2. If a token exists, it calls `GET /api/auth/me` to verify. If valid, user is set. If expired/invalid, token is cleared.
3. If no token exists (first visit), the app **auto-logs in as the first seeded user** by calling `POST /api/auth/login` with `{ email: "john@example.com", password: "password123" }`.
4. The hardcoded password `password123` is stored as a constant in the frontend: `const DEMO_PASSWORD = 'password123';`
5. The AccountSwitcher fetches `GET /api/users` on mount to display the user list.
6. When a user clicks a different account, the frontend calls `POST /api/auth/login` with `{ email: selectedUser.email, password: DEMO_PASSWORD }`.
7. The new JWT replaces the old one in localStorage. `AuthContext` updates. All TanStack Query caches are invalidated (`queryClient.invalidateQueries()`) so data refetches with the new user's ownership context.
8. Axios interceptor always attaches `Authorization: Bearer <token>` from localStorage.

### Auth Middleware (pseudo-code)

```javascript
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ ... });

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
}
```

### Ownership Check (in service layer)

```javascript
async function updateBooking(userId, bookingId, updateData) {
  const booking = await bookingsRepository.findById(bookingId);
  if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');
  if (booking.user_id !== userId) throw new ApiError(403, 'FORBIDDEN', 'You can only edit your own bookings');
  // ... proceed with update
}
```

---

## 14. Docker and Local Development Setup

### 14.1 `docker-compose.yml` (in backend repo root)

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: imeeting-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-imeeting}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-imeeting_pass}
      POSTGRES_DB: ${DB_NAME:-imeeting}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### 14.2 `.env.example` (in backend repo root)

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=imeeting
DB_PASSWORD=imeeting_pass
DB_NAME=imeeting

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 14.3 Backend Setup Commands

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Run migrations
npx knex migrate:latest

# 5. Run seeds
npx knex seed:run

# 6. Start the server
npm run dev
```

### 14.4 `knexfile.js`

```javascript
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: './database/migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
  },
};
```

### 14.5 `package.json` Scripts (backend)

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "migrate": "knex migrate:latest",
    "migrate:rollback": "knex migrate:rollback",
    "seed": "knex seed:run",
    "db:reset": "knex migrate:rollback --all && knex migrate:latest && knex seed:run"
  }
}
```

### 14.6 Frontend `.env.local.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 14.7 Frontend Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.local.example .env.local

# 3. Start the dev server
npm run dev
```

---

## 15. Environment Variables

### Backend

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | no | 4000 | Server port |
| `NODE_ENV` | no | development | Environment |
| `DB_HOST` | yes | localhost | PostgreSQL host |
| `DB_PORT` | yes | 5432 | PostgreSQL port |
| `DB_USER` | yes | - | Database user |
| `DB_PASSWORD` | yes | - | Database password |
| `DB_NAME` | yes | - | Database name |
| `JWT_SECRET` | yes | - | JWT signing secret |
| `JWT_EXPIRES_IN` | no | 24h | JWT expiry |
| `CORS_ORIGIN` | no | http://localhost:3000 | Allowed CORS origin |

### Frontend

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | - | Backend API base URL |

---

## 16. Seed Data Plan

### 16.1 Users

| id | name | email | password (plain) |
|---|---|---|---|
| 1 | John Doe | john@example.com | password123 |
| 2 | Jane Smith | jane@example.com | password123 |
| 3 | Ahmad Rizky | ahmad@example.com | password123 |

All passwords are stored as bcrypt hashes.

### 16.2 Units

| id | name |
|---|---|
| 1 | Unit Keuangan |
| 2 | Unit SDM |
| 3 | Unit Marketing |
| 4 | Unit IT |

### 16.3 Meeting Rooms

| id | name | capacity |
|---|---|---|
| 1 | Ruang Prambanan | 10 |
| 2 | Ruang Borobudur | 20 |
| 3 | Ruang Merapi | 8 |
| 4 | Ruang Bromo | 15 |
| 5 | Ruang Semeru | 30 |

### 16.4 Bookings (sample)

| id | user_id | unit_id | room_id | date | start | end | participants | consumptions |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2024-12-11 | 11:00 | 13:00 | 8 | {SNACK_SIANG,MAKAN_SIANG} |
| 2 | 2 | 2 | 1 | 2024-12-11 | 14:00 | 15:30 | 5 | {SNACK_SORE} |
| 3 | 1 | 3 | 2 | 2024-12-12 | 09:00 | 11:00 | 15 | {SNACK_SIANG} |
| 4 | 3 | 4 | 3 | 2024-12-12 | 13:00 | 14:30 | 6 | {MAKAN_SIANG,SNACK_SORE} |
| 5 | 2 | 1 | 4 | 2024-12-13 | 10:00 | 12:00 | 12 | {SNACK_SIANG,MAKAN_SIANG} |

Add 15-20 bookings total across different users, rooms, and dates so the list page has enough data to test pagination.

---

## 17. Testing Plan

For a technical interview project, focus on testing the critical path. Do not aim for 100% coverage.

### 17.1 Backend Tests (recommended but optional for interview scope)

**Priority 1 — must have if time allows:**
- Booking conflict detection logic (unit test the `findConflict` repository function)
- Booking creation service (test conflict rejection, capacity validation)
- Test all 6 overlap cases from section 7.1

**Priority 2 — nice to have:**
- API integration tests for booking CRUD endpoints
- Auth middleware test
- Ownership check test

**Test framework:** Jest or Vitest. Use a test database (separate DB or transactions that rollback).

### 17.2 Frontend Tests (optional for interview scope)

- Component render tests for BookingForm
- Test that disabled options appear correctly
- Test form validation error display

**Test framework:** Vitest + React Testing Library.

### 17.3 Manual Testing Checklist

- [ ] App auto-logs in as John on first load, create a booking
- [ ] Switch to Jane via AccountSwitcher, verify you cannot edit/delete John's booking
- [ ] Create two bookings on the same room at overlapping times — verify 409 error
- [ ] Create adjacent bookings (e.g. 11:00-13:00 then 13:00-14:00) — verify it succeeds
- [ ] Select a room + date, verify booked times show as disabled
- [ ] Select a date + time, verify booked rooms show as disabled
- [ ] Enter participant count exceeding room capacity — verify validation error
- [ ] Test pagination (next, previous, page numbers)
- [ ] Edit a booking, change the time, verify conflict check works with exclude
- [ ] Delete a booking, verify it disappears from the list

---

## 18. Implementation Milestones

### Milestone 1: Backend Foundation (estimated: 2-3 hours)

- [x] Init Express project, install dependencies
- [x] Set up docker-compose.yml for PostgreSQL
- [x] Configure Knex.js
- [x] Create all 4 migration files
- [x] Create seed file
- [x] Run migrations + seeds, verify DB state
- [x] Set up Express app with middleware (cors, helmet, morgan, json)
- [x] Implement error handler middleware
- [x] Implement ApiError and ApiResponse utilities

### Milestone 2: Backend Auth + Reference APIs (estimated: 1-2 hours)

- [x] Implement auth service (login, verify token)
- [x] Implement auth middleware
- [x] Implement auth routes (POST /login, GET /me)
- [x] Implement units routes (GET /units)
- [x] Implement rooms routes (GET /rooms)
- [x] Test with Postman/curl

### Milestone 3: Backend Bookings CRUD + Conflict Logic (estimated: 2-3 hours)

- [x] Implement bookings repository (findAll, findById, create, update, delete, findConflict)
- [x] Implement bookings service (create, update, delete with all validation)
- [x] Implement bookings controller
- [x] Implement bookings validator
- [x] Implement bookings routes
- [x] Implement availability service + routes
- [x] Test all endpoints with Postman/curl
- [x] Verify conflict logic with manual tests

### Milestone 4: Frontend Foundation (estimated: 2-3 hours)

- [x] Init Next.js project with Tailwind CSS
- [x] Install dependencies (axios, tanstack-query, react-hook-form, date-fns, react-hot-toast)
- [x] Create API client (axios instance with interceptor)
- [x] Create AuthContext + useAuth hook (auto-login on mount, switchUser function)
- [x] Build layout components (Navbar, Sidebar, PageHeader, UserDropdown, AccountSwitcher)
- [x] Build UI components (Button, Card, Table, Pagination, Select, TextInput, DateInput, CheckboxGroup)
- [x] Test auto-login flow + account switching

### Milestone 5: Frontend Booking List + Detail (estimated: 2-3 hours)

- [x] Create booking list page with BookingTable
- [x] Implement pagination (query params, TanStack Query)
- [x] Create booking detail page
- [x] Implement ownership-based action buttons (edit/delete visible only for owner)
- [x] Implement delete with confirmation dialog
- [x] Test list + detail flow

### Milestone 6: Frontend Booking Form + Availability (estimated: 3-4 hours)

- [x] Create BookingForm component with React Hook Form
- [x] Implement all form fields with validation
- [x] Implement availability fetching (useAvailability hook)
- [x] Implement time slot disabling logic
- [x] Implement room disabling logic
- [x] Implement "Booked" label on disabled options
- [x] Implement create booking flow (submit, success toast, redirect)
- [x] Implement edit booking flow (pre-populate, exclude_booking_id, update)
- [x] Handle server validation errors (map to fields)
- [x] Handle conflict errors (toast)
- [x] Test all form scenarios

### Milestone 7: Polish + Final Testing (estimated: 1-2 hours)

- [x] Review UI against screenshots
- [x] Fix spacing, alignment, colors
- [ ] Test all manual test cases from section 17.3 — pending end-to-end with backend running
- [x] Write README.md for both repos
- [x] Clean up code, remove console.logs
- [ ] Final run-through: docker-compose up → migrate → seed → start backend → start frontend → test

**Total estimated time: 13-20 hours**

---

## 19. Suggested Task Breakdown for Coding Agent

When giving this plan to a coding agent, split the work into these discrete tasks. Each task should be completable independently and testable.

### Backend Tasks

```
TASK B1: Project Init
- npm init, install all dependencies
- Create docker-compose.yml
- Create .env.example, copy to .env
- Create knexfile.js
- Create src/index.js and src/app.js (basic Express server that returns 200 on GET /)
- Verify: docker-compose up -d && npm run dev → server starts on :4000

TASK B2: Database Migrations
- Create migration 001_create_users (id, name, email, password_hash, timestamps)
- Create migration 002_create_units (id, name, created_at)
- Create migration 003_create_meeting_rooms (id, name, capacity, created_at)
- Create migration 004_create_bookings (id, user_id, unit_id, meeting_room_id, meeting_date, start_time, end_time, participant_count, consumptions TEXT[], timestamps)
- Add CHECK constraints: capacity > 0, participant_count > 0, start_time < end_time
- Add indexes: idx_bookings_room_date, idx_bookings_user, idx_bookings_date
- Add foreign keys with ON DELETE CASCADE for user_id
- Verify: npx knex migrate:latest → tables exist in DB

TASK B3: Seed Data
- Create 001_seed_all.js
- Seed 3 users with bcrypt-hashed passwords
- Seed 4 units
- Seed 5 meeting rooms
- Seed 15-20 bookings across different users/rooms/dates
- Verify: npx knex seed:run → data visible in DB

TASK B4: Utilities & Middleware
- Create src/utils/ApiError.js (class with statusCode, code, message, details)
- Create src/utils/ApiResponse.js (static methods: success, paginated, error)
- Create src/middleware/errorHandler.js (catch ApiError, format response)
- Create src/middleware/validate.js (run express-validator, return 422 on errors)
- Create src/middleware/auth.middleware.js (verify JWT, attach req.user)
- Wire up errorHandler in app.js

TASK B5: Auth + Users Endpoints
- Create src/repositories/users.repository.js (findByEmail, findById, findAll)
- Create src/services/auth.service.js (login: verify password, generate JWT)
- Create src/services/users.service.js (listAll: returns users without password_hash)
- Create src/controllers/auth.controller.js
- Create src/controllers/users.controller.js
- Create src/validators/auth.validator.js (email required, password required)
- Create src/routes/auth.routes.js (POST /login, GET /me)
- Create src/routes/users.routes.js (GET /users — public, no auth, for account switcher)
- Register routes in src/routes/index.js
- Verify: curl GET /api/users → list of users (no passwords)
- Verify: curl POST /api/auth/login → get token → curl GET /api/auth/me with token

TASK B6: Units & Rooms Endpoints
- Create repositories, services, controllers, routes for units (GET /api/units)
- Create repositories, services, controllers, routes for rooms (GET /api/rooms)
- These are simple list endpoints, no auth required
- Verify: curl GET /api/units, curl GET /api/rooms

TASK B7: Bookings CRUD Endpoints
- Create src/repositories/bookings.repository.js
  - findAll(page, limit) with JOIN on users, units, meeting_rooms
  - findById(id) with JOINs
  - create(data)
  - update(id, data)
  - delete(id)
  - findConflict(roomId, date, startTime, endTime, excludeId)
- Create src/services/bookings.service.js
  - list(page, limit)
  - getById(id, currentUserId) — includes is_owner computation
  - create(userId, data) — validate room, unit, capacity, conflict
  - update(userId, bookingId, data) — validate ownership, conflict
  - delete(userId, bookingId) — validate ownership
- Create src/controllers/bookings.controller.js
- Create src/validators/booking.validator.js
- Create src/routes/bookings.routes.js (all require auth)
- Verify with curl: create booking, list, get by id, update, delete, conflict test

TASK B8: Availability Endpoints
- Create src/services/availability.service.js
  - getBookedTimes(roomId, date, excludeBookingId)
  - getRoomAvailability(date, startTime, endTime, excludeBookingId)
- Create src/controllers/availability.controller.js
- Create src/routes/availability.routes.js
- Verify: curl availability endpoints with various params
```

### Frontend Tasks

```
TASK F1: Project Init
- npx create-next-app with App Router, Tailwind CSS
- Install: axios, @tanstack/react-query, react-hook-form, date-fns, react-hot-toast
- Create .env.local.example with NEXT_PUBLIC_API_URL
- Create src/lib/api/client.js (axios instance)
- Verify: npm run dev → page loads on :3000

TASK F2: Auth Context + AccountSwitcher (NO login page)
- Create src/lib/api/auth.js: login(email, password) → { token, user }
- Create src/lib/api/users.js: getUsers() → list of all users (for account switcher)
- Define constant: DEMO_PASSWORD = 'password123'
- Create src/context/AuthContext.jsx
  - Provides: user, token, users (all accounts), switchUser(user), isLoading
  - On mount: check localStorage for token → validate with GET /me
  - If no token or invalid: auto-login as first seeded user (john@example.com + DEMO_PASSWORD)
  - switchUser(user): call POST /login with user.email + DEMO_PASSWORD → store new token → invalidate all queries
  - Fetch GET /api/users on mount and expose as `users` array
- Create src/hooks/useAuth.js (convenience hook wrapping AuthContext)
- Verify: app loads, auto-logs in as John, token stored in localStorage

TASK F3: Layout Components + UserDropdown + AccountSwitcher
- Create Navbar.jsx: teal gradient bar, "FTL iMeeting" logo text on left, bell icon + UserDropdown on right
- Create Sidebar.jsx: narrow left bar with Home + Users icons, active state based on pathname
- Create PageHeader.jsx: back button, title, breadcrumbs, action slot
- Create UserDropdown.jsx:
  - Shows current user avatar + name + dropdown chevron
  - On click: opens dropdown with user info, "Settings" (disabled placeholder), "Change Account ▸", "Logout"
  - "Change Account" on hover → shows AccountSwitcher flyout submenu
  - "Logout" clears token then auto-logs in as default user again (since there's no login page to go to)
- Create AccountSwitcher.jsx:
  - Flyout submenu listing all users from AuthContext.users
  - Shows check mark (✓) next to the current user
  - On click of a different user: calls AuthContext.switchUser(user)
  - Shows brief loading state during switch
- Create root layout.jsx: wraps all pages in Navbar + Sidebar + main content area
- Style to match screenshots: teal navbar, white content area, subtle sidebar
- Verify: layout renders, clicking user opens dropdown, hovering "Change Account" shows user list, clicking a user switches account and data refreshes

TASK F4: UI Components
- Build all UI components from section 10.2
- Each component should accept props as defined
- Select component must support disabled options with disabledLabel
- Table component must accept column definitions with optional render functions
- Pagination shows "Showing X-Y of Z" and page buttons
- Use Tailwind for all styling
- Verify: render each component in isolation (or just visually on a test page)

TASK F5: Booking List Page
- Create src/app/bookings/page.jsx
- Create src/hooks/useBookings.js (TanStack Query: useQuery for list)
- Create src/lib/api/bookings.js (getBookings, getBooking, createBooking, updateBooking, deleteBooking)
- Create BookingTable.jsx: formats data, renders Table + Pagination
- Handle page query param: /bookings?page=2
- Add "Pesan Ruangan" button in PageHeader actions
- Handle loading, empty, error states
- Verify: page loads, shows bookings, pagination works

TASK F6: Booking Detail Page
- Create src/app/bookings/[id]/page.jsx
- Create BookingDetail.jsx: displays all fields
- Show edit/delete buttons only if is_owner is true
- Delete button shows confirm dialog, then calls API, redirects
- Edit button navigates to /bookings/[id]/edit
- Verify: detail loads, ownership buttons work, delete works

TASK F7: Booking Form — Create
- Create src/app/bookings/create/page.jsx
- Create BookingForm.jsx with React Hook Form
- Create src/hooks/useRooms.js, src/hooks/useUnits.js
- Create src/lib/api/rooms.js, src/lib/api/units.js
- Implement all fields: Unit select, Room select, Kapasitas (readonly), Tanggal, Waktu Mulai, Waktu Selesai, Jumlah Peserta, Jenis Konsumsi checkboxes
- Kapasitas auto-fills when room selected
- Generate 30-min time options from 08:00 to 18:00
- Waktu Selesai only shows options after Waktu Mulai
- Client-side validation on all fields
- Submit: POST /api/bookings → success toast + redirect, or show errors
- Batal button: navigate back to /bookings
- Verify: create a booking through the form

TASK F8: Availability UX
- Create src/hooks/useAvailability.js
- Create src/lib/api/availability.js (getBookedTimes, getRoomAvailability)
- In BookingForm, add effects:
  - When room_id + date change → fetch booked times → disable time slots
  - When date + start_time + end_time change → fetch room availability → disable rooms
- Render disabled options with "(Booked)" label
- Add 300ms debounce on availability fetches
- Verify: select room + date → see disabled times. Select date + times → see disabled rooms.

TASK F9: Booking Form — Edit
- Create src/app/bookings/[id]/edit/page.jsx
- Reuse BookingForm with mode="edit" prop
- Pre-populate form with existing booking data
- Pass exclude_booking_id to availability endpoints
- Submit: PATCH /api/bookings/:id
- Verify: edit a booking, change time, verify conflict check works

TASK F10: Polish
- Match UI to screenshot styling (spacing, colors, borders, shadows)
- Ensure responsive behavior (optional but nice)
- Add loading spinners on all data-dependent pages
- Add empty states where appropriate
- Add error handling for network failures
- Write README.md with setup instructions
- Final cleanup
```

---

## 20. Risks / Edge Cases

| Risk | Mitigation |
|---|---|
| **Race condition**: Two users submit overlapping bookings simultaneously | The backend conflict check uses a DB query. For true safety, wrap the check + insert in a transaction with `SERIALIZABLE` isolation, or use a PostgreSQL advisory lock on the room_id. For interview scope, a simple transaction is sufficient. |
| **Timezone issues** | Store all times as `TIME` (no timezone) and `DATE`. Assume the app operates in a single timezone. Frontend and backend should agree on this. |
| **Past date bookings** | Frontend validates date >= today. Backend should also reject past dates. Seed data may include past dates for demo purposes — that's fine. |
| **Midnight edge case** | If end_time is `00:00`, it could mean midnight (next day). Avoid by restricting time options to `08:00`-`18:00`. |
| **Browser back button after form submit** | After successful create/edit, use `router.replace('/bookings')` instead of `router.push()` to prevent going back to the form. |
| **Token expiry** | Axios interceptor catches 401 responses. On 401, auto-re-login as the current user (call login endpoint again with stored email + DEMO_PASSWORD). Show a "Session refreshed" toast. |
| **Large number of bookings** | Pagination handles this. The index on `(meeting_room_id, meeting_date)` ensures availability queries are fast. |
| **User deletes a room that has bookings** | Not in scope (no room management CRUD). Foreign key constraint protects data integrity. |
| **Consumption field empty** | Valid. An empty array `[]` means no consumption. Frontend allows submitting with no checkboxes selected. |

---

## 21. Future Improvements

These are explicitly out of scope but worth mentioning to show awareness:

1. **Recurring bookings** — weekly/monthly repeat pattern
2. **Calendar view** — visual day/week grid instead of just a table
3. **Room management CRUD** — admin can add/edit/delete rooms
4. **User management** — admin can add/edit/delete users
5. **Role-based access** — admin vs. regular user
6. **Email notifications** — booking confirmation, reminder, cancellation
7. **Search and filters** — filter bookings by unit, room, date range
8. **Export** — export bookings to CSV/Excel
9. **Audit log** — track who changed what
10. **Real-time updates** — WebSocket to push booking changes to all clients
11. **Mobile responsive** — fully responsive layout
12. **Dark mode**
13. **TypeScript** — for both frontend and backend (stronger type safety)

---

## 22. Final Checklist

Before submitting the project, verify:

### Implementation Progress

**Backend foundation completed on 2026-05-08:**

- Express backend scaffolded in `/backend` using the planned `src/` structure.
- PostgreSQL Docker Compose file added and verified.
- Knex configuration, migrations, and seed data added.
- JWT auth, public reference-data routes, protected booking CRUD routes, and availability routes implemented.
- Booking overlap conflict logic implemented using `newStart < existingEnd AND newEnd > existingStart`.
- Smoke-tested health, users, rooms, login, authenticated booking list, availability, and conflict rejection endpoints.
- Completed backend CRUD/ownership smoke tests: `GET /me`, `GET /units`, create adjacent booking, owner update, non-owner update/delete forbidden, owner delete, and 422 field validation.
- Normalized booking date/time API responses to `YYYY-MM-DD` and `HH:mm`, including timezone-safe PostgreSQL `DATE` handling.

**Frontend foundation verified on 2026-05-08:**

- Confirmed existing Next.js app structure, API client, AuthContext, layout components, booking list/detail/create/edit pages, and booking form components.
- Removed external `next/font/google` dependency so production builds do not require Google Fonts network access.
- Fixed initial auth gating so protected booking queries wait until auto-login has a token.
- Fixed booking table date formatting to avoid timezone day shifts.
- Added `/frontend/.env.local.example` and replaced the template README with iMeeting setup instructions.
- `npm run lint` passes.
- `npm run build` passes.
- `npm run dev` starts on port 3000; `/bookings` and `/bookings/create` return HTTP 200.
- Refreshed backend and frontend env example files with documented local defaults, and set up `/frontend/.env.local` for `http://localhost:4000/api`.
- Added root README and expanded backend/frontend README files with clearer setup, environment, database, scripts, and verification instructions.

### Backend
- [x] `docker-compose up -d` starts PostgreSQL
- [x] `npm install` succeeds
- [x] `npx knex migrate:latest` creates all tables
- [x] `npx knex seed:run` populates data
- [x] `npm run dev` starts server on port 4000
- [x] GET /api/users returns all users (no passwords)
- [x] POST /api/auth/login returns JWT token
- [x] GET /api/auth/me with token returns current user
- [x] GET /api/units returns 4 units
- [x] GET /api/rooms returns 5 rooms
- [x] GET /api/bookings returns paginated list
- [x] POST /api/bookings creates a booking
- [x] POST /api/bookings with overlap returns 409
- [x] Adjacent bookings (e.g. 13:00-14:00 after 11:00-13:00) succeed
- [x] PATCH /api/bookings/:id by owner succeeds
- [x] PATCH /api/bookings/:id by non-owner returns 403
- [x] DELETE /api/bookings/:id by owner succeeds
- [x] DELETE /api/bookings/:id by non-owner returns 403
- [x] Availability endpoints return correct data
- [x] Validation errors return 422 with field-level details
- [x] No console errors in normal operation

### Frontend
- [x] `npm install` succeeds
- [x] `npm run dev` starts on port 3000
- [x] App auto-logs in as John Doe on first load (no login page)
- [x] UserDropdown shows current user name + avatar in Navbar
- [x] Clicking UserDropdown opens dropdown menu
- [x] Hovering "Change Account" shows AccountSwitcher flyout with all users
- [x] Clicking a different user switches account (new JWT, data refreshes)
- [x] Current user has check mark in AccountSwitcher
- [x] Booking list page loads with table + pagination
- [x] "Pesan Ruangan" button navigates to create form
- [x] All form fields work correctly
- [x] Room selection auto-fills capacity
- [x] Booked time slots show as disabled with "Booked" label
- [x] Booked rooms show as disabled with "Booked" label
- [x] Form validates participant count against capacity
- [x] Form validates end time after start time
- [x] Successful booking shows toast and redirects
- [x] Conflict error shows appropriate message
- [x] Booking detail page shows all info
- [x] Edit/delete buttons only appear for owner
- [x] Switch account → edit/delete buttons disappear for other user's bookings
- [x] Edit form pre-populates correctly
- [x] Delete shows confirmation and works
- [x] UI reasonably matches the provided screenshots
- [ ] No console errors in normal operation — pending end-to-end test with backend running

---

*End of Technical Implementation Plan*
