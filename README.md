# Turbo AI Notes Taking App Challenge

## 1. Overview

A notes-taking web application where users sign up, log in, and manage notes organized by categories. The app is fully authenticated: unauthenticated users are redirected to login; authenticated users see a dashboard with a category sidebar and a grid of note cards. Notes can be created, edited with debounced autosave, and filtered by category. Design follows Figma references; the UI is not pixel-perfect due to time constraints (see Limitations).

**Main features:**
- Auth: signup, login, logout; JWT via httpOnly cookies; refresh on 401
- Categories: per-user default categories with color and note count; sidebar filtering
- Notes: CRUD; note editor with category dropdown, title, content; debounced autosave (500ms)
- Dashboard: empty state, note cards with category-colored backgrounds, “New Note” flow
- Protected routes: root `/` guarded; `/login` and `/signup` redirect to `/` when already authenticated

## 2. Tech Stack

| Layer | Choices |
|-------|--------|
| Backend | Django 5.x, Django REST Framework, PostgreSQL (Docker), SimpleJWT |
| Auth | JWT access + refresh tokens in httpOnly cookies; backend-only session |
| Frontend | Next.js 15 (App Router), React 19, TailwindCSS |
| Backend tests | pytest, pytest-django, pytest-cov (80% minimum; project ~96%) |
| Frontend tests | Jest 30, React Testing Library, jsdom (no Playwright/Cypress) |
| Backend run | Docker Compose (backend + Postgres) |
| Frontend run | Local `npm run dev` (no Docker) |

## 3. Setup Instructions

### Backend (Docker)

1. From repo root:
   ```bash
   cp backend/.env.example backend/.env
   docker compose up --build
   ```
2. Backend: http://localhost:8000  
   DB: Postgres 16 on port 5432 (credentials in `backend/.env`).

**Backend env (see `backend/.env.example`):**  
`DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`. Optional: `SECURE_COOKIE` for production HTTPS.

### Frontend (local)

1. From repo root:
   ```bash
   cd frontend && npm install && npm run dev
   ```
2. App: http://localhost:3000

