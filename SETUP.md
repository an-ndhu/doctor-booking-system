# Setup Guide

This guide walks you through running the Doctor Booking System locally from a clean checkout.

Follow the steps in order. By the end, you will have PostgreSQL, pgAdmin, the API, Swagger, seed data, and the test suite running locally.

## Services

| Service | URL / address |
|---|---|
| API | http://localhost:5000 |
| Health check | http://localhost:5000/health |
| Swagger UI | http://localhost:5000/api-docs |
| OpenAPI JSON | http://localhost:5000/api-docs.json |
| PostgreSQL | `localhost:5432`, database `doctor_booking` |
| pgAdmin | http://localhost:5050 |

## Prerequisites

Please make sure you have:

- **Node.js 18+**. Node.js 20 or 22 is recommended.
- **npm**
- **Docker Engine** with the Docker Compose plugin (`docker compose`)
- Ports **5000**, **5432**, and **5050** available.

Check Node.js with:

```bash
node -v
```

### Ubuntu / Linux Mint

If you installed Docker through the `docker.io` package, install Compose separately:

```bash
sudo apt install docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Log out and back in, or reboot, so the Docker group change takes effect.

If `docker compose up -d` reports:

```text
unknown shorthand flag: 'd' in -d
```

install the Compose plugin:

```bash
sudo apt install docker-compose-v2
```

If your system uses the older Compose command, you can use:

```bash
sudo apt install docker-compose
sudo docker-compose up -d
```

---

# 1. Get the Project

Move into the repository root:

```bash
cd doctor-booking-system
```

If you cloned the repository, you should be in the directory containing:

```text
package.json
docker-compose.yml
.env.example
```

---

# 2. Create the Environment File

Create your local environment configuration:

```bash
cp .env.example .env
```

The defaults are ready for the included Docker PostgreSQL setup.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | API port |
| `NODE_ENV` | `development` | Application environment |
| `DB_HOST` | `localhost` | PostgreSQL host used by the API |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `doctor_booking` | Application database |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | `change-me` | Secret used to sign access tokens |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `SLOT_DURATION_MINUTES` | `30` | Appointment duration |
| `PGADMIN_DEFAULT_EMAIL` | `admin@example.com` | pgAdmin login |
| `PGADMIN_DEFAULT_PASSWORD` | `admin` | pgAdmin login |

`.env` is gitignored. Please do not commit secrets or local credentials.

---

# 3. Start PostgreSQL and pgAdmin

From the project root:

```bash
docker compose up -d
docker compose ps
```

Please wait until `doctor-booking-postgres` is **healthy** before continuing.

The first startup may take a few minutes while Docker downloads the required images.

The Compose setup also creates the test database:

```text
doctor_booking_test
```

This is used by the integration tests.

The test database is created by:

```text
docker/postgres/init-test-db.sql
```

That script runs only when PostgreSQL starts with an empty volume.

If you need a completely fresh local database:

```bash
docker compose down -v
docker compose up -d
```

> **Warning:** `-v` removes the Docker volumes and deletes the existing local database data.

---

# 4. Install Dependencies

Run:

```bash
npm install
```

---

# 5. Run Migrations and Seed Data

Apply the database migrations:

```bash
npx sequelize-cli db:migrate
```

Then load the development seed data:

```bash
npx sequelize-cli db:seed:all
```

You can also use:

```bash
npm run db:migrate
npm run db:seed
```

To completely reset the database:

```bash
npm run db:reset
```

## Development Accounts

After a fresh seed/reset:

| ID | Name | Email | Role | Password |
|---|---|---|---|---|
| 1 | Clinic Admin | `admin@example.com` | ADMIN | `Password123` |
| 2 | Jane Patient | `user@example.com` | USER | `Password123` |

The seed data includes:

- **Clinic:** Kochi Medical Centre
- **Timezone:** `Asia/Kolkata`
- **Doctor:** Dr. John, Cardiology
- **Doctor:** Dr. Sarah, Dermatology
- **Weekday hours:** `09:00–13:00` and `14:00–17:00`

The doctor email addresses are contact fields only. They are not login accounts.

---

# 6. Start the API

For development:

```bash
npm run dev
```

You should see:

```text
Doctor booking API listening on port 5000
```

Verify the API:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "message": "API is healthy"
}
```

