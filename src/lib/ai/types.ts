/**
 * Tipos para a camada de IA
 * 
 * FASE 12: Inteligência Artificial Aplicada
 * 
 * Tipos TypeScript para análises financeiras e insights gerados por IA.
 */

/**
 * Contexto financeiro agregado para análise pela IA
 */
export type FinancialContext = {
  // Período atual
  currentPeriod: {
    revenue: number;
    expenses: number;
    profit: number;
    startDate: string;
    endDate: string;
  };
  
  // Período anterior (comparativo)
  previousPeriod: {
    revenue: number;
    expenses: number;
    profit: number;
    startDate: string;
    endDate: string;
  };
  
  // Crescimentos percentuais
  growth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  
  // Estatísticas adicionais
  statistics: {
    averageMonthlyRevenue: number;
    averageMonthlyExpenses: number;
    bestMonth: {
      date: string;
      revenue: number;
    } | null;
    worstMonth: {
      date: string;
      profit: number;
    } | null;
    totalMonths: number;
  };
  
  // Dados mensais para análise de tendência
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
};

/**
 * Insight gerado pela IA
 */
export type FinancialInsight = {
  type: 'positive' | 'warning' | 'info' | 'negative';
  title: string;
  description: string;
  recommendation?: string;
};

/**
 * Análise financeira completa gerada pela IA
 */
export type FinancialAnalysis = {
  summary: string;
  insights: FinancialInsight[];
  keyMetrics: {
    margin: number; // Margem percentual
    trend: 'up' | 'down' | 'stable';
    health: 'excellent' | 'good' | 'moderate' | 'poor';
  };
  generatedAt: string;
};
