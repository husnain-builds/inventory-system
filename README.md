# StockFlow

Inventory management dashboard built with Next.js. Admins can view all users and organization-wide inventory; regular users manage their own stock.

## Features

- **Role-based access** — Admin vs User views
- **Inventory tracking** — Items, SKUs, quantities, locations, stock status
- **Stock alerts** — Low stock and out-of-stock warnings
- **User management** — Admin can see all users and their inventory
- **Fixed sidebar** — Only main content scrolls; navigation stays in view

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/sign-in` | Public | Sign in |
| `/sign-up` | Public | Create account |
| `/` | Auth | Dashboard overview |
| `/inventory` | Auth | All inventory (admin) or My inventory (user) |
| `/users` | Admin | All users and their inventory |
| `/analytics` | Auth | Stock analytics |
| `/settings` | Auth | Profile & sign out |

## Demo Credentials

Click **Demo Credentials** on the sign-in form:

| Account | Email | Password |
|---------|-------|----------|
| Admin | `admin@stockflow.io` | `admin123456` |
| Warehouse User | `elena@stockflow.io` | `user123456` |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design

**Light theme** — clean white cards on a soft gray background with indigo accents. Sidebar-only navigation on desktop; mobile header + bottom tab bar on small screens. Only the main content area scrolls.

All data is mock data in `src/lib/mock-data.ts`. Auth is client-side via localStorage.