You can also open:

http://localhost:5000/health

---

# 7. Test the API with Swagger

Open:

http://localhost:5000/api-docs

Swagger provides the easiest way to review and exercise the API.

## Recommended review flow

### 7.1 Log in as Admin

Call:

```http
POST /api/auth/login
```

Use:

```json
{
  "email": "admin@example.com",
  "password": "Password123"
}
```

Copy `data.token`.

Click **Authorize** in Swagger and paste the token. Swagger will send it as:

```text
Bearer <token>
```

Use the admin token to inspect or manage:

- Clinic timezone
- Doctors
- Doctor schedules
- Availability configuration
- Users and roles

### 7.2 Log in as User

Log in again with:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Authorize Swagger with the user token.

### 7.3 Check doctor availability

Call:

```http
GET /api/doctors
```

Then:

```http
GET /api/doctors/{id}/availability?date=YYYY-MM-DD
```

Use a future weekday covered by the seeded schedule.

### 7.4 Book an appointment

Choose a `startAt` returned by the availability endpoint and call:

```http
POST /api/appointments
```

For example:

```json
{
  "doctorId": 1,
  "startAt": "2026-09-25T04:30:00.000Z"
}
```

### 7.5 Verify the slot is removed

Call the availability endpoint again.

The booked slot should no longer be available.

### 7.6 Verify double-booking protection

Try to book the same slot again.

The API should return:

```text
409 Conflict
```

with the conflict code:

```text
APPOINTMENT_CONFLICT
```

This demonstrates the transaction and database-level protection against concurrent double booking.

## Role behaviour

Public registration always creates a `USER`.

Admins manage roles through:

```http
POST /api/admin/users
PUT /api/admin/users/{id}
```

After changing a user's role, have that user log in again so the newly issued JWT contains the updated role.

The system also prevents the last admin in a clinic from being demoted.

---

# 8. Inspect the Database with pgAdmin

Open:

http://localhost:5050

Use:

```text
Email:    admin@example.com
Password: admin
```

These credentials are for **pgAdmin**, not the API.

When connecting to PostgreSQL from pgAdmin, use:

```text
Host:     postgres
Port:     5432
Database: doctor_booking
Username: postgres
Password: postgres
```

> **Important:** Inside pgAdmin, use `postgres` as the host. Do not use `localhost`. pgAdmin is running inside its own Docker container, so `localhost` refers to that container.

You can then inspect:

```text
doctor_booking
└── Schemas
    └── public
        └── Tables
```

## Connect from your host machine

For DBeaver, TablePlus, `psql`, or another database client, use:

```text
Host:     localhost
Port:     5432
Database: doctor_booking
User:     postgres
Password: postgres
```

Or connect directly through Docker:

```bash
docker exec -it doctor-booking-postgres psql -U postgres -d doctor_booking
```

---

# 9. Run the Tests

Make sure PostgreSQL is running before running integration tests.

The integration suite uses:

```text
doctor_booking_test
```

### Unit tests

```bash
npm run test:unit
```

These cover areas such as:

- Slot generation
- Timezone/DST behaviour
- Health endpoint
- Swagger specification

### Integration tests

```bash
npm run test:integration
```

These cover database-backed behaviour such as:

- Authentication
- Appointment booking
- Concurrency/double-booking protection

### Full test suite

```bash
npm test
```

### TypeScript check

```bash
npm run typecheck
```

---

# 10. Production-Style Run

To test the compiled application:

```bash
npm run build
NODE_ENV=production npm start
```

Make sure `JWT_SECRET` and the `DB_*` variables are configured in `.env`.

The compiled application runs from:

```text
dist/server.js
```

---

# 11. Useful Commands

