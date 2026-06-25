/f# 🧊 CoolZone — Full Project Plan & File Instructions
### Fullstack E-Commerce Website | Air Conditioning Shop
**Languages:** French 🇫🇷 | Arabic 🇲🇦 (RTL supported)
**Platforms:** Desktop + Mobile (App-style bottom tabs on phone)

---

## 📁 PROJECT STRUCTURE

```
coolzone/
├── frontend/                     # React + Vite frontend
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── locales/
│   │       ├── fr/
│   │       │   └── translation.json        # French strings
│   │       └── ar/
│   │           └── translation.json        # Arabic strings
│   ├── src/
│   │   ├── main.jsx                        # App entry point
│   │   ├── App.jsx                         # Root component + router
│   │   ├── i18n.js                         # i18next config (fr/ar, RTL)
│   │   │
│   │   ├── assets/                         # Images, icons, SVGs
│   │   │   ├── logo.svg
│   │   │   ├── hero-bg.jpg
│   │   │   └── brands/                     # Brand logos (Daikin, Gree, etc.)
│   │   │
│   │   ├── components/                     # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx              # Desktop top navigation
│   │   │   │   ├── BottomTabBar.jsx        # Mobile bottom tabs (app-style)
│   │   │   │   ├── Sidebar.jsx             # Filter sidebar (desktop)
│   │   │   │   ├── Footer.jsx              # Full footer
│   │   │   │   └── Layout.jsx              # Wrapper (Navbar + Footer + BottomTab)
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── LanguageSwitcher.jsx    # FR / AR toggle
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Badge.jsx               # "Nouveau", "Promo" tags
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx               # Notifications
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── RatingStars.jsx
│   │   │   │
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.jsx         # Grid card with add-to-cart
│   │   │   │   ├── ProductGrid.jsx         # Responsive grid container
│   │   │   │   ├── ProductDetail.jsx       # Full detail view
│   │   │   │   ├── ProductImageGallery.jsx # Zoom + swipe gallery
│   │   │   │   ├── ProductSpecs.jsx        # Technical specs table
│   │   │   │   └── RelatedProducts.jsx
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   ├── CartDrawer.jsx          # Slide-in cart panel
│   │   │   │   ├── CartItem.jsx
│   │   │   │   └── CartSummary.jsx
│   │   │   │
│   │   │   ├── checkout/
│   │   │   │   ├── CheckoutSteps.jsx       # Step indicator
│   │   │   │   ├── AddressForm.jsx
│   │   │   │   ├── PaymentForm.jsx
│   │   │   │   └── OrderSummary.jsx
│   │   │   │
│   │   │   └── home/
│   │   │       ├── HeroBanner.jsx          # Full-width hero with CTA
│   │   │       ├── CategoryGrid.jsx        # AC types icons
│   │   │       ├── FeaturedProducts.jsx
│   │   │       ├── PromoStrip.jsx          # Scrolling promo bar
│   │   │       ├── BrandsCarousel.jsx      # Brand logos slider
│   │   │       └── WhyUs.jsx               # Features (livraison, garantie…)
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ShopPage.jsx                # Product listing + filters
│   │   │   ├── ProductPage.jsx             # Single product
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderConfirmPage.jsx
│   │   │   ├── AccountPage.jsx             # User profile / orders
│   │   │   ├── WishlistPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── store/                          # Zustand global state
│   │   │   ├── cartStore.js
│   │   │   ├── wishlistStore.js
│   │   │   ├── authStore.js
│   │   │   └── uiStore.js                  # Language, theme, drawer state
│   │   │
│   │   ├── hooks/
│   │   │   ├── useProducts.js              # React Query hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   ├── useRTL.js                   # RTL direction helper
│   │   │   └── useBreakpoint.js            # Mobile/desktop detection
│   │   │
│   │   ├── api/
│   │   │   ├── axiosClient.js              # Axios instance + interceptors
│   │   │   ├── products.api.js
│   │   │   ├── auth.api.js
│   │   │   ├── orders.api.js
│   │   │   └── categories.api.js
│   │   │
│   │   ├── utils/
│   │   │   ├── formatPrice.js              # MAD / EUR formatting
│   │   │   ├── validators.js
│   │   │   └── rtlHelpers.js
│   │   │
│   │   └── styles/
│   │       ├── globals.css                 # CSS reset, variables, RTL overrides
│   │       ├── typography.css
│   │       └── animations.css
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── server.js                       # Express app entry
│   │   ├── app.js                          # Middleware setup
│   │   │
│   │   ├── config/
│   │   │   ├── db.js                       # MongoDB connection
│   │   │   ├── cloudinary.js               # Image uploads
│   │   │   └── env.js                      # dotenv validation
│   │   │
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Product.model.js
│   │   │   ├── Category.model.js
│   │   │   ├── Order.model.js
│   │   │   ├── Review.model.js
│   │   │   └── Coupon.model.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── review.controller.js
│   │   │   └── coupon.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── review.routes.js
│   │   │   └── coupon.routes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js          # JWT verify
│   │   │   ├── admin.middleware.js         # Admin role guard
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   └── upload.middleware.js        # Multer + Cloudinary
│   │   │
│   │   ├── services/
│   │   │   ├── email.service.js            # Nodemailer (order confirm, etc.)
│   │   │   ├── payment.service.js          # CMI / Stripe integration
│   │   │   └── search.service.js           # Product search logic
│   │   │
│   │   └── utils/
│   │       ├── apiResponse.js              # Standard response wrapper
│   │       ├── apiError.js
│   │       └── generateToken.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── admin/                        # Separate React admin dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx               # CRUD products
│   │   │   ├── Orders.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Categories.jsx
│   │   │   └── Coupons.jsx
│   │   └── components/
│   │       ├── DataTable.jsx
│   │       ├── Charts.jsx                 # Sales/revenue charts
│   │       └── ImageUploader.jsx
│   └── package.json
│
├── docker-compose.yml            # MongoDB + Backend + Frontend
├── .gitignore
└── README.md
```

