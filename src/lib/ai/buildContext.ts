/**
 * Construtor de Contexto Financeiro para IA
 * 
 * FASE 12: Inteligência Artificial Aplicada
 * 
 * Monta contexto estruturado com dados reais do banco para análise pela IA.
 * Todos os dados são agregados e isolados por company_id.
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY.
 */

import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/profile';
import type { FinancialContext } from './types';

/**
 * Constrói contexto financeiro agregado para análise pela IA
 * 
 * @param startDate - Data de início do período atual (YYYY-MM-DD)
 * @param endDate - Data de fim do período atual (YYYY-MM-DD)
 * @returns Contexto financeiro estruturado
 */
export async function buildFinancialContext(
  startDate: string,
  endDate: string
): Promise<FinancialContext> {
  const supabase = await createClient();
  const userProfile = await getUserProfile();

  if (!userProfile?.company?.id) {
    throw new Error('Perfil do usuário não encontrado.');
  }

  const companyId = userProfile.company.id;

  // Calcular período anterior (mesmo tamanho do período atual)
  const currentStart = new Date(startDate);
  const currentEnd = new Date(endDate);
  const diffTime = currentEnd.getTime() - currentStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - diffDays);

  // Buscar dados do período atual
  const { data: currentSales, error: salesError } = await supabase
    .from('sales')
    .select('amount, sale_date')
    .eq('company_id', companyId)
    .gte('sale_date', startDate)
    .lte('sale_date', endDate);

  if (salesError) {
    console.error('[buildFinancialContext] Erro ao buscar vendas:', salesError);
    throw new Error('Erro ao buscar dados de vendas.');
  }

  const { data: currentExpenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount, expense_date')
    .eq('company_id', companyId)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate);

  if (expensesError) {
    console.error('[buildFinancialContext] Erro ao buscar despesas:', expensesError);
    throw new Error('Erro ao buscar dados de despesas.');
  }

  // Buscar dados do período anterior
  const { data: previousSales } = await supabase
    .from('sales')
    .select('amount, sale_date')
    .eq('company_id', companyId)
    .gte('sale_date', previousStart.toISOString().split('T')[0])
    .lte('sale_date', previousEnd.toISOString().split('T')[0]);

  const { data: previousExpenses } = await supabase
    .from('expenses')
    .select('amount, expense_date')
    .eq('company_id', companyId)
    .gte('expense_date', previousStart.toISOString().split('T')[0])
    .lte('expense_date', previousEnd.toISOString().split('T')[0]);

  // Calcular totais do período atual
  const currentRevenue = (currentSales || []).reduce(
    (sum, sale) => sum + parseFloat(sale.amount as any),
    0
  );
  const currentExpensesTotal = (currentExpenses || []).reduce(
    (sum, expense) => sum + parseFloat(expense.amount as any),
    0
  );
  const currentProfit = currentRevenue - currentExpensesTotal;

  // Calcular totais do período anterior
  const previousRevenue = (previousSales || []).reduce(
    (sum, sale) => sum + parseFloat(sale.amount as any),
    0
  );
  const previousExpensesTotal = (previousExpenses || []).reduce(
    (sum, expense) => sum + parseFloat(expense.amount as any),
    0
  );
  const previousProfit = previousRevenue - previousExpensesTotal;

  // Calcular crescimentos percentuais
  const revenueGrowth = previousRevenue === 0
    ? (currentRevenue > 0 ? 100 : 0)
    : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  
  const expensesGrowth = previousExpensesTotal === 0
    ? (currentExpensesTotal > 0 ? 100 : 0)
    : ((currentExpensesTotal - previousExpensesTotal) / previousExpensesTotal) * 100;
  
  const profitGrowth = previousProfit === 0
    ? (currentProfit > 0 ? 100 : (currentProfit < 0 ? -100 : 0))
    : ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100;

  // Buscar dados mensais para análise de tendência (últimos 12 meses)
  const twelveMonthsAgo = new Date(currentEnd);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const { data: monthlySales } = await supabase
    .from('sales')
    .select('amount, sale_date')
    .eq('company_id', companyId)
    .gte('sale_date', twelveMonthsAgo.toISOString().split('T')[0])
    .lte('sale_date', endDate)
    .order('sale_date', { ascending: true });

  const { data: monthlyExpenses } = await supabase
    .from('expenses')
    .select('amount, expense_date')
    .eq('company_id', companyId)
    .gte('expense_date', twelveMonthsAgo.toISOString().split('T')[0])
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: true });

  // Agregar por mês
  const monthlyMap = new Map<string, { revenue: number; expenses: number }>();

  (monthlySales || []).forEach(sale => {
    const month = (sale.sale_date as string).substring(0, 7); // YYYY-MM
    const current = monthlyMap.get(month) || { revenue: 0, expenses: 0 };
    current.revenue += parseFloat(sale.amount as any);
    monthlyMap.set(month, current);
  });

  (monthlyExpenses || []).forEach(expense => {
    const month = (expense.expense_date as string).substring(0, 7); // YYYY-MM
    const current = monthlyMap.get(month) || { revenue: 0, expenses: 0 };
    current.expenses += parseFloat(expense.amount as any);
    monthlyMap.set(month, current);
  });

  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Calcular estatísticas
  const totalMonths = monthlyData.length;
  const averageMonthlyRevenue = totalMonths > 0
    ? monthlyData.reduce((sum, m) => sum + m.revenue, 0) / totalMonths
    : 0;
  const averageMonthlyExpenses = totalMonths > 0
    ? monthlyData.reduce((sum, m) => sum + m.expenses, 0) / totalMonths
    : 0;

  const bestMonth = monthlyData.length > 0
    ? monthlyData.reduce((best, current) => 
        current.revenue > best.revenue ? current : best
      )
    : null;

  const worstMonth = monthlyData.length > 0
    ? monthlyData.reduce((worst, current) => 
        current.profit < worst.profit ? current : worst
      )
    : null;

  return {
    currentPeriod: {
      revenue: currentRevenue,
      expenses: currentExpensesTotal,
      profit: currentProfit,
      startDate,
      endDate,
    },
    previousPeriod: {
      revenue: previousRevenue,
      expenses: previousExpensesTotal,
      profit: previousProfit,
      startDate: previousStart.toISOString().split('T')[0],
      endDate: previousEnd.toISOString().split('T')[0],
    },
    growth: {
      revenue: revenueGrowth,
      expenses: expensesGrowth,
      profit: profitGrowth,
    },
    statistics: {
      averageMonthlyRevenue,
      averageMonthlyExpenses,
      bestMonth: bestMonth ? {
        date: bestMonth.month,
        revenue: bestMonth.revenue,
      } : null,
      worstMonth: worstMonth ? {
        date: worstMonth.month,
        profit: worstMonth.profit,
      } : null,
      totalMonths,
    },
    monthlyData,
  };
}