**Frontend env (see `frontend/.env.example`):**  
`NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

### Test commands

- **Backend:** `cd backend && pytest`  
  Coverage (enforced): `pytest` (uses `pytest.ini`: `--cov-fail-under=80`).
- **Frontend:** `cd frontend && npm test`  
  Watch: `npm run test:watch`.

## 4. Architecture & Key Design Decisions

### A) JWT via httpOnly cookies (not localStorage)

Tokens are stored in httpOnly cookies set by the backend. The frontend never reads or writes tokens; every request uses `credentials: "include"` so the browser sends cookies automatically.

**Reasoning:** Reduces XSS impact: a script cannot steal an httpOnly token. With localStorage, any XSS could exfiltrate the token. Tradeoff: cookies require correct CORS (`Access-Control-Allow-Credentials`, same-site) and backend cookie settings; I accepted that for security. Backend owns auth fully; no split between a third-party auth layer and my API.

### B) Why not NextAuth

NextAuth would introduce a second session layer (NextAuth session + my API’s JWT). my backend already issues and validates JWTs and sets cookies. Adding NextAuth would mean either proxying through Next.js API routes to the backend or maintaining two auth models. I chose a single source of truth: the Django backend. Auth check is “call a protected endpoint with credentials; 401/403 means unauthenticated.” No extra complexity or dependency.

### C) CSR instead of hybrid/SSR

The app is fully behind login; there is no public, indexable content. SEO is irrelevant. All main UI (dashboard, editor, auth pages) is client-rendered with minimal server logic. I considered hybrid (e.g. SSR for landing) but rejected it: no product requirement for it, and it would add server components, streaming, and caching without benefit. Keeping everything client-side simplified data flow and debugging.

### D) Per-user categories (not global)

Categories are per-user (FK to User). Each user gets default categories on signup (e.g. Random Thoughts, School, Personal) and only sees their own. Alternatives considered: global shared categories, or shared with per-user overrides. I chose per-user for clear authorization (no cross-user coupling), simpler queries and permissions, and flexibility to add user-created categories later without a migration of a shared table. I accepted a bit of duplication (default names/colors per user) over premature sharing.

### E) Docker only for backend (not frontend)

Backend and Postgres run in Docker for reproducibility and to match production-like DB and env. Frontend runs locally with `npm run dev` for fast iteration (HMR, devtools, no image rebuild). Running the frontend in Docker was considered but skipped: no requirement for it in the challenge, and local dev is simpler. Backend Docker still gives a single command to bring up API + DB.

### F) Autosave strategy

Editor changes (title, content, category) update local state immediately and schedule a single debounced (500ms) PATCH. Only changed fields are sent. After PATCH, I use the response’s `updated_at` when present so “Last edited” stays correct. I do not send a request per keystroke; I avoid overlapping PATCHes by clearing the debounce timer on each change and only firing after 500ms of inactivity. Tradeoff: up to 500ms delay before persistence; I prioritized not spamming the API and keeping UX responsive.

### G) Refresh token strategy

Access token lifetime is short (e.g. 5 minutes); refresh token is longer (e.g. 7 days). On any 401 from the API (except from the refresh endpoint itself), the client calls `POST /api/auth/refresh/` with credentials; the backend reads the refresh cookie and sets a new access cookie. The client then retries the original request once with `skipRefresh` so I do not retry-refresh in a loop. I do not currently deduplicate concurrent refresh calls (multiple tabs could each trigger refresh); that was deemed acceptable for scope. Infinite loops are prevented by not retrying on refresh path and by retrying only once per failed request.

### H) API design philosophy

- Use 400 with validation payloads for bad input; avoid 500 for client mistakes.
- Protected resources return 404 when the resource does not exist or does not belong to the user (no leaking “exists but forbidden”).
- REST-style endpoints: `GET/POST /api/notes/`, `GET/PATCH/DELETE /api/notes/<id>/`, `GET /api/categories/`, `POST /api/auth/login|signup|logout|refresh/`.
- No versioning or hypermedia in scope; keep responses JSON and flat.

## 5. Testing & Coverage

**Backend:** pytest with pytest-cov. Coverage is enforced at 80% minimum (`--cov-fail-under=80` in `pytest.ini`); the codebase is around 96%. Covered areas: auth (login, signup, logout, refresh, cookie handling), category list and notes_count, notes CRUD, filtering by category, permissions (authenticated vs unauthenticated, cross-user isolation).

**Frontend:** Jest with React Testing Library. No E2E; focus on critical logic only:
- AuthGuard: redirect to `/login` on 401 from auth check; render children on success.
- Login form: validation prevents submit with empty email or empty password; no `api.post` in those cases.
- Note editor: debounced autosave (fake timers); multiple rapid content changes result in a single PATCH with the latest content after the debounce.

All tests mock the API; no backend required for frontend tests.

## 6. AI Tooling Usage

Cursor/AI was used for initial scaffolding, test file structure, and repetitive boilerplate (e.g. Jest config, component outlines). Manual work included: refresh-on-401 and retry logic in the API client, custom hooks (`useAuthPage`), extraction of shared components (e.g. AuthForm, NoteCard, CategoryButton, EditNoteCard) and the AuthGuard/editor behavior. Styling and layout adjustments to align with Figma were done manually. Generated code was reviewed and edited rather than accepted blindly; tradeoffs (e.g. no refresh deduplication, CSR-only) were deliberate.

## 7. Limitations / Tradeoffs

- **UI fidelity:** The UI is based on Figma screenshots but is not pixel-perfect; spacing, typography, and some details were approximated under time constraints.
- **Category management:** Only default per-user categories exist; no CRUD for categories (create/rename/delete) in scope.
- **Frontend Docker:** Not required; frontend is run locally.
- **Scope:** Correctness, auth, and core flows were prioritized over extra features (e.g. note deletion from UI, rich text, offline).

## 8. Conclusion

This project implements a minimal but complete notes app with Django/DRF and Next.js App Router, JWT auth via httpOnly cookies, per-user categories, and debounced autosave. Architectural choices (no NextAuth, CSR-only, backend-owned auth, per-user categories, Docker for backend only) were made to keep the system simple and maintainable while meeting security and UX goals. Test coverage is enforced on the backend and focused on critical paths on the frontend.
