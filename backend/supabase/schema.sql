-- ============================================================================
-- CoolZone — Supabase / PostgreSQL schema
-- Mirrors the former MongoDB (Mongoose) models. Nested & bilingual fields are
-- stored as jsonb so the Express API keeps returning the exact same shape the
-- React frontend already consumes (name.fr/ar, specs, variants, addresses…).
--
-- Run this once in the Supabase SQL editor (or via `psql`) before starting the
-- migrated backend.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  password    text not null,
  phone       text,
  role        text not null default 'user' check (role in ('user','admin')),
  addresses   jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists users_email_lower_idx on users (lower(email));

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        jsonb not null,            -- { fr, ar }
  slug        text unique,
  icon        text,
  image       text,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- BRANDS
-- ---------------------------------------------------------------------------
create table if not exists brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text unique,
  logo        text default '',
  description text default '',
  "order"     integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  name          jsonb not null,                 -- { fr, ar }
  description   jsonb not null default '{}'::jsonb,
  brand         text,
  category      uuid references categories(id) on delete set null,
  price         numeric not null default 0,
  price_old     numeric,
  images        jsonb not null default '[]'::jsonb,
  specs         jsonb not null default '{}'::jsonb,
  stock         integer not null default 0,
  rating        numeric not null default 0,
  num_reviews   integer not null default 0,
  is_promo      boolean not null default false,
  is_featured   boolean not null default false,
  tags          jsonb not null default '[]'::jsonb,
  delivery_fee  numeric not null default 0,
  variants      jsonb not null default '[]'::jsonb,
  slug          text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists products_brand_idx       on products (brand);
create index if not exists products_category_idx     on products (category);
create index if not exists products_is_featured_idx  on products (is_featured);
create index if not exists products_is_promo_idx      on products (is_promo);
create index if not exists products_stock_idx         on products (stock);
-- Lightweight free-text helper over the bilingual name + brand.
create index if not exists products_search_idx on products
  using gin (to_tsvector('simple',
    coalesce(name->>'fr','') || ' ' || coalesce(name->>'ar','') || ' ' || coalesce(brand,'')));

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists reviews_product_idx on reviews (product_id);

-- ---------------------------------------------------------------------------
-- COUPONS
-- ---------------------------------------------------------------------------
create table if not exists coupons (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  type         text not null check (type in ('percent','fixed')),
  value        numeric not null default 0,
  min_total    numeric not null default 0,
  expires_at   timestamptz,
  usage_limit  integer not null default 0,
  used_count   integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users(id) on delete set null,
  items          jsonb not null default '[]'::jsonb,
  shipping       jsonb not null default '{}'::jsonb,
  payment        jsonb not null default '{}'::jsonb,
  status         text not null default 'pending'
                   check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal       numeric,
  shipping_cost  numeric not null default 0,
  discount       numeric not null default 0,
  total          numeric not null,
  coupon         uuid references coupons(id) on delete set null,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_user_idx   on orders (user_id);
create index if not exists orders_status_idx on orders (status);

-- ---------------------------------------------------------------------------
-- updated_at auto-touch trigger (mirrors Mongoose { timestamps: true })
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['users','categories','brands','products','reviews','coupons','orders']
  loop
    execute format('drop trigger if exists trg_set_updated_at on %I;', t);
    execute format('create trigger trg_set_updated_at before update on %I
                    for each row execute function set_updated_at();', t);
  end loop;
end $$;
