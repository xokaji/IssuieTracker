# IssueFlow — Full-Stack Issue Tracker

A production grade issue tracker built with React + TypeScript, Express.js, and MongoDB.

---

## ✨ Features

### Core

- **CRUD Operations** — Create, read, update, delete issues
- **Rich Issue Fields** — Title, description, status, priority, severity, type, tags, assignee
- **Status Flow** — Open → In Progress → Resolved / Closed (with confirmation prompts)
- **Visual Indicators** — Color-coded badges for status, priority, severity, and type
- **Comments** — Threaded comments per issue with delete support
- **Dashboard** — Stats overview with status + priority breakdown charts

### Search & Filtering

- **Debounced Search** — Real-time search by title/description/tags (400ms debounce to minimize API calls)
- **Filters** — Filter by status, priority, type
- **Sorting** — Sort by newest, oldest, recently updated, priority
- **Pagination** — Page-based navigation with total count

### Auth

- **JWT Authentication** — Secure token-based auth stored in localStorage
- **Registration & Login** — Email + password with bcrypt hashing
- **Route Guards** — Protected routes redirect unauthenticated users
- **Role Support** — `user` and `admin` roles with different permissions

### Bonus

- **TypeScript** — Full type safety across the entire frontend
- **Zustand** — Lightweight state management for auth
- **React Query** — Server state, caching, and background refetching
- **Export** — Download all filtered issues as CSV or JSON
- **Reusable Components** — Badges, Modal, ConfirmDialog, Spinner, Pagination, etc.

---
# IssuieTracker
