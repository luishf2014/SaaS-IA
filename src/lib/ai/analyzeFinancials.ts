/**
 * Função Principal de Análise Financeira com IA
 * 
 * FASE 12: Inteligência Artificial Aplicada
 * 
 * Esta função integra com serviços de IA para gerar análises e insights.
 * Por enquanto, usa análise baseada em regras. Pode ser substituída por
 * chamada real de API de IA (OpenAI, Anthropic, etc.) no futuro.
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY.
 */

import 'server-only';

import type { FinancialContext, FinancialAnalysis, FinancialInsight } from './types';
import { buildAnalysisPrompt } from './prompts';

/**
 * Analisa dados financeiros e gera insights usando IA
 * 
 * @param context - Contexto financeiro com dados reais
 * @returns Análise financeira completa gerada pela IA
 */
export async function analyzeFinancials(context: FinancialContext): Promise<FinancialAnalysis> {
  // Por enquanto, usa análise baseada em regras
  // No futuro, pode ser substituída por chamada real de API de IA
  
  const insights: FinancialInsight[] = [];
  
  // Calcular margem
  const margin = context.currentPeriod.revenue > 0
    ? (context.currentPeriod.profit / context.currentPeriod.revenue) * 100
    : 0;

  // Analisar crescimento de receita
  if (context.growth.revenue > 10) {
    insights.push({
      type: 'positive',
      title: 'Crescimento de Receita Forte',
      description: `Sua receita cresceu ${context.growth.revenue.toFixed(1)}% em relação ao período anterior. Isso indica uma tendência positiva no negócio.`,
      recommendation: 'Considere reinvestir parte do crescimento em expansão ou melhoria de processos.',
    });
  } else if (context.growth.revenue < -10) {
    insights.push({
      type: 'negative',
      title: 'Queda Significativa na Receita',
      description: `Sua receita caiu ${Math.abs(context.growth.revenue).toFixed(1)}% em relação ao período anterior. É importante investigar as causas.`,
      recommendation: 'Analise fatores externos (sazonalidade, mercado) e internos (vendas, produtos) que podem ter impactado.',
    });
  }

  // Analisar crescimento de despesas
  if (context.growth.expenses > 20 && context.growth.revenue < context.growth.expenses) {
    insights.push({
      type: 'warning',
      title: 'Despesas Crescendo Mais que Receita',
      description: `Suas despesas cresceram ${context.growth.expenses.toFixed(1)}%, enquanto a receita cresceu ${context.growth.revenue.toFixed(1)}%. Isso pode comprometer a lucratividade.`,
      recommendation: 'Revise despesas operacionais e identifique oportunidades de otimização.',
    });
  }

  // Analisar lucro
  if (context.currentPeriod.profit < 0) {
    insights.push({
      type: 'negative',
      title: 'Prejuízo no Período',
      description: `O período atual apresentou prejuízo de R$ ${Math.abs(context.currentPeriod.profit).toFixed(2)}.`,
      recommendation: 'Avalie urgentemente redução de custos ou aumento de receita para reverter a situação.',
    });
  } else if (margin > 20) {
    insights.push({
      type: 'positive',
      title: 'Margem de Lucro Excelente',
      description: `Sua margem de lucro está em ${margin.toFixed(1)}%, o que é considerado excelente para a maioria dos negócios.`,
      recommendation: 'Considere estratégias de crescimento ou investimento com o capital disponível.',
    });
  } else if (margin < 5) {
    insights.push({
      type: 'warning',
      title: 'Margem de Lucro Baixa',
      description: `Sua margem de lucro está em ${margin.toFixed(1)}%, o que pode ser insuficiente para sustentar o negócio a longo prazo.`,
      recommendation: 'Analise oportunidades de aumentar receita ou reduzir custos para melhorar a margem.',
    });
  }

  // Analisar tendência
  if (context.monthlyData.length >= 3) {
    const recentMonths = context.monthlyData.slice(-3);
    const olderMonths = context.monthlyData.slice(-6, -3);
    
    if (olderMonths.length > 0) {
      const recentAvg = recentMonths.reduce((sum, m) => sum + m.revenue, 0) / recentMonths.length;
      const olderAvg = olderMonths.reduce((sum, m) => sum + m.revenue, 0) / olderMonths.length;
      
      if (recentAvg > olderAvg * 1.1) {
        insights.push({
          type: 'positive',
          title: 'Tendência de Alta Identificada',
          description: 'Os últimos meses mostram uma tendência de crescimento consistente na receita.',
          recommendation: 'Mantenha as estratégias que estão gerando resultados positivos.',
        });
      } else if (recentAvg < olderAvg * 0.9) {
        insights.push({
          type: 'warning',
          title: 'Tendência de Queda Identificada',
          description: 'Os últimos meses mostram uma tendência de queda na receita.',
          recommendation: 'Investigue causas e ajuste estratégias para reverter a tendência.',
        });
      }
    }
  }

  // Analisar melhor/pior mês
  if (context.statistics.bestMonth) {
    insights.push({
      type: 'info',
      title: 'Melhor Mês Identificado',
      description: `O mês de ${formatMonth(context.statistics.bestMonth.date)} foi o melhor em receita, com R$ ${context.statistics.bestMonth.revenue.toFixed(2)}.`,
      recommendation: 'Analise o que funcionou bem nesse período e tente replicar.',
    });
  }

  // Gerar resumo executivo
  const summary = generateSummary(context, margin, insights);

  // Determinar saúde financeira
  let health: 'excellent' | 'good' | 'moderate' | 'poor' = 'moderate';
  if (margin > 20 && context.growth.profit > 0 && context.currentPeriod.profit > 0) {
    health = 'excellent';
  } else if (margin > 10 && context.currentPeriod.profit > 0) {
    health = 'good';
  } else if (context.currentPeriod.profit < 0 || margin < 0) {
    health = 'poor';
  }

  // Determinar tendência
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (context.growth.revenue > 5 && context.growth.profit > 0) {
    trend = 'up';
  } else if (context.growth.revenue < -5 || context.growth.profit < -10) {
    trend = 'down';
  }

  return {
    summary,
    insights: insights.slice(0, 5), // Limitar a 5 insights principais
    keyMetrics: {
      margin,
      trend,
      health,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Gera resumo executivo baseado no contexto
 */
function generateSummary(context: FinancialContext, margin: number, insights: FinancialInsight[]): string {
  const parts: string[] = [];

  // Situação geral
  if (context.currentPeriod.profit > 0) {
    parts.push(`No período analisado, sua empresa apresentou lucro de R$ ${context.currentPeriod.profit.toFixed(2)}, com receita de R$ ${context.currentPeriod.revenue.toFixed(2)} e despesas de R$ ${context.currentPeriod.expenses.toFixed(2)}.`);
  } else {
    parts.push(`No período analisado, sua empresa apresentou prejuízo de R$ ${Math.abs(context.currentPeriod.profit).toFixed(2)}, com receita de R$ ${context.currentPeriod.revenue.toFixed(2)} e despesas de R$ ${context.currentPeriod.expenses.toFixed(2)}.`);
  }

  // Crescimento
  if (context.growth.revenue > 0) {
    parts.push(`A receita cresceu ${context.growth.revenue.toFixed(1)}% em relação ao período anterior, enquanto as despesas ${context.growth.expenses > 0 ? `cresceram ${context.growth.expenses.toFixed(1)}%` : `reduziram ${Math.abs(context.growth.expenses).toFixed(1)}%`}.`);
  } else {
    parts.push(`A receita reduziu ${Math.abs(context.growth.revenue).toFixed(1)}% em relação ao período anterior, enquanto as despesas ${context.growth.expenses > 0 ? `cresceram ${context.growth.expenses.toFixed(1)}%` : `reduziram ${Math.abs(context.growth.expenses).toFixed(1)}%`}.`);
  }

  // Margem
  parts.push(`A margem de lucro atual é de ${margin.toFixed(1)}%, ${margin > 15 ? 'indicando uma situação financeira saudável' : margin > 5 ? 'dentro de uma faixa moderada' : 'abaixo do ideal para sustentabilidade do negócio'}.`);

  return parts.join(' ');
}

/**
 * Formata mês para exibição (YYYY-MM -> "Janeiro 2024")
 */
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}