---

## 🗄️ DATABASE MODELS

### Product Model (`Product.model.js`)
```js
{
  name:        { fr: String, ar: String },       // Bilingual name
  description: { fr: String, ar: String },       // Bilingual description
  brand:       String,                           // Daikin, Gree, Samsung…
  category:    ObjectId → Category,
  price:       Number,                           // In MAD
  priceOld:    Number,                           // For promo display
  images:      [String],                         // Cloudinary URLs
  specs: {
    capacity:    String,                         // e.g. "12000 BTU"
    energyClass: String,                         // A++, A+
    coverage:    String,                         // m²
    inverter:    Boolean,
    wifi:        Boolean,
    heating:     Boolean,                        // Chaud/froid
    noise:       String,                         // dB
    warranty:    String,                         // "2 ans"
  },
  stock:       Number,
  rating:      Number,
  numReviews:  Number,
  isPromo:     Boolean,
  isFeatured:  Boolean,
  slug:        String,
  createdAt:   Date,
}
```

### Order Model (`Order.model.js`)
```js
{
  user:      ObjectId → User,
  items:     [{ product, qty, price, name }],
  shipping:  { name, phone, address, city, wilaya },
  payment:   { method, status, transactionId },
  status:    enum['pending','confirmed','shipped','delivered','cancelled'],
  subtotal:  Number,
  shipping_cost: Number,
  discount:  Number,
  total:     Number,
  coupon:    ObjectId → Coupon,
  notes:     String,
  createdAt: Date,
}
```

---

