/**
 * FASE 10 — DASHBOARD COM DADOS REAIS
 * 
 * Server Actions do Dashboard
 * 
 * FASE 10: Dashboard Funcional (Dados Reais — EM VALIDAÇÃO)
 * 
 * Estas Server Actions assumem:
 * - Schema financeiro BASE (evolutivo)
 * - Dados manuais ou iniciais
 * 
 * A FASE 11 poderá alterar a origem dos dados (CSV),
 * sem quebrar estas actions.
 * 
 * Todas as ações são protegidas por RBAC usando requirePermission().
 * Nenhuma leitura ocorre antes da verificação de permissão.
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY e nunca deve ser importado em Client Components.
 */

'use server';

import 'server-only';

import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/profile';

/**
 * DTO para métricas financeiras
 */
export type FinancialMetrics = {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  revenueThisMonth: number;
  expensesThisMonth: number;
  profitThisMonth: number;
  revenueLastMonth: number;
  expensesLastMonth: number;
  profitLastMonth: number;
  revenueGrowth: number; // Percentual de crescimento
  expensesGrowth: number; // Percentual de crescimento
};

/**
 * DTO para dados de vendas por período
 */
export type SalesData = {
  date: string;
  amount: number;
};

/**
 * DTO para dados de despesas por período
 */
export type ExpensesData = {
  date: string;
  amount: number;
  category?: string;
};

/**
 * Obtém métricas financeiras da empresa do usuário autenticado
 * 
 * FASE 10: Server Action protegida por RBAC
 * 
 * Requer permissão FINANCIAL_DATA_VIEW.
 * Retorna métricas agregadas respeitando RLS.
 */
