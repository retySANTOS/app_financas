-- ============================================================
-- Migration: Categorias dinâmicas por usuário
-- Execute este SQL no SQL Editor do Supabase
-- ============================================================

-- 1. Criar tabela de categorias
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('receita', 'despesa', 'ambas')),
  created_at timestamptz default now() not null,
  unique(user_id, name)
);

-- Índice para performance
create index if not exists categories_user_id_idx on public.categories(user_id);

-- Habilitar Row Level Security
alter table public.categories enable row level security;

create policy "Users can view own categories"
  on public.categories for select using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert with check (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete using (auth.uid() = user_id);

-- 2. Remover constraint de categoria fixa da tabela transactions
alter table public.transactions drop constraint if exists transactions_category_check;