## 🔌 API ENDPOINTS

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + JWT |
| POST | `/api/auth/logout` | Clear token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/password` | Change password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List (filter, sort, paginate) |
| GET | `/api/products/:slug` | Single product |
| GET | `/api/products/featured` | Featured products |
| POST | `/api/products` | Create (Admin) |
| PUT | `/api/products/:id` | Update (Admin) |
| DELETE | `/api/products/:id` | Delete (Admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order |
| GET | `/api/orders/mine` | User's orders |
| GET | `/api/orders/:id` | Order detail |
| PUT | `/api/orders/:id/status` | Update status (Admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | All categories |
| POST | `/api/categories` | Create (Admin) |

---

## 🌐 I18N — TRANSLATION STRUCTURE

### `public/locales/fr/translation.json`
```json
{
  "nav": {
    "home": "Accueil",
    "shop": "Boutique",
    "cart": "Panier",
    "wishlist": "Favoris",
    "account": "Mon Compte",
    "about": "À Propos",
    "contact": "Contact"
  },
  "home": {
    "hero_title": "Restez au Frais avec CoolZone",
    "hero_sub": "Climatiseurs premium livrés chez vous au Maroc",
    "shop_now": "Voir nos produits"
  },
  "product": {
    "add_to_cart": "Ajouter au panier",
    "add_to_wishlist": "Ajouter aux favoris",
    "in_stock": "En stock",
    "out_of_stock": "Rupture de stock",
    "btu": "BTU",
    "energy_class": "Classe énergie",
    "coverage": "Surface couverte",
    "warranty": "Garantie"
  },
  "cart": {
    "title": "Mon Panier",
    "empty": "Votre panier est vide",
    "total": "Total",
    "checkout": "Commander"
  }
}
```

### `public/locales/ar/translation.json`
```json
{
  "nav": {
    "home": "الرئيسية",
    "shop": "المتجر",
    "cart": "السلة",
    "wishlist": "المفضلة",
    "account": "حسابي",
    "about": "من نحن",
    "contact": "اتصل بنا"
  },
  "home": {
    "hero_title": "ابقَ بارداً مع كول زون",
    "hero_sub": "مكيفات هواء فاخرة تُوصَّل إليك في المغرب",
    "shop_now": "اكتشف المنتجات"
  },
  "product": {
    "add_to_cart": "أضف إلى السلة",
    "add_to_wishlist": "أضف إلى المفضلة",
    "in_stock": "متوفر في المخزون",
    "out_of_stock": "نفد من المخزون",
    "btu": "وحدة حرارية",
    "energy_class": "فئة الطاقة",
    "coverage": "المساحة المغطاة",
    "warranty": "الضمان"
  },
  "cart": {
    "title": "سلة التسوق",
    "empty": "سلتك فارغة",
    "total": "الإجمالي",
    "checkout": "إتمام الطلب"
  }
}
```

---

## 📱 MOBILE — BOTTOM TAB BAR

The `BottomTabBar.jsx` shows **only on mobile** (`md:hidden`).

### Tabs Layout
```
┌─────────────────────────────────────────┐
│  🏠      🛒       🔍      ❤️      👤   │
│ Accueil  Panier  Chercher Favoris Compte│
└─────────────────────────────────────────┘
```

### `BottomTabBar.jsx` — Key Implementation Notes
- Fixed bottom, `z-50`, safe area padding for iOS (`padding-bottom: env(safe-area-inset-bottom)`)
- Active tab highlighted with brand color + icon fill
- Cart tab shows badge with item count
- Smooth underline or dot indicator animation
- RTL: tabs reverse order when Arabic is active

---

## 🖥️ DESKTOP — TOP NAVIGATION (Navbar.jsx)

```
┌──────────────────────────────────────────────────────────────────┐
│  ❄️ CoolZone   Accueil  Boutique  À Propos  Contact   🔍  ❤️  🛒  FR|AR │
└──────────────────────────────────────────────────────────────────┘
```

- Sticky top navbar
- Transparent on hero → solid white/dark on scroll
- Cart icon with item count badge
- Language switcher `FR | AR` (switches direction globally)
- Hamburger hidden on desktop

---

## 🎨 DESIGN SYSTEM

### Color Palette
```css
:root {
  --color-primary:    #0077CC;   /* Ice blue — brand */
  --color-primary-dk: #005FA3;   /* Darker shade for hover */
  --color-accent:     #00C2A8;   /* Teal accent */
  --color-warm:       #FF6B35;   /* Promo / CTA orange */
  --color-bg:         #F5F9FF;   /* Light ice background */
  --color-surface:    #FFFFFF;
  --color-text:       #1A2234;
  --color-muted:      #6B7A99;
  --color-border:     #DDE4EF;
}
```

### Typography
- **Display/Hero:** `Syne` (bold, geometric)
- **Body (FR):** `Outfit` (clean, modern)
- **Arabic text:** `Noto Kufi Arabic` (beautiful, professional)
- **Prices/Numbers:** `JetBrains Mono` (sharp mono)

### Breakpoints (Tailwind)
```js
screens: {
  'sm': '640px',   // Large phones
  'md': '768px',   // Tablet — bottom tab hidden above this
  'lg': '1024px',  // Desktop nav visible
  'xl': '1280px',  // Wide desktop
}
```

---

## 🔄 RTL SUPPORT IMPLEMENTATION

### `i18n.js`
```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: { fr: {...}, ar: {...} },
  lng: 'fr',           // Default language
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### `useRTL.js` hook
```js
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function useRTL() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL]);

  return { isRTL, dir: isRTL ? 'rtl' : 'ltr' };
}
```

