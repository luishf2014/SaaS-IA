/**
 * Migração FASE 8: Infraestrutura Completa de Dados
 * 
 * FASE 8: Infraestrutura de Dados (Supabase)
 * 
 * Cria o schema completo do banco de dados para suportar:
 * - ensureUserProfile() - criação automática de company e profile
 * - CRUD administrativo de usuários (FASE 7)
 * - Isolamento multi-tenant por company
 * 
 * Esta migração é idempotente e pode ser executada múltiplas vezes.
 */

-- ============================================
-- TABELA COMPANIES
-- ============================================

-- Criar tabela companies (se não existir)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Criar índices para companies (se não existirem)
CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS companies_created_at_idx ON public.companies(created_at DESC);

-- ============================================
-- TABELA PROFILES
-- ============================================

-- Criar tabela profiles (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Criar índices para profiles (se não existirem)
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES RLS PARA COMPANIES
-- ============================================

-- Remover policies antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
DROP POLICY IF EXISTS "Users can create own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company name" ON public.companies;
DROP POLICY IF EXISTS "Users can view company through profile" ON public.companies;

-- Policy: Usuário pode ver sua própria company (onde é owner_id)
CREATE POLICY "Users can view own company"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Policy: Usuário pode criar company apenas se for o owner_id
-- Necessário para ensureUserProfile() criar company automaticamente
CREATE POLICY "Users can create own company"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Policy: Usuário pode atualizar nome da company (apenas owner)
CREATE POLICY "Users can update own company name"
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND owner_id = OLD.owner_id -- Garantir que não pode mudar owner_id
  );

-- Policy: Usuário pode ver company através do profile
-- Necessário para SELECT com join profiles -> companies em getUserProfile()
CREATE POLICY "Users can view company through profile"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    -- Usuário pode ver sua própria company (owner_id) OU
    owner_id = auth.uid()
    OR
    -- Usuário pode ver company através do seu profile
    id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- POLICIES RLS PARA PROFILES
-- ============================================

-- Remover policies antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles from same company" ON public.profiles;
DROP POLICY IF EXISTS "Admins can create profiles for same company" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles from same company" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles from same company" ON public.profiles;

-- Policy: Usuário pode ver seu próprio profile
-- Necessário para getUserProfile() e ensureUserProfile()
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Admin pode ver profiles da mesma company
-- Necessário para getAdminUsers() listar usuários da empresa
CREATE POLICY "Admins can view profiles from same company"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Usuário pode ver seu próprio profile OU
    user_id = auth.uid()
    OR
    -- Admin pode ver profiles da mesma company
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
  );

-- Policy: Usuário pode criar apenas seu próprio profile
-- Necessário para ensureUserProfile() criar profile automaticamente
CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Admin pode criar profiles para usuários da mesma company
-- Necessário para createUser() criar profile para novo usuário
CREATE POLICY "Admins can create profiles for same company"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Usuário pode criar seu próprio profile OU
    user_id = auth.uid()
    OR
    -- Admin pode criar profiles para a mesma company
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
  );

-- Policy: Usuário pode atualizar apenas seu próprio profile
-- Necessário para futuras funcionalidades de perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    -- Garantir que não pode mudar user_id ou company_id
    AND user_id = OLD.user_id
    AND company_id = OLD.company_id
  );

-- Policy: Admin pode atualizar profiles da mesma company
-- Necessário para updateUserRole() atualizar role de usuários
CREATE POLICY "Admins can update profiles from same company"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Usuário pode atualizar seu próprio profile OU
    user_id = auth.uid()
    OR
    -- Admin pode atualizar profiles da mesma company
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
  )
  WITH CHECK (
    -- Garantir que não pode mudar user_id ou company_id
    user_id = OLD.user_id
    AND company_id = OLD.company_id
    AND (
      -- Usuário pode atualizar seu próprio profile OU
      user_id = auth.uid()
      OR
      -- Admin pode atualizar profiles da mesma company
      company_id IN (
        SELECT company_id 
        FROM public.profiles 
        WHERE user_id = auth.uid() 
          AND role = 'admin'
      )
    )
  );

-- Policy: Admin pode deletar profiles da mesma company
-- Necessário para deleteUser() deletar usuários (via cascade do auth.users)
-- Nota: A deleção real ocorre via auth.admin.deleteUser() que faz cascade
-- Esta policy garante que admin pode ver/deletar profiles da mesma company
CREATE POLICY "Admins can delete profiles from same company"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    -- Usuário pode deletar seu próprio profile OU
    user_id = auth.uid()
    OR
    -- Admin pode deletar profiles da mesma company (mas não a si mesmo)
    (
      company_id IN (
        SELECT company_id 
        FROM public.profiles 
        WHERE user_id = auth.uid() 
          AND role = 'admin'
      )
      AND user_id != auth.uid() -- Não pode deletar a si mesmo
    )
  );
