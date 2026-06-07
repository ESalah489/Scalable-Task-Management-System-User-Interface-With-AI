# Scalable Task Management System

A full-stack task management application built for a technical assessment. It provides REST APIs for CRUD operations on tasks, real-time status updates over WebSocket, and a React UI with pagination, filtering, and search.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Reference](#api-reference)
- [Real-Time Events](#real-time-events)
- [Architecture Decisions](#architecture-decisions)
- [Trade-offs](#trade-offs)
- [Production Improvements](#production-improvements)

---

## Overview

This system lets users:

- Create, read, update, and delete tasks
- Paginate through task lists
- Filter tasks by status (`pending`, `in-progress`, `completed`)
- Search tasks by title
- Receive live updates when another client changes a task status (via Socket.IO)

Each task includes:

| Field         | Type     | Notes                                      |
|---------------|----------|--------------------------------------------|
| `id`          | string   | Unique identifier                          |
| `title`       | string   | Required                                   |
| `description` | string   | Required                                   |
| `status`      | enum     | `pending` \| `in-progress` \| `completed` |
| `createdAt`   | ISO date | Auto-generated on create                   |

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite, Axios, Socket.IO Client, react-hot-toast |
| Backend  | Node.js, Express, Socket.IO *(expected on port 5000)* |
| Storage  | In-memory or SQLite *(per assessment scope)* |

---

## Project Structure

This repository contains the **React frontend**. The backend is a separate Node.js/Express service expected to run on `http://localhost:5000`.

```
task-management-system/
├── src/
│   ├── components/          # Presentational UI components
│   │   ├── TaskCard.jsx     # Single task display, edit, delete
│   │   ├── TaskForm.jsx     # Create task form
│   │   ├── TaskList.jsx     # Task list with loading state
│   │   ├── SearchBar.jsx    # Debounced title search
│   │   ├── StatusFilter.jsx # Status filter buttons
│   │   └── Pagination.jsx   # Page navigation
│   ├── hooks/
│   │   └── useWebSocket.js  # Socket.IO event subscription
│   ├── services/
│   │   ├── api.js           # REST API client (Axios)
│   │   └── socket.js        # Socket.IO singleton client
│   ├── App.jsx              # Root state and orchestration
│   ├── App.css
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
└── package.json
```

**Expected backend structure** (layered architecture):

```
backend/
├── src/
│   ├── routes/          # HTTP route definitions
│   ├── controllers/     # Request/response handling
│   ├── services/          # Business logic & data access
│   ├── middleware/        # Logging, rate limiting, error handling
│   ├── socket/            # Socket.IO event emitters
│   └── app.js             # Express app entry
├── .env
└── package.json
```

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and **npm**
- Two terminal sessions (one for backend, one for frontend)

### 1. Backend (Express API)

> The backend service should be started first. It must listen on **port 5000** and expose the REST endpoints and WebSocket events documented below.

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Start the server:

```bash
npm run dev
# Server should be available at http://localhost:5000
```

### 2. Frontend (React)

```bash
# From the project root
npm install
npm run dev
```

The UI runs at **http://localhost:5173** (default Vite port) and connects to the API at `http://localhost:5000`.

### 3. Verify the setup

1. Open `http://localhost:5173` in the browser.
2. Create a task using the sidebar form.
3. Open a second browser tab and change a task status — both tabs should update in real time.
4. Test pagination, status filters, and search.

### Available Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

---

## API Reference

Base URL: `http://localhost:5000/api`

All successful list responses use this shape:

```json
{
  "data": {
    "tasks": [ /* Task[] */ ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25
    }
  }
}
```

| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| POST   | `/tasks`                    | Create a task                  |
| GET    | `/tasks?page=1&limit=10`    | List all tasks (paginated)     |
| GET    | `/tasks/:id`                | Get a single task              |
| PUT    | `/tasks/:id`                | Update title, description, status |
| DELETE | `/tasks/:id`                | Delete a task                  |
| GET    | `/tasks/status/:status`     | Filter by status (paginated)   |
| GET    | `/tasks/search?q=keyword`   | Search by title (paginated)    |

**Create / update body example:**

```json
{
  "title": "Deploy staging",
  "description": "Roll out v1.2 to staging environment",
  "status": "in-progress"
}
```

---

## Real-Time Events

The frontend connects via Socket.IO to `http://localhost:5000`.

| Event           | Payload                                              | When emitted                          |
|-----------------|------------------------------------------------------|---------------------------------------|
| `task-update`   | `{ type, task, oldStatus? }`                         | Task created, updated, or status changed |
| `task-deleted`  | `{ taskId }`                                         | Task deleted                          |

The assessment requirement is that **status changes** propagate to all connected clients without a page refresh. The UI also listens for broader update and delete events to keep lists consistent.

---

## Architecture Decisions

### Backend — Layered architecture

The API follows **routes → controllers → services**:

- **Routes** define HTTP paths and attach middleware.
- **Controllers** parse requests, call services, and format responses.
- **Services** own business logic and storage access.

This keeps HTTP concerns separate from domain logic, making it straightforward to swap in-memory storage for a database later without touching route handlers.

### Backend — Cross-cutting middleware

- **Centralized error handling** — A single error middleware returns consistent JSON error responses.
- **Logging middleware** — Logs method, path, and response time for observability.
- **Rate limiting** — Protects the API from abuse; limits are configurable via `.env`.
- **Environment variables** — Port, rate-limit thresholds, and other config live outside code.

### Frontend — Service layer separation

All HTTP calls live in `src/services/api.js`. Components never call `fetch` or `axios` directly. This keeps UI components focused on rendering and makes API changes a single-file update.

### Frontend — Singleton WebSocket client

`src/services/socket.js` exports one shared Socket.IO instance. Multiple components or hooks reuse the same connection instead of opening duplicate sockets.

### Frontend — Custom hook for real-time logic

`useWebSocket` encapsulates event subscription and cleanup (`socket.on` / `socket.off` in `useEffect`). `App.jsx` passes callbacks to update local state when events arrive.

### Frontend — State management in `App.jsx`

Task list state, pagination, filters, and search are managed with React hooks in the root component. For this scope, lifting state avoids the overhead of Redux or Context while keeping data flow explicit and easy to follow.

### Frontend — Debounced search

`SearchBar` debounces input by 500 ms before triggering a search request, reducing unnecessary API calls while the user is still typing.

### Real-time strategy

On WebSocket events, the UI optimistically patches the visible task list, then refetches the current page to stay aligned with server-side pagination and filters. This favors correctness over minimal network traffic.

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| **In-memory / SQLite storage** | Fast to build, no infra setup | Data lost on restart; no multi-instance consistency |
| **Lifted state in `App.jsx`** | Simple, no extra libraries | Harder to scale UI state as features grow |
| **Hardcoded `localhost:5000` URLs** | Zero config for local dev | Requires code or env changes for staging/production |
| **Refetch after WebSocket events** | Pagination and filters stay accurate | Extra HTTP request per real-time event |
| **Mutually exclusive search & filter** | Clear UX — one query mode at a time | Cannot combine "pending" filter with a search term |
| **Minimal styling** | Focus on structure and logic | Not production-polished visually |
| **JavaScript over TypeScript** | Faster iteration for a timed assessment | Less compile-time safety |
| **Console logging on frontend** | Easy debugging during development | Not suitable for production observability |

---

## Production Improvements

If this were deployed at scale, these would be the priority changes:

### Data & persistence

- Replace in-memory storage with **PostgreSQL** or **DynamoDB**.
- Add database indexes on `status`, `title`, and `createdAt` for filter/search performance.
- Use migrations (e.g. Prisma, Knex) for schema versioning.

### Scalability & real-time

- Run multiple API instances behind a load balancer.
- Use a **Redis adapter for Socket.IO** so events broadcast across all server instances.
- Move rate-limit counters to **Redis** for distributed enforcement.
- Add a **CDN** for the static React build (S3 + CloudFront).

### Security & reliability

- Add **authentication** (JWT or session-based) and per-user task ownership.
- Validate and sanitize all inputs on the server (e.g. `express-validator`).
- Configure **CORS** explicitly for known origins.
- Terminate TLS at the load balancer; enforce HTTPS everywhere.
- Add request ID tracing across API and WebSocket layers.

### Frontend

- Externalize API and WebSocket URLs via `import.meta.env` (Vite env variables).
- Adopt **React Query (TanStack Query)** for caching, deduplication, and optimistic updates.
- Add **error boundaries** and user-facing error states beyond console logs.
- Migrate to **TypeScript** for safer refactors.
- Add unit tests (Vitest) and E2E tests (Playwright).

### Operations

- Containerize with **Docker**; orchestrate with ECS or Kubernetes.
- Structured logging (Winston/Pino) shipped to **CloudWatch** or Datadog.
- Health check endpoints (`/health`, `/ready`) for load balancer probes.
- CI/CD pipeline (GitHub Actions) for lint, test, build, and deploy.
- Feature flags and blue/green deployments for zero-downtime releases.