| Command | Purpose |
|---|---|
| `docker compose up -d` | Start PostgreSQL and pgAdmin |
| `docker compose ps` | Check container status |
| `docker compose logs -f postgres` | Follow PostgreSQL logs |
| `docker compose down` | Stop containers and keep data |
| `docker compose down -v` | Stop containers and delete volumes |
| `npm install` | Install dependencies |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Insert development data |
| `npm run db:reset` | Reset, migrate, and seed the database |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application |
| `npm start` | Start the compiled application |
| `npm test` | Run all tests |
| `npm run typecheck` | Run TypeScript checks |

---

# Troubleshooting

## `connect ECONNREFUSED 127.0.0.1:5432`

Start the Docker services:

```bash
docker compose up -d
docker compose ps
```

Wait for PostgreSQL to become healthy.

Then confirm:

```env
DB_HOST=localhost
DB_PORT=5432
```

## `unknown shorthand flag: 'd' in -d`

Install Docker Compose v2:

```bash
sudo apt install docker-compose-v2
```

Then retry:

```bash
docker compose up -d
```

## Docker permission denied

Add your user to the Docker group:

```bash
sudo usermod -aG docker $USER
```

Log out and back in.

Alternatively, use:

```bash
sudo docker compose ...
```

## Sequelize CLI TypeScript error

If you see:

```text
export assignment is not supported in strip-only mode
```

make sure you are using the latest project files. The repository's Sequelize CLI configuration and migrations use the CommonJS format required for the supported Node.js setup.

Then retry:

```bash
npx sequelize-cli db:migrate
```

## `relation "clinics" does not exist`

The migrations have not been applied, or the application is connected to a different database.

Run:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

Make sure you are using the `doctor_booking` database.

## Seed fails with duplicate email / duplicate key

The seed data may already exist.

Either skip the seed or reset the database:

```bash
npm run db:reset
```

> **Warning:** This removes the existing schema and data.

## Port `5432` is already in use

Another PostgreSQL instance may already be using port `5432`.

Stop that instance, or change the port in both:

```text
.env
docker-compose.yml
```

Make sure the API and Docker configuration use the same port.

## pgAdmin cannot connect

Inside pgAdmin, use:

```text
Host:     postgres
Port:     5432
User:     postgres
Password: postgres
```

Do not use `localhost` from inside the pgAdmin container.

## Swagger returns `401 Unauthorized`

Make sure you:

1. Logged in successfully.
2. Copied `data.token`.
3. Clicked **Authorize**.
4. Added the correct token.
5. Used an admin token for `/api/admin/*` endpoints.

The default JWT lifetime is one day:

```env
JWT_EXPIRES_IN=1d
```

---

# Final Verification

Before reviewing the implementation, please verify the following:

- [ ] Node.js 18+ is installed
- [ ] Docker and Docker Compose are available
- [ ] `.env` was created from `.env.example`
- [ ] PostgreSQL is healthy
- [ ] pgAdmin is running
- [ ] `npm install` completed successfully
- [ ] Migrations completed successfully
- [ ] Seed data was loaded
- [ ] `npm run dev` starts the API
- [ ] `/health` returns success
- [ ] Swagger opens at `/api-docs`
- [ ] Admin login works
- [ ] User login works
- [ ] Doctor availability can be retrieved
- [ ] An appointment can be booked
- [ ] A booked slot disappears from availability
- [ ] Booking the same slot again returns `409 Conflict`
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] TypeScript checks pass

## Quick Start

If Node.js, Docker, and Docker Compose are already installed, run:

```bash
cd doctor-booking-system

cp .env.example .env

docker compose up -d

npm install

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

npm run dev
```

Then open:

- **Swagger:** http://localhost:5000/api-docs
- **Health:** http://localhost:5000/health
- **pgAdmin:** http://localhost:5050

For the demo accounts:

```text
Admin
Email:    admin@example.com
Password: Password123
```

```text
User
Email:    user@example.com
Password: Password123
```

Follow the Swagger review flow above to verify authentication, role-based access, scheduling, timezone handling, appointment booking, and double-booking protection.