### `globals.css` — RTL overrides
```css
[dir="rtl"] {
  text-align: right;
  font-family: 'Noto Kufi Arabic', sans-serif;
}
[dir="rtl"] .flex-row    { flex-direction: row-reverse; }
[dir="rtl"] .ml-auto     { margin-left: 0; margin-right: auto; }
[dir="rtl"] .text-left   { text-align: right; }
[dir="rtl"] .rounded-l   { border-radius: 0 0.25rem 0.25rem 0; }
[dir="rtl"] .rounded-r   { border-radius: 0.25rem 0 0 0.25rem; }
```

---

## 🛒 CART — STATE MANAGEMENT (Zustand)

### `cartStore.js`
```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(persist((set, get) => ({
  items: [],
  addItem: (product, qty = 1) => { /* merge or add */ },
  removeItem: (id) => { /* filter out */ },
  updateQty: (id, qty) => { /* update qty */ },
  clearCart: () => set({ items: [] }),
  get total() { return get().items.reduce((s, i) => s + i.price * i.qty, 0); },
  get count() { return get().items.reduce((s, i) => s + i.qty, 0); },
}), { name: 'coolzone-cart' }));
```

---

## 🔐 AUTH FLOW

1. User registers → hashed password (bcrypt) → JWT returned
2. JWT stored in `httpOnly cookie` (secure)
3. `auth.middleware.js` verifies token on protected routes
4. Frontend `authStore` holds user state + handles refresh
5. Admin routes additionally guarded by `admin.middleware.js`

---

## 💳 PAYMENT INTEGRATION

### Supported Methods
| Method | Provider | Notes |
|--------|----------|-------|
| Credit Card | CMI (Maroc) | Primary — redirect flow |
| Cash on Delivery | — | Default / most common |
| Bank Transfer | — | Manual confirmation |

### CMI Flow
1. Frontend POSTs order to backend
2. Backend creates order with `status: 'pending'`
3. Backend calls CMI API → returns redirect URL
4. User redirected to CMI payment page
5. CMI sends webhook callback → backend updates `status: 'confirmed'`
6. User redirected to `/order/confirm/:id`

---

## 📦 PRODUCT CATEGORIES

| Category (FR) | Category (AR) | Icon |
|---------------|---------------|------|
| Climatiseur Split | مكيف سبليت | 🧊 |
| Multi-Split | متعدد التقسيم | ❄️ |
| Cassette | كاسيت | 🌀 |
| Gainable | مدمج | 🔧 |
| Armoire | خزانة | 🗄️ |
| Accessoires | ملحقات | 🛠️ |

---

## 🚀 TECH STACK SUMMARY

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS v3 |
| **Routing** | React Router v6 |
| **State** | Zustand + React Query (TanStack) |
| **i18n** | i18next + react-i18next |
| **Animations** | Framer Motion |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcrypt |
| **Images** | Cloudinary |
| **Email** | Nodemailer (SMTP) |
| **Deployment** | Vercel (frontend) + Railway/Render (backend) + MongoDB Atlas |

---

## 🧩 PAGE-BY-PAGE SPECIFICATION

### 1. Home Page
- Full-width hero with animated headline + "Découvrir" CTA
- Scrolling promo strip ("Livraison gratuite à Casablanca" etc.)
- 6-icon category quick-access grid
- Featured products carousel (auto-scroll)
- Brands row: Daikin, Gree, Samsung, Hitachi, Midea, Haier
- "Pourquoi CoolZone?" — 4 icons (garantie, livraison, service, prix)
- WhatsApp floating button

### 2. Shop Page
- Left sidebar filters (desktop) / Bottom sheet filters (mobile):
  - Category, Brand, Price range slider, Energy class, BTU, Inverter
