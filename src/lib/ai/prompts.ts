/**
 * Prompts Padronizados para IA
 * 
 * FASE 12: Inteligência Artificial Aplicada
 * 
 * Prompts versionados e padronizados para análise financeira.
 * Estes prompts são enviados para a IA junto com dados reais do banco.
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY.
 */

import 'server-only';

import type { FinancialContext } from './types';

/**
 * Versão atual dos prompts (para controle de versão)
 */
export const PROMPT_VERSION = '1.0.0';

/**
 * Constrói prompt para análise financeira completa
 * 
 * @param context - Contexto financeiro com dados reais
 * @returns Prompt formatado para a IA
 */
export function buildAnalysisPrompt(context: FinancialContext): string {
  return `Você é um analista financeiro especializado em Business Intelligence para pequenas e médias empresas.

Analise os dados financeiros abaixo e gere insights claros, acionáveis e em linguagem simples para gestores não técnicos.

DADOS FINANCEIROS:

Período Atual (${context.currentPeriod.startDate} a ${context.currentPeriod.endDate}):
- Receita: R$ ${context.currentPeriod.revenue.toFixed(2)}
- Despesas: R$ ${context.currentPeriod.expenses.toFixed(2)}
- Lucro: R$ ${context.currentPeriod.profit.toFixed(2)}

Período Anterior (${context.previousPeriod.startDate} a ${context.previousPeriod.endDate}):
- Receita: R$ ${context.previousPeriod.revenue.toFixed(2)}
- Despesas: R$ ${context.previousPeriod.expenses.toFixed(2)}
- Lucro: R$ ${context.previousPeriod.profit.toFixed(2)}

Crescimento Percentual:
- Receita: ${context.growth.revenue.toFixed(2)}%
- Despesas: ${context.growth.expenses.toFixed(2)}%
- Lucro: ${context.growth.profit.toFixed(2)}%

Estatísticas Históricas (últimos ${context.statistics.totalMonths} meses):
- Receita média mensal: R$ ${context.statistics.averageMonthlyRevenue.toFixed(2)}
- Despesas médias mensais: R$ ${context.statistics.averageMonthlyExpenses.toFixed(2)}
${context.statistics.bestMonth ? `- Melhor mês (${context.statistics.bestMonth.date}): R$ ${context.statistics.bestMonth.revenue.toFixed(2)}` : ''}
${context.statistics.worstMonth ? `- Pior mês em lucro (${context.statistics.worstMonth.date}): R$ ${context.statistics.worstMonth.profit.toFixed(2)}` : ''}

INSTRUÇÕES:

1. Gere um resumo executivo (2-3 parágrafos) explicando a situação financeira atual de forma clara e objetiva.

2. Identifique e liste 3-5 insights principais, cada um com:
   - Tipo: positivo, aviso, informação ou negativo
   - Título claro (máximo 50 caracteres)
   - Descrição explicativa (2-3 frases)
   - Recomendação acionável (quando aplicável)

3. Analise tendências e padrões nos dados mensais.

4. Use linguagem simples, sem jargão técnico excessivo.

5. Seja específico com números e percentuais quando relevante.

6. Foque em insights acionáveis que ajudem na tomada de decisão.

IMPORTANTE:
- Baseie-se APENAS nos dados fornecidos
- Não invente ou assuma dados que não foram fornecidos
- Seja honesto sobre limitações dos dados
- Use formato JSON estruturado para a resposta

Formato de resposta esperado (JSON):
{
  "summary": "Resumo executivo em 2-3 parágrafos",
  "insights": [
    {
      "type": "positive|warning|info|negative",
      "title": "Título do insight",
      "description": "Descrição detalhada",
      "recommendation": "Recomendação acionável (opcional)"
    }
  ],
  "keyMetrics": {
    "margin": 0.0,
    "trend": "up|down|stable",
    "health": "excellent|good|moderate|poor"
  }
}`;
}

/**
 * Constrói prompt simplificado para análise rápida
 * 
 * @param context - Contexto financeiro com dados reais
 * @returns Prompt formatado para análise rápida
 */
export function buildQuickAnalysisPrompt(context: FinancialContext): string {
  return `Analise rapidamente os dados financeiros e gere um resumo de 1 parágrafo.

Receita atual: R$ ${context.currentPeriod.revenue.toFixed(2)}
Despesas atuais: R$ ${context.currentPeriod.expenses.toFixed(2)}
Lucro atual: R$ ${context.currentPeriod.profit.toFixed(2)}
Crescimento receita: ${context.growth.revenue.toFixed(2)}%
Crescimento despesas: ${context.growth.expenses.toFixed(2)}%

Gere um resumo claro e objetivo em português brasileiro.`;
}
