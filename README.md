# Finance dashboard (Zorvyn)

Full-stack demo for a finance dashboard: **Express + MongoDB (Mongoose)** backend and **React (Vite)** frontend. It implements role-based access, financial record CRUD, aggregated dashboard APIs, JWT auth, and validation.

## Roles

| Role     | Dashboard summaries | List records | Create / update / delete records | Manage users (role & status) |
|----------|---------------------|-------------|----------------------------------|------------------------------|
| viewer   | yes (org-wide)      | yes (read-only, shared ledger) | no    | no                           |
| analyst  | yes (see below)     | yes (read-only, shared ledger) | no    | no                           |
| admin    | yes (see below)     | yes (shared ledger)            | yes   | yes                          |

**Shared ledger:** `GET /records` returns **all** active (`deletedAt: null`) transactions for every role. Rows include populated **`createdBy`** (name, email, role). Only **admins** may create, update, archive, or restore records (including rows created by another admin). **Viewers** and **analysts** are read-only on `/records`.

**Dashboard scope:** **Viewers** and **analysts** always see **organization-wide** totals and recent activity (aligned with the shared list). **Admins** default to **personal** chart totals but can use `?scope=all` or the UI toggle for org-wide charts.

New registrations default to **viewer**. Promote a user to **admin** or **analyst** in MongoDB or via **Users** (admin UI): `GET/PUT/PATCH /api/users/...`.

## Prerequisites

- Node.js 18+
- MongoDB connection string

## Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```bash
npm start
```

API base: `http://localhost:5000/api`

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The dev server proxies are not configured; the client calls `http://localhost:5000/api` (see `frontend/src/api/api.js`). Ensure the backend port matches.

## Main API surface

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login` — JWT in `Authorization: Bearer <token>`
- **Dashboard:** `GET /api/dashboard` — totals, categories, monthly/weekly trends, recent activity (with **createdBy** on recent rows). **Viewer & analyst:** always org-wide. **Admin (default):** personal metrics; `?scope=all` or UI toggle for org-wide charts. Response includes `dashboardScope` / `dashboardScopeNote`.
- **Records:** **GET** allowed for **viewer, analyst, admin** (shared ledger, all active rows, **`createdBy` populated**). **POST/PUT/DELETE/PATCH restore:** **admin only**; admin may change **any** active/archived row (not only their own).
- **Soft delete:** `DELETE /api/records/:id` sets `deletedAt` (row stays in MongoDB; lists and dashboard ignore it). **Restore:** `PATCH /api/records/:id/restore` clears `deletedAt`.
- **Rate limiting:** `POST /api/auth/login` and `POST /api/auth/register` are limited per IP (see `src/middleware/rateLimit.middleware.js`; optional env `RATE_LIMIT_LOGIN_MAX`, `RATE_LIMIT_REGISTER_MAX`). Response **429** when exceeded. Set `TRUST_PROXY=1` if the API sits behind a reverse proxy so the client IP is correct.
- **Activity log (read-only):** `GET /api/audit-logs?limit=50` — chronological list of **create / update / archive / restore** on records, with **actor** (name, email, role), **timestamp**, and **summary**. All roles (**viewer**, **analyst**, **admin**) may read; writes happen automatically when admins mutate records.
- **Profile (any logged-in user):** `GET /api/users/me`, `PATCH /api/users/me` — update `name` and/or password (`currentPassword` + `newPassword`)
- **Users (admin):** `GET /api/users`, `PUT /api/users/:id/role`, `PATCH /api/users/:id/status`

## Persistence

Data is stored in **MongoDB** via Mongoose models (`User`, `Record`). Records include `amount`, `type` (`income` | `expense`), `category`, `date`, `notes`, `createdBy`, and **`deletedAt`** (null = active, date = soft-deleted).

### How soft delete works

1. **Delete** no longer removes the document. It sets `deletedAt` on that row (admin may archive any active record).
2. **List & filters** (`GET /records`) only return rows where `deletedAt` is null (MongoDB treats missing `deletedAt` on old documents as inactive-deleted only if you migrated—new rows always have the field).
3. **Dashboard aggregates** use the same rule: every `$match` / `find` includes `deletedAt: null`, so totals and trends exclude archived rows.
4. **Update** is blocked for archived rows (`deletedAt` must be null). **Restore** (admin) sets `deletedAt` back to null.

### How rate limiting works

1. **`express-rate-limit`** middleware runs **before** the auth handlers on `login` and `register`.
2. Each limiter tracks requests by **client IP** (and uses standard `RateLimit-*` headers in the response).
3. Exceeding the limit returns **429** with a JSON `message` explaining the cooldown window.
4. Defaults: ~20 logins / 15 minutes / IP; ~15 registrations / hour / IP (override via env).

## Design choices & tradeoffs

- **Shared ledger:** One pool of active transactions; **everyone** sees the same `GET /records` results (with **who created** each row). **Mutations** remain **admin-only**, and admins can edit/delete **any** row so operational changes are visible to all readers.
- **Dashboard:** **Viewers** and **analysts** always see **org-wide** numbers and recent lines (aligned with the list). **Admins** can switch charts between personal and org.
- **Optional pagination:** Omit `page`/`limit` on `GET /records` to return the full list (suitable for demos; cap in production).

## What was fixed / added in this pass

- JWT verification aligned with token payload (`id`), and login loads password with `.select("+password")`.
- Dashboard controller imports the `Record` model and returns richer summaries (category income/expense, trends, recent activity).
- Joi validation wired for register and records; `joi` added to `package.json`.
- User routes split into `PUT .../role` and `PATCH .../status`; passwords never returned in list responses.
- Frontend: role-aware UI, admin user screen, aligned record fields (`notes` vs `title`), filters, and layout.

## Who gets admin / analyst?

- **First registration in an empty database** is assigned the **admin** role automatically (so you can open **Users** and set roles for everyone else).
- **Later registrations** default to **viewer**.
- **Analyst** (and other roles) are set by an **admin** on the **Users** page, or by editing the user document in MongoDB (`role: "analyst"` | `"admin"` | `"viewer"`).

### Already have users but need a fixed admin (e.g. Lakshya)

Add to **`backend/.env`** (see **`backend/.env.example`**):

```env
SEED_ADMIN_NAME=Lakshya
SEED_ADMIN_EMAIL=lakshya@gmail.com
SEED_ADMIN_PASSWORD=Lakshya@10
```

Restart the backend. On startup it will **create or update** that email as **admin** and set the password from `.env`. Then log in with that email and password.

If that email was already registered as **viewer**, it will be promoted to **admin** and the password will be updated to match `SEED_ADMIN_PASSWORD`.

**Security:** For a real deployment, remove these variables after onboarding so the password is not reapplied on every server restart.