- Sort: Newest, Price ↑↓, Best rated, Promotions
- Infinite scroll or pagination
- Grid toggle (2 cols mobile / 3-4 cols desktop)
- Product card: image, name (bilingual), price, promo badge, quick add-to-cart

### 3. Product Detail Page
- Image gallery with zoom + swipe (mobile)
- Price with old price strikethrough if on promo
- Stock status badge
- Energy label graphic (A, A+, A++)
- Specs accordion (BTU, surface, classe énergie, bruit, garantie…)
- Add to cart + Add to wishlist
- Quantity selector
- Customer reviews section
- Related products

### 4. Cart Page / Drawer
- List of items with image, name, qty stepper, price, remove
- Coupon code input
- Order summary (subtotal, livraison, remise, total)
- Sticky "Commander" button

### 5. Checkout (3 Steps)
- **Step 1 — Coordonnées:** Name, phone, city, address
- **Step 2 — Livraison:** Delivery options (pickup / home delivery)
- **Step 3 — Paiement:** CMI card / Cash on delivery / Virement

### 6. Account Page
- Profile info + edit
- Order history with status tracking
- Wishlist shortcut
- Logout

---

## 📋 ENVIRONMENT VARIABLES

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CMI_MERCHANT_ID=...
CMI_SECRET_KEY=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contact@coolzone.ma
SMTP_PASS=...
CLIENT_URL=https://coolzone.ma
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_URL=https://res.cloudinary.com/...
VITE_WHATSAPP_NUMBER=+212600000000
```

---

## 📐 RESPONSIVE BEHAVIOR SUMMARY

| Element | Mobile (< 768px) | Desktop (≥ 768px) |
|---------|-----------------|------------------|
| Navigation | Bottom tab bar (5 tabs, fixed) | Top sticky navbar |
| Product grid | 2 columns | 3–4 columns |
| Filters | Bottom sheet / modal | Left sidebar |
| Cart | Full page | Slide-in drawer |
| Hero text | Large centered | Split left/right |
| Footer | Collapsed accordion | Full 4-column layout |

---

## 🗓️ DEVELOPMENT PHASES

### Phase 1 — Foundation (Week 1–2)
- [ ] Project scaffolding (Vite, Express, MongoDB)
- [ ] i18n setup with FR/AR + RTL toggle
- [ ] Auth (register, login, JWT)
- [ ] Design system: colors, fonts, Tailwind config

### Phase 2 — Core Features (Week 3–4)
- [ ] Product model + API (CRUD)
- [ ] Shop page + filters + search
- [ ] Product detail page
- [ ] Cart (Zustand + localStorage persist)

### Phase 3 — UX & Checkout (Week 5–6)
- [ ] Mobile bottom tab bar
- [ ] Checkout flow (3 steps)
- [ ] CMI payment integration
- [ ] Order confirmation + email

### Phase 4 — Account & Admin (Week 7–8)
- [ ] User account + order history
- [ ] Admin dashboard (products, orders, users)
- [ ] Image upload (Cloudinary)
- [ ] Coupon system

### Phase 5 — Polish & Deploy (Week 9–10)
- [ ] Animations (Framer Motion)
- [ ] SEO (React Helmet, bilingual meta)
- [ ] Performance (lazy loading, code split)
- [ ] Deploy: Vercel + Railway + MongoDB Atlas
- [ ] Final QA on mobile/desktop + RTL

---

## ✅ CHECKLIST BEFORE LAUNCH

- [ ] All text translated in both FR and AR
- [ ] RTL layout correct in Arabic mode (no broken floats, reversed flex)
- [ ] Bottom tabs functional on iOS Safari (safe area insets)
- [ ] Cart persists on page refresh
- [ ] CMI payment webhook tested end-to-end
- [ ] Confirmation emails working
- [ ] Product images optimized (WebP, lazy loaded)
- [ ] 404 page in both languages
- [ ] Google Analytics / Meta Pixel installed
- [ ] WhatsApp chat button visible on all pages
- [ ] Mobile performance score > 85 (Lighthouse)

---

*CoolZone — Built for Morocco 🇲🇦 | Cool by Design ❄️*
