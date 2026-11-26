# eon

Full-stack multi-tenant e-commerce platform for **Eon Technology** featuring a React + TypeScript + Vite storefront & admin dashboard, an Express reverse-proxy server, and a Django + Django REST Framework backend with catalog import pipelines.

## Repository Structure

```text
.
├── algoflowdocke/          # Main full-stack application (Frontend + Express + Django Backend)
│   ├── src/                # React + TypeScript frontend (storefront, admin, auth, API clients)
│   ├── server.ts           # Express server (serves SPA, static/media, proxies /api & /django-admin)
│   ├── backend/            # Django 5.2 + DRF backend (account, company, efrontend, eadmin, chatapp, videos)
│   ├── nginx/              # Nginx reverse-proxy configuration
│   ├── Dockerfile          # Multi-stage Node + Python production container
│   └── docker-compose.yml  # Nginx + App + PostgreSQL + Redis stack
├── antesports_josne/       # Ant Esports product catalog JSON files
├── bestor_josne/           # Bestor product catalog JSON files
├── correct_josne/          # Curated product catalog JSON files
├── correct_josne copy/     # Extended curated product catalog JSON files
├── cpplus_josne/           # CP Plus product catalog JSON files
└── intex_josne/            # Intex product catalog JSON files
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query, React Router, Three.js / R3F
- **Server / Proxy:** Node.js, Express (`server.ts`)
- **Backend:** Python 3.12, Django 5.2, Django REST Framework, SimpleJWT, Jazzmin, Gunicorn
- **Async & Cache:** Celery, Redis
- **Database:** PostgreSQL (production via Docker) / SQLite (local development)
- **AI & Media:** Google Gemini AI (`@google/genai`, `google-genai`), OpenCV, FFmpeg
- **Infrastructure:** Docker, Docker Compose, Nginx

## Getting Started

### Prerequisites

- Node.js 18+ (or 22+)
- Python 3.11+ / 3.12+
- Docker & Docker Compose (optional, for containerized Postgres/Redis/Nginx deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/prabinKh/eon.git
cd eon/algoflowdocke
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your local secrets:

```bash
cp backend/.env.example .env
```

Key variables:
- `DJANGO_SECRET_KEY` / `SIMPLE_JWT_SECRET_KEY`
- `POSTGRES_PASSWORD` / `DATABASE_URL` (falls back to SQLite in local dev when unset)
- `DJANGO_ALLOWED_HOSTS` (e.g. `localhost,127.0.0.1,.localhost`)
- `FRONTEND_URL` (e.g. `http://localhost:3000`)
- `GEMINI_API_KEY` (optional, for AI chat features)

### 3. Local Development

Install frontend and backend dependencies:

```bash
npm install

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
cd ..
```

Start the combined Express + Vite + Django server:

```bash
npm run dev
```

Or build and run in production mode:

```bash
npm run build:prod
npm run start
```

### 4. Docker Compose

```bash
cd algoflowdocke
docker compose up -d --build
docker compose exec app bash -c "cd backend && python3 manage.py migrate"
```

## Catalog Import Scripts

Brand JSON datasets in the repository root (`antesports_josne/`, `bestor_josne/`, `cpplus_josne/`, `intex_josne/`, `correct_josne/`, `correct_josne copy/`) are consumed by helper scripts in `algoflowdocke/backend/`, such as:
- `import_all_new_brands.py`
- `import_correct_json.py`
- `import_copy_json.py`
- `fast_import_all.py`
- `seed_eon_technology.py`

## Scripts & Testing

Run inside `algoflowdocke/`:

- `npm run lint` — Run ESLint
- `npm run test` — Run Vitest unit tests
- `npm run build` — Run tests, Vite build, and bundle `server.ts`
- `npx playwright test` — Run Playwright end-to-end tests
