/**
 * Server Actions para Análises com IA
 * 
 * FASE 12: Inteligência Artificial Aplicada
 * 
 * Todas as ações são protegidas por RBAC usando requirePermission().
 * Nenhuma análise ocorre antes da verificação de permissão.
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY e nunca deve ser importado em Client Components.
 */

'use server';

import 'server-only';

import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { buildFinancialContext } from '@/lib/ai/buildContext';
import { analyzeFinancials } from '@/lib/ai/analyzeFinancials';
import type { FinancialAnalysis } from '@/lib/ai/types';

/**
 * Gera análise financeira com IA para o período especificado
 * 
 * FASE 12: Server Action protegida por RBAC
 * 
 * @param startDate - Data de início do período (YYYY-MM-DD)
 * @param endDate - Data de fim do período (YYYY-MM-DD)
 * @returns Análise financeira gerada pela IA
 */
export async function generateFinancialAnalysis(
  startDate: string,
  endDate: string
): Promise<FinancialAnalysis> {
  // HARDENING: Verificar permissão ANTES de qualquer operação (PRIMEIRA LINHA)
  await requirePermission(PERMISSIONS.AI_ACCESS);

  try {
    // Construir contexto com dados reais (isolado por company_id)
    const context = await buildFinancialContext(startDate, endDate);

    // Gerar análise com IA
    const analysis = await analyzeFinancials(context);

    // AUDITORIA: Registrar ação
    console.log('[AI_ANALYSIS]', {
      action: 'GENERATE_FINANCIAL_ANALYSIS',
      startDate,
      endDate,
      timestamp: new Date().toISOString(),
    });

    return analysis;
  } catch (error) {
    console.error('[generateFinancialAnalysis] Erro:', error);
    throw new Error('Erro ao gerar análise financeira. Tente novamente.');
  }
}