export async function getFinancialMetrics(
  startDate?: string,
  endDate?: string
): Promise<FinancialMetrics> {
  // HARDENING: Verificar permissão ANTES de qualquer operação (PRIMEIRA LINHA)
  await requirePermission(PERMISSIONS.FINANCIAL_DATA_VIEW);

  try {
    const supabase = await createClient();

    // Obter company do usuário autenticado
    const userProfile = await getUserProfile();
    if (!userProfile?.company?.id) {
      throw new Error('Empresa não encontrada');
    }

    const companyId = userProfile.company.id;

    // Calcular datas do mês atual e anterior
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Usar datas fornecidas ou padrão (todos os dados)
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Buscar vendas totais
    let salesQuery = supabase
      .from('sales')
      .select('amount, sale_date')
      .eq('company_id', companyId);

    if (start) {
      salesQuery = salesQuery.gte('sale_date', start.toISOString().split('T')[0]);
    }
    if (end) {
      salesQuery = salesQuery.lte('sale_date', end.toISOString().split('T')[0]);
    }

    const { data: sales, error: salesError } = await salesQuery;

    if (salesError) {
      console.error('[getFinancialMetrics] Erro ao buscar vendas:', salesError);
      throw new Error('Erro ao buscar dados de vendas');
    }

    // Buscar despesas totais
    let expensesQuery = supabase
      .from('expenses')
      .select('amount, expense_date')
      .eq('company_id', companyId);

    if (start) {
      expensesQuery = expensesQuery.gte('expense_date', start.toISOString().split('T')[0]);
    }
    if (end) {
      expensesQuery = expensesQuery.lte('expense_date', end.toISOString().split('T')[0]);
    }

    const { data: expenses, error: expensesError } = await expensesQuery;

    if (expensesError) {
      console.error('[getFinancialMetrics] Erro ao buscar despesas:', expensesError);
      throw new Error('Erro ao buscar dados de despesas');
    }

    // Calcular totais (período filtrado ou todos)
    const totalRevenue = (sales || []).reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    const totalExpenses = (expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const profit = totalRevenue - totalExpenses;

    // Buscar vendas do mês atual
    const { data: salesThisMonth } = await supabase
      .from('sales')
      .select('amount')
      .eq('company_id', companyId)
      .gte('sale_date', currentMonthStart.toISOString().split('T')[0])
      .lte('sale_date', currentMonthEnd.toISOString().split('T')[0]);

    const revenueThisMonth = (salesThisMonth || []).reduce((sum, sale) => sum + Number(sale.amount || 0), 0);

    // Buscar despesas do mês atual
    const { data: expensesThisMonth } = await supabase
      .from('expenses')
      .select('amount')
      .eq('company_id', companyId)
      .gte('expense_date', currentMonthStart.toISOString().split('T')[0])
      .lte('expense_date', currentMonthEnd.toISOString().split('T')[0]);

    const expensesThisMonthTotal = (expensesThisMonth || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const profitThisMonth = revenueThisMonth - expensesThisMonthTotal;

    // Buscar vendas do mês anterior
    const { data: salesLastMonth } = await supabase
      .from('sales')
      .select('amount')
      .eq('company_id', companyId)
      .gte('sale_date', lastMonthStart.toISOString().split('T')[0])
      .lte('sale_date', lastMonthEnd.toISOString().split('T')[0]);

    const revenueLastMonth = (salesLastMonth || []).reduce((sum, sale) => sum + Number(sale.amount || 0), 0);

    // Buscar despesas do mês anterior
    const { data: expensesLastMonth } = await supabase
      .from('expenses')
      .select('amount')
      .eq('company_id', companyId)
      .gte('expense_date', lastMonthStart.toISOString().split('T')[0])
      .lte('expense_date', lastMonthEnd.toISOString().split('T')[0]);

    const expensesLastMonthTotal = (expensesLastMonth || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const profitLastMonth = revenueLastMonth - expensesLastMonthTotal;

    // Calcular crescimento percentual
    const revenueGrowth = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : revenueThisMonth > 0 ? 100 : 0;

    const expensesGrowth = expensesLastMonthTotal > 0
      ? ((expensesThisMonthTotal - expensesLastMonthTotal) / expensesLastMonthTotal) * 100
      : expensesThisMonthTotal > 0 ? 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      profit,
      revenueThisMonth,
      expensesThisMonth: expensesThisMonthTotal,
      profitThisMonth,
      revenueLastMonth,
      expensesLastMonth: expensesLastMonthTotal,
      profitLastMonth,
      revenueGrowth: Number(revenueGrowth.toFixed(2)),
      expensesGrowth: Number(expensesGrowth.toFixed(2)),
    };
  } catch (error) {
    console.error('[getFinancialMetrics] Erro inesperado:', error);
    throw error;
  }
}

/**
 * Obtém dados de vendas por período para gráficos
 * 
 * FASE 10: Server Action protegida por RBAC
 */
export async function getSalesData(
  startDate: string,
  endDate: string
): Promise<SalesData[]> {
  // HARDENING: Verificar permissão ANTES de qualquer operação
  await requirePermission(PERMISSIONS.FINANCIAL_DATA_VIEW);

  try {
    const supabase = await createClient();

    const userProfile = await getUserProfile();
    if (!userProfile?.company?.id) {
      return [];
    }

    const { data: sales, error } = await supabase
      .from('sales')
      .select('amount, sale_date')
      .eq('company_id', userProfile.company.id)
      .gte('sale_date', startDate)
      .lte('sale_date', endDate)
      .order('sale_date', { ascending: true });

    if (error) {
      console.error('[getSalesData] Erro:', error);
      return [];
    }

    return (sales || []).map((sale) => ({
      date: sale.sale_date,
      amount: Number(sale.amount || 0),
    }));
  } catch (error) {
    console.error('[getSalesData] Erro inesperado:', error);
    return [];
  }
}

/**
 * Obtém dados de despesas por período para gráficos
 * 
 * FASE 10: Server Action protegida por RBAC
 */
export async function getExpensesData(
  startDate: string,
  endDate: string
): Promise<ExpensesData[]> {
  // HARDENING: Verificar permissão ANTES de qualquer operação
  await requirePermission(PERMISSIONS.FINANCIAL_DATA_VIEW);

  try {
    const supabase = await createClient();

    const userProfile = await getUserProfile();
    if (!userProfile?.company?.id) {
      return [];
    }

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('amount, expense_date, category')
      .eq('company_id', userProfile.company.id)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: true });

    if (error) {
      console.error('[getExpensesData] Erro:', error);
      return [];
    }

    return (expenses || []).map((expense) => ({
      date: expense.expense_date,
      amount: Number(expense.amount || 0),
      category: expense.category || undefined,
    }));
  } catch (error) {
    console.error('[getExpensesData] Erro inesperado:', error);
    return [];
  }
}
