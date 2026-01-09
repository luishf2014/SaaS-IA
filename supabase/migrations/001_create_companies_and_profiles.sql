/**
 * Migração: Criação de tabelas companies e profiles
 * 
 * Cria as tabelas necessárias para multi-tenancy e RBAC
 * Inclui Row Level Security (RLS) para isolamento total
 */

-- Criar tabela companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Criar índices para companies
CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS companies_created_at_idx ON public.companies(created_at DESC);

-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Criar índices para profiles
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Habilitar Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES RLS PARA COMPANIES
-- ============================================

-- Policy: Usuário pode ver apenas sua própria company (onde é owner_id)
CREATE POLICY "Users can view own company"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Policy: Usuário pode criar company apenas se for o owner_id
CREATE POLICY "Users can create own company"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- ============================================
-- POLICIES RLS PARA PROFILES
-- ============================================

-- Policy: Usuário pode ver apenas seu próprio profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Usuário pode criar apenas seu próprio profile
CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Usuário pode atualizar apenas seu próprio profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
