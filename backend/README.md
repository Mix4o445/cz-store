# CoolZone Backend

Express + Mongoose + JWT API for the CoolZone e-commerce site.

## Setup

```bash
cp .env.example .env   # then edit values
npm install
npm run dev            # nodemon
# or
npm start
```

The server listens on `PORT` (default `5000`). MongoDB must be reachable at `MONGODB_URI`.
Health check: `GET /health`.

## API endpoints (Phase 1)

### Auth
- `POST /api/auth/register` — `{ name, email, password, phone? }`
- `POST /api/auth/login` — `{ email, password }`
- `POST /api/auth/logout`
- `GET  /api/auth/me` — requires Bearer token or auth cookie
- `PUT  /api/auth/password` — `{ current, next }`

### Products
- `GET    /api/products` — query: `page, limit, sort, brand, category, minPrice, maxPrice, promo, featured, q`
- `GET    /api/products/featured`
- `GET    /api/products/:slug`
- `POST   /api/products` (admin)
- `PUT    /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Categories
- `GET  /api/categories`
- `POST /api/categories` (admin)

### Orders
- `POST /api/orders` — guest checkout supported
- `GET  /api/orders/mine` (auth)
- `GET  /api/orders/:id` (auth, admin or owner)
- `PUT  /api/orders/:id/status` (admin)

## Notes

- JWT signed with `JWT_SECRET`, expires per `JWT_EXPIRES_IN` (default 7d).
- Tokens are returned in JSON and also set as an httpOnly cookie named `token`.
- Rate limiting: 300 req / 15 min globally, 30 / 15 min on auth endpoints.
- Validation handled with `zod`; mongoose validation errors are returned as HTTP 400.
