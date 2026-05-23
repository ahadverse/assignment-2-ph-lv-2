# DevPulse API

A REST API for tracking bugs and feature requests inside a dev team. Built with Node.js, TypeScript, Express, and PostgreSQL (no ORM — raw SQL only).

**Live:** https://devpulse-api-assignment.vercel.app

---

## Used AI For

- generate postman collection.
- create landing of base route.
- create seed file to test it.

---

## Stack

- Node.js 24, TypeScript, Express
- PostgreSQL on NeonDB
- JWT auth + bcrypt

## Setup

```bash
git clone https://github.com/yourusername/devpulse
cd devpulse
npm install
cp .env.example .env
# fill in DATABASE_URL and JWT_SECRET
npm run dev
```

Then run the SQL in `src/schema/schema.sql` to create the tables.

## Env Variables

```
DATABASE_URL=
JWT_SECRET=
PORT=5000
NODE_ENV=development
```

## Endpoints

**Auth**

| Method | Route              | Access |
| ------ | ------------------ | ------ |
| POST   | `/api/auth/signup` | Public |
| POST   | `/api/auth/login`  | Public |

**Issues**

| Method | Route             | Access          |
| ------ | ----------------- | --------------- |
| GET    | `/api/issues`     | Public          |
| GET    | `/api/issues/:id` | Public          |
| POST   | `/api/issues`     | Authenticated   |
| PATCH  | `/api/issues/:id` | Authenticated   |
| DELETE | `/api/issues/:id` | Maintainer only |

Query params on `GET /api/issues`: `sort` (newest/oldest), `type` (bug/feature_request), `status` (open/in_progress/resolved)

Auth header format: `Authorization: <token>` (no Bearer prefix)
