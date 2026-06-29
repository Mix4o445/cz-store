-- Run once in the Supabase SQL editor to enable the AI assistant's long-term memory.
create extension if not exists "pgcrypto";

create table if not exists agent_memory (
  id          uuid primary key default gen_random_uuid(),
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists agent_memory_created_idx on agent_memory (created_at desc);
