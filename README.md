# Distributed Collaboration Hub

A small yet complete micro-services playground written in **Python / FastAPI** with a **React + Vite** front-end.  The project demonstrates JWT-secured routing, role-based access control, and async data-flows—all containerised with Docker Compose.

## Why this exists
I wanted a compact reference implementation that shows how individual FastAPI services can live behind an edge proxy while still feeling like a single coherent product.

## Architecture
```
┌────────────┐        ┌──────────┐      ┌─────────────┐
│  frontend  │─►HTTP─►│  edge    │─►───►│  accounts   │
│ (React)    │        │  proxy   │      │  service    │
└────────────┘        │  (JWT)   │      └─────────────┘
                      │          │
                      │          │      ┌─────────────┐
                      └──────────┴─►───►│ purchases   │
                                         │  service    │
                                         └─────────────┘
```
* **edge** – asynchronous FastAPI app that issues & validates JWTs and proxies requests to the internal network.
* **accounts** – user CRUD + login endpoints (PostgreSQL via Tortoise-ORM).
* **purchases** – order CRUD tied to the authenticated user (also PostgreSQL).
* **frontend** – Vite + React UI with React-Query, TailwindCSS, and toast notifications.

## Tech stack
* Python 3.11, FastAPI, aiohttp
* React 18, Vite, TypeScript, TailwindCSS
* PostgreSQL (via Docker) + asyncpg + Tortoise-ORM
* JWT (HS256) for auth, role-checks in the edge proxy
* GitHub Actions CI – lint, type-check, build & publish Docker images to GHCR

## Quick start
```bash
# clone & run
git clone https://github.com/yagnik-10/Distributed-Collaboration-Hub.git
cd Distributed-Collaboration-Hub
cp edge/.env.example edge/.env  # tweak secrets if you wish

docker compose up --build
```
Visit:
* Edge docs – http://localhost:8001/docs
* Front-end – http://localhost:5173

Default admin credentials are seeded by `accounts/seed_admin.py`:
```
username: admin
password: a
```

## Development tips
* Front-end hot-reloads; just edit files in `frontend/src/*`.
* Backend services auto-reload via `uvicorn --reload` inside their containers.
* Adjust token TTL or secret by editing `edge/settings.py` (env-driven).

## License
MIT © 2025 Yagnik Pavagadhi
