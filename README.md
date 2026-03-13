# Field Service Tracker

A field service management tool for tracking jobs, technicians, and client work orders.

**Status:** In progress — backend scaffolding phase

---

## Stack

- **Backend:** FastAPI · Python 3.12 · SQLAlchemy async · uv
- **Frontend:** React 18 · Vite · Tailwind CSS · Radix UI
- **Infra:** Docker Compose · PostgreSQL 16

---

## Getting Started

```bash
git clone <repo-url>
cd field-service-tracker
cp .env.example .env
docker compose up --build
```

The API will be available at `http://localhost:8000` and the frontend at `http://localhost:5173`.
