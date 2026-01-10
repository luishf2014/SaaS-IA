/**
 * FASE 10 — SCHEMA BASE (EVOLUTIVO)
 * 
 * Migração FASE 10: Tabelas de Dados Financeiros
 * 
 * FASE 10: Dashboard Funcional (Dados Reais — EM VALIDAÇÃO)
 * 
 * ⚠️ IMPORTANTE:
 * Este schema representa uma BASE FUNCIONAL para o Dashboard.
 * Ele NÃO é considerado final.
 * 
 * A FASE 11 (Upload CSV) poderá:
 * - Adicionar colunas
 * - Criar tabelas auxiliares
 * - Normalizar categorias
 * - Ajustar índices
 * 
 * Nenhuma dependência externa deve assumir este schema como definitivo.
 * 
 * Cria tabelas para armazenar dados financeiros reais:
 * - sales (vendas)
 * - expenses (despesas)
 * 
 * Todas as tabelas respeitam isolamento multi-tenant via company_id.
 * Row Level Security (RLS) garante que usuários só vejam dados da própria empresa.
 * 
 * Esta migração é idempotente e pode ser executada múltiplas vezes.
 */

-- ============================================
-- TABELA SALES (VENDAS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para sales
CREATE INDEX IF NOT EXISTS sales_company_id_idx ON public.sales(company_id);
CREATE INDEX IF NOT EXISTS sales_sale_date_idx ON public.sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS sales_created_at_idx ON public.sales(created_at DESC);

-- ============================================
-- TABELA EXPENSES (DESPESAS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para expenses
CREATE INDEX IF NOT EXISTS expenses_company_id_idx ON public.expenses(company_id);
CREATE INDEX IF NOT EXISTS expenses_expense_date_idx ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON public.expenses(category);
CREATE INDEX IF NOT EXISTS expenses_created_at_idx ON public.expenses(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas financeiras
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES RLS PARA SALES
-- ============================================

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Users can view sales from own company" ON public.sales;
DROP POLICY IF EXISTS "Users can create sales for own company" ON public.sales;
DROP POLICY IF EXISTS "Users can update sales from own company" ON public.sales;
DROP POLICY IF EXISTS "Users can delete sales from own company" ON public.sales;

-- Policy: Usuário pode ver vendas da própria empresa
CREATE POLICY "Users can view sales from own company"
  ON public.sales
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Usuário pode criar vendas para a própria empresa
CREATE POLICY "Users can create sales for own company"
  ON public.sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Usuário pode atualizar vendas da própria empresa
CREATE POLICY "Users can update sales from own company"
  ON public.sales
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
    AND company_id = OLD.company_id -- Não pode mudar company_id
  );

-- Policy: Usuário pode deletar vendas da própria empresa
CREATE POLICY "Users can delete sales from own company"
  ON public.sales
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- POLICIES RLS PARA EXPENSES
-- ============================================

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Users can view expenses from own company" ON public.expenses;
DROP POLICY IF EXISTS "Users can create expenses for own company" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses from own company" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses from own company" ON public.expenses;

-- Policy: Usuário pode ver despesas da própria empresa
CREATE POLICY "Users can view expenses from own company"
  ON public.expenses
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Usuário pode criar despesas para a própria empresa
CREATE POLICY "Users can create expenses for own company"
  ON public.expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Usuário pode atualizar despesas da própria empresa
CREATE POLICY "Users can update expenses from own company"
  ON public.expenses
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
    AND company_id = OLD.company_id -- Não pode mudar company_id
  );

-- Policy: Usuário pode deletar despesas da própria empresa
CREATE POLICY "Users can delete expenses from own company"
  ON public.expenses
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
