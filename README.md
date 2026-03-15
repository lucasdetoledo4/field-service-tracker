# Field Service Tracker

A field service management tool for tracking jobs, technicians, and client work orders.

**Status:** In progress — backend hardening phase

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

---

## API

Base path: `/api/v1`

### Clients
| Method | Path | Description |
|--------|------|-------------|
| GET | `/clients` | List clients (search, sort, paginate) |
| POST | `/clients` | Create client |
| GET | `/clients/{id}` | Get client |
| PATCH | `/clients/{id}` | Update client |
| DELETE | `/clients/{id}` | Delete client |

### Technicians
| Method | Path | Description |
|--------|------|-------------|
| GET | `/technicians` | List technicians (search, filter by active, sort, paginate) |
| POST | `/technicians` | Create technician |
| GET | `/technicians/{id}` | Get technician |
| PATCH | `/technicians/{id}` | Update technician |
| DELETE | `/technicians/{id}` | Delete technician |

### Work Orders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/work-orders` | List work orders (search, filter by status/priority/client/technician, sort, paginate) |
| POST | `/work-orders` | Create work order |
| GET | `/work-orders/{id}` | Get work order |
| PATCH | `/work-orders/{id}` | Update work order |
| DELETE | `/work-orders/{id}` | Delete work order |
| POST | `/work-orders/{id}/transition` | Transition status |
| GET | `/work-orders/{id}/history` | Get status history |

### Common query params (list endpoints)
| Param | Values | Default |
|-------|--------|---------|
| `page` | integer | `1` |
| `page_size` | integer | `20` |
| `sort_by` | resource-specific (e.g. `name`, `created_at`) | `created_at` |
| `sort_dir` | `asc`, `desc` | `desc` |

---

## Development

```bash
# Run backend tests
docker compose exec backend uv run pytest

# Run migrations
docker compose exec backend uv run alembic upgrade head

# Seed data
docker compose exec backend python -m app.seed

# Frontend dev (from frontend/)
npm install && npm run dev
```
