# EventSphere — Event Management System

Industry-ready full-stack event platform: Django REST + React + JWT + Razorpay + QR tickets.

## Quick Start (Docker)
```bash
docker compose up --build
# Frontend: http://localhost:5173  Backend: http://localhost:8000/api/health/
```

## Local Dev
```bash
make install && make migrate
DEBUG=True ALLOWED_HOSTS=localhost,127.0.0.1 python backend/manage.py runserver
cd frontend && npm run dev
```

## Env
Copy `backend/.env.example` → `backend/.env` and set `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `VITE_API_URL`.

## Deploy
- Backend: Render (`render.yaml` — health `/api/health/`)
- Frontend: Vercel (`frontend/vercel.json`)

## Features
Auth (JWT), Events CRUD, Bookings, Payments (Razorpay), QR Tickets, Reviews, Notifications, Admin/Organizer dashboards.

## API Docs
See `docs/API_DOCUMENTATION.md`. Health: `GET /api/health/`
