# MedRepOS V1 — Implementation Plan

## Tagline
> A complete Medical Representative Management System with realtime activity tracking and analytics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, shadcn/ui, React Router, React Query, Zustand |
| Backend | Express.js, Mongoose, Socket.IO |
| Auth | Clerk |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |

---

## Branch Strategy

```
main
└── Existing Analytics Dashboard (FastAPI + PostgreSQL)

medrepos-v1
└── New Medical Rep System (Express + MongoDB)
```

---

## Collections (MongoDB)

### User
```
clerkId, name, email, role (admin | manager | rep)
```

### Doctor
```
name, specialization, hospital, location, contact, assignedRep (ref User)
```

### Visit
```
repId (ref User), doctorId (ref Doctor), visitDate, notes,
productsDiscussed [String], status (pending | completed | cancelled),
prescriptionImage (Cloudinary URL)
```

### Order
```
doctorId (ref Doctor), repId (ref User),
medicines [{ name, quantity }], totalAmount,
status (pending | approved | rejected)
```

### Notification
```
title, message, recipient (ref User), read (Boolean), type
```

---

## Sprint Order

| Sprint | Feature | Est. Days |
|--------|---------|-----------|
| 1 | Clerk Auth + Role Management | 2-3 |
| 2 | Doctor CRUD | 2 |
| 3 | Visit CRUD | 2-3 |
| 4 | Dashboard Stats (`GET /api/dashboard/stats`) | 1 |
| 5 | Socket.IO Realtime Visit Feed | 1 |
| 6 | Orders | 2 |
| 7 | Notifications | 1 |
| 8 | Analytics | 2-3 |

**Total: ~14 days**

---

## Sprint Details

### Sprint 1 — Clerk Auth + Role Management

**Backend (`server/`)**

| File | Purpose |
|------|---------|
| `server/package.json` | express, mongoose, socket.io, cors, dotenv, @clerk/clerk-sdk-node, cloudinary, multer-storage-cloudinary |
| `server/.env` | MONGO_URI, CLERK_SECRET_KEY, CLOUDINARY_* |
| `server/server.js` | Express init, middleware, routes, Socket.IO server |
| `server/config/db.js` | Mongoose connection |
| `server/models/User.js` | User schema |
| `server/middleware/auth.js` | Clerk token verification |
| `server/middleware/role.js` | Role-based access |
| `server/routes/auth.js` | `POST /api/users/sync` — create user in MongoDB if not exists |

**Frontend (`frontend/`)**

| File | Purpose |
|------|---------|
| `package.json` | Add @clerk/clerk-react, react-router-dom, axios, socket.io-client |
| `.env` | VITE_CLERK_PUBLISHABLE_KEY |
| `src/main.tsx` | `<ClerkProvider>` + `<BrowserRouter>` |
| `src/App.tsx` | Route definitions |
| `src/lib/api.ts` | Axios instance with Clerk Bearer token |
| `src/lib/socket.ts` | Socket.IO client |
| `src/store/auth.ts` | Zustand auth store |
| `src/components/Layout.tsx` | Sidebar + Topbar, role-aware nav |
| `src/components/ProtectedRoute.tsx` | Auth + role guard |
| `src/pages/DashboardPage.tsx` | Role-based redirect |

---

### Sprint 2 — Doctor CRUD

**Backend**
- `server/models/Doctor.js`
- `server/routes/doctors.js`
- `server/controllers/doctors.js` — CRUD + search + filter by specialization

**Frontend**
- `src/hooks/useDoctors.ts`
- `src/pages/doctors/DoctorList.tsx` — table + search + filter
- `src/pages/doctors/DoctorForm.tsx` — create/edit modal

---

### Sprint 3 — Visit CRUD

**Backend**
- `server/models/Visit.js`
- `server/routes/visits.js`
- `server/controllers/visits.js`
- `server/middleware/upload.js` — Multer + Cloudinary

**Frontend**
- `src/hooks/useVisits.ts`
- `src/pages/visits/VisitList.tsx`
- `src/pages/visits/VisitForm.tsx`

---

### Sprint 4 — Dashboard Stats

**Backend**
- `server/routes/dashboard.js`
- `server/controllers/dashboard.js`

```js
GET /api/dashboard/stats
{
  totalDoctors,
  totalVisits,
  totalOrders,
  pendingOrders
}
```

**Frontend**
- Update DashboardPage to show real stat cards (replace role-based placeholder)

---

### Sprint 5 — Socket.IO Realtime

**Backend**
- `server/socket/index.js` — room management, events

**Event Flow**
```
Rep submits visit → Express saves → emits "visit:new"
→ Manager dashboard receives → live feed updates
```

**Frontend**
- `src/hooks/useSocket.ts`
- `src/components/RealtimeFeed.tsx`

---

### Sprint 6 — Orders

**Backend**
- `server/models/Order.js`
- `server/routes/orders.js`
- `server/controllers/orders.js`

**Frontend**
- `src/hooks/useOrders.ts`
- `src/pages/orders/OrderList.tsx`
- `src/pages/orders/OrderForm.tsx`

---

### Sprint 7 — Notifications

**Backend**
- `server/models/Notification.js`
- `server/routes/notifications.js`
- `server/controllers/notifications.js`

**Frontend**
- `src/pages/NotificationsPage.tsx`
- `src/components/NotificationBell.tsx`

---

### Sprint 8 — Analytics

**Backend endpoints**

| Endpoint | Data |
|----------|------|
| `GET /api/analytics/admin` | Total reps, doctors, visits, orders, revenue |
| `GET /api/analytics/manager` | Top reps, most visited doctors, revenue trend |
| `GET /api/analytics/rep` | My visits, my orders, conversion rate |

**Frontend**
- `src/pages/analytics/AdminAnalytics.tsx` — 4 stat cards + monthly bar chart
- `src/pages/analytics/ManagerAnalytics.tsx` — top reps bar, top doctors bar, revenue line
- `src/pages/analytics/RepAnalytics.tsx` — gauge + pie chart

---

## V1 Success Criteria

```
Login (Clerk)
   ↓
Create Doctor
   ↓
Log Visit with prescription image
   ↓
Manager sees live update (Socket.IO)
   ↓
Create Order
   ↓
Manager approves order
   ↓
Analytics update in realtime
```

---

## Future (V2 — not for this sprint)

- GPS-based visit verification
- Territory management
- AI visit summaries
- AI sales insights
- Offline sync
