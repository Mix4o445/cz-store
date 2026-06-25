# 🧊 CoolZone — Fullstack E-Commerce

Bilingual (FR / AR with RTL) e-commerce site for an air-conditioning shop in Morocco.
See [`COOLZONE_PROJECT_PLAN.md`](./COOLZONE_PROJECT_PLAN.md) for the full plan.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + Vite + Tailwind CSS + Zustand + React Query + i18next + Framer Motion |
| Backend  | Node.js + Express + Mongoose + JWT + Zod |
| DB       | MongoDB |

## Project layout

```
.
├── frontend/   # Vite + React app
├── backend/    # Express API
├── docker-compose.yml
└── COOLZONE_PROJECT_PLAN.md
```

## Quick start (dev)

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd backend
cp .env.example .env # set JWT_SECRET and MONGODB_URI
npm install
npm run dev          # http://localhost:5000
```

The frontend has a Vite proxy on `/api → http://localhost:5000`, but in production it
uses `VITE_API_URL` directly.

## Phase 1 status

- [x] Frontend scaffold (Vite + React + Tailwind v3)
- [x] FR/AR i18n with RTL toggle
- [x] Layout: desktop Navbar + mobile BottomTabBar + Footer + WhatsApp FAB
- [x] All page shells (Home, Shop, Product, Cart, Wishlist, Checkout, Account, Login, Register, About, Contact, NotFound)
- [x] HomePage sections (Hero, Promo strip marquee, Categories, Featured products, Why us, Brands)
- [x] Stores: cart, wishlist, auth, ui (Zustand + persist)
- [x] axios client + product/auth/orders/categories API modules
- [x] Backend: Express + Mongoose models (User, Product, Category, Order, Review, Coupon)
- [x] Auth (register/login/me/logout/change password) with JWT + httpOnly cookie
- [x] Product CRUD + filtering/sort/pagination
- [x] Order create + list mine + status update (admin)

## Next phases

- Phase 2: Real product API hookup, search, advanced filters, product detail enhancements
- Phase 3: Checkout flow, CMI payment, email confirmation
- Phase 4: User account + admin dashboard
- Phase 5: Polish, SEO, performance, deploy
