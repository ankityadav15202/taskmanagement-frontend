# Task Management Platform — Frontend

React-based frontend for the Task Management Platform, built with Vite, Tailwind CSS, React Query, and Zustand.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool + dev server |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| TanStack React Query | Server state, caching, data fetching |
| Zustand | Client state (auth) with persistence |
| React Hook Form | Form management + validation |
| Axios | HTTP client with interceptors |
| Recharts | Dashboard charts |
| React Hot Toast | Notifications |
| date-fns | Date formatting |

---

## Project Structure

```
src/
├── components/
│   ├── common/         # Reusable UI: Avatar, Badge, Modal, Spinner, EmptyState, ConfirmDialog
│   ├── layout/         # AppLayout, Sidebar, ProtectedRoute
│   ├── tasks/          # TaskCard, TaskForm, TaskFilters
│   └── comments/       # CommentsSection
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Tasks.jsx
│   ├── TaskDetail.jsx
│   ├── Users.jsx       # Admin only
│   └── NotFound.jsx
├── services/
│   ├── api.js          # Axios instance with JWT interceptor
│   └── taskService.js  # All API call functions
├── store/
│   └── authStore.js    # Zustand auth store (persisted)
├── utils/
│   └── helpers.js      # Date formatting, status/priority configs
└── styles/
    └── index.css       # Tailwind + global component classes
```

---

## Setup & Run

```bash
# Install dependencies
npm install

# Start dev server (proxies /api to localhost:5000)
npm run dev

# Build for production
npm run build
```

Make sure the backend is running on port 5000 before starting the frontend.

---

## Features

### Auth
- Login / Register forms with validation
- JWT stored in Zustand (persisted to localStorage)
- Auto-redirect on 401 (token expired)

### Dashboard
- Summary stat cards (total, completion %, in-progress, overdue)
- Bar chart — tasks by status
- Donut chart — tasks by priority
- My assigned tasks list

### Tasks
- Grid view with search, filter (status, priority, assignee), sort (due date, priority)
- Pagination (12 per page)
- Create / Edit tasks in modal
- Soft delete with confirmation dialog
- Overdue task highlighting

### Task Detail
- Full task view with all metadata
- Edit + Delete directly from detail page
- Comments: add, edit own, delete own (admins can delete any)

### Users (Admin only)
- Table view of all workspace members
- Role and status badges

---

## Architecture Decisions

### React Query for server state
All API data is managed by React Query — handles caching, background refetching, loading/error states, and cache invalidation automatically. No manual `useEffect` for data fetching.

### Zustand for client state
Only auth state needs to be global and persisted across page refreshes. Zustand with the `persist` middleware handles this with minimal boilerplate.

### Lazy loading
All pages are lazy-loaded with `React.lazy()` and wrapped in `<Suspense>` — reduces initial bundle size.

### Component-level architecture
- **Common** components are fully generic and reusable
- **Feature** components (tasks/, comments/) are domain-specific
- **Pages** orchestrate data fetching and compose feature components

### API proxy
Vite's dev server proxies `/api` requests to `http://localhost:5000`, so no CORS issues in development.
