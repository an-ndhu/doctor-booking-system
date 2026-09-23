# Doctor Booking System

Production-minded backend for clinic appointment booking. It is a **modular monolith**: one Express process and one PostgreSQL database, with auth, clinics, doctors, scheduling, and appointments isolated behind services and repositories so scheduling/booking could be extracted later if needed.

Microservices are intentionally deferred. This domain does not yet need independent deploys, distributed transactions, or cross-service messaging. PostgreSQL transactions and constraints are simpler and safer for double-booking.

## Features

- JWT authentication and `ADMIN` / `USER` roles
- Clinic timezone configuration (IANA identifiers)
- Admin doctor CRUD (soft deactivation)
- Working schedules with multiple intervals per weekday
- Breaks, leave, and unavailable periods
- Timezone-aware availability slots
- Transactional booking with PostgreSQL exclusion constraints
- Validation, structured errors, Helmet, CORS, auth rate limiting

## Tech stack

Node.js, **TypeScript**, Express, PostgreSQL 16, Sequelize (migrations, not `sync()`), JWT, bcrypt, Joi, Luxon, Jest, Docker Compose (Postgres + pgAdmin).

Development uses `tsx`; production uses `npm run build` then `npm start`. `npm run typecheck` runs the TypeScript compiler without emitting files.

## Architecture

```
HTTP -> Controller -> Service -> Repository -> Sequelize -> PostgreSQL
```

Feature modules live under `src/modules/`. Shared errors, constants, and timezone helpers live under `src/shared/`.

## Timezone strategy

Doctor working hours are **wall-clock times in the clinic timezone**. Appointments are stored as `TIMESTAMPTZ` (absolute instants). Availability:

1. Interpret `date` in the clinic timezone
2. Load weekday schedules
3. Generate 30-minute local slots (Luxon, never the server TZ)
4. Subtract exceptions and `BOOKED` appointments
5. Return ISO-8601 UTC timestamps

The process timezone is treated as irrelevant. Tests force `TZ=UTC`.

## Double-booking strategy

Availability is a hint. Booking re-validates the slot inside a transaction, then inserts a `BOOKED` row. PostgreSQL enforces non-overlapping ranges:

```sql
CREATE EXTENSION btree_gist;

EXCLUDE USING gist (
  doctor_id WITH =,
  tstzrange(start_at, end_at, '[)') WITH &&
) WHERE (status = 'BOOKED')
```

Adjacent slots (`09:00–09:30` and `09:30–10:00`) are allowed. Overlaps return **409** `APPOINTMENT_CONFLICT`. Cancelled rows are excluded from the constraint.

## Database

| Table | Purpose |
| --- | --- |
| `clinics` | Name + authoritative timezone |
| `users` | Clinic-scoped accounts, globally unique email |
| `doctors` | Clinic staff; `is_active` for soft delete |
| `working_schedules` | Local `TIME` intervals per `day_of_week` (0 = Sunday) |
| `availability_exceptions` | `BREAK` / `LEAVE` / `UNAVAILABLE` as timestamptz ranges |
| `appointments` | Booked/cancelled/completed visits |

## API

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public (optional `role`, USER only) |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/admin/clinic` | ADMIN |
| PUT | `/api/admin/clinic/timezone` | ADMIN |
| POST/GET | `/api/admin/users` | ADMIN (create with `role`: USER or ADMIN) |
| GET/PUT | `/api/admin/users/:id` | ADMIN (role is editable) |
| POST/GET/PUT/DELETE | `/api/admin/doctors` | ADMIN (DELETE deactivates) |
| PUT | `/api/admin/doctors/:id/schedule` | ADMIN |
| POST/GET | `/api/admin/doctors/:id/exceptions` | ADMIN |
| DELETE | `/api/admin/exceptions/:id` | ADMIN |
| GET | `/api/doctors` | Authenticated (active only) |
| GET | `/api/doctors/:id` | Authenticated |
| GET | `/api/doctors/:id/availability?date=YYYY-MM-DD` | Authenticated |
| POST/GET | `/api/appointments` | Authenticated |
| GET | `/api/appointments/:id` | Owner or ADMIN |
| GET | `/health` | Public |
| GET | `/api-docs` | Public (Swagger UI) |
| GET | `/api-docs.json` | Public (OpenAPI spec) |

Interactive docs: open `http://localhost:5000/api-docs`, call **POST /api/auth/login**, copy `data.token`, click **Authorize**, and send `Bearer` token. Admin endpoints need the `admin@example.com` account.

Success responses: `{ "success": true, "data": {} }`. Errors: `{ "success": false, "message": "...", "code": "..." }` with optional `errors[]`. Booking conflicts use HTTP **409**.

Slot duration is 30 minutes (`SLOT_DURATION_MINUTES`). Clients send `startAt` only; the server derives `endAt`.

## Environment

Copy `.env.example` to `.env`. Important variables: `PORT`, `NODE_ENV`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SLOT_DURATION_MINUTES`.

## Run locally

Step-by-step install, Docker, Ubuntu Compose, Swagger, pgAdmin, tests, and troubleshooting: **[SETUP.md](SETUP.md)**.

Short path:

```bash
cp .env.example .env
docker compose up -d
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

API: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/api-docs`  
Health: `GET http://localhost:5000/health`

### Inspect the database (pgAdmin)

1. Open `http://localhost:5050`
2. Log in with `admin@example.com` / `admin` (from `.env`)
3. The **Doctor Booking Local** server is pre-registered. Host inside pgAdmin is `postgres`, not `localhost`.
4. After migrate + seed, expand `doctor_booking` → Schemas → public → Tables

Host tools (DBeaver, `psql`) use `localhost:5432`, database `doctor_booking`, user/password `postgres`/`postgres`.

Seed logins (development only):

- Admin: `admin@example.com` / `Password123`
- User: `user@example.com` / `Password123`

## Tests

Tests use `doctor_booking_test` (created automatically if missing). Postgres must be running.

```bash
npm run test:unit
npm test                 # unit + integration (needs Postgres)
```

Unit tests for slot generation, DST, and `/health` (`npm run test:unit`) do not need Postgres. Integration tests (`npm run test:integration`) do.

This environment may not have Docker installed. Install Docker Engine, then `docker compose up -d`, migrate, and re-run `npm test`.

Coverage includes auth, role checks, Kolkata/New York slots, DST conversion, booking, and concurrent double-booking.

## Known limitations

- No appointment cancel/complete HTTP APIs (statuses exist for future use and the exclusion `WHERE` clause)
- No notifications or Redis cache
- Users always register into the first seeded clinic
- JWT `role` is set at login; after an admin changes a user’s role, that user must log in again
- Email is globally unique, not per-clinic
- Slot length is globally configured, not per doctor

## Future scaling

Cache clinic/doctor reads in Redis only as a cache. **Never** treat cached availability as the booking authority. Extract scheduling and appointments first if an independent scale or deploy boundary appears. Notifications should run after commit via a queue, not inside the booking transaction.
