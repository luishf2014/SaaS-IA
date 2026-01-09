/**
 * Server Actions do Dashboard
 * 
 * Exemplo de Server Actions protegidas por RBAC
 * Todas as ações devem verificar permissões antes de executar
 */

'use server';

import { requirePermission } from '@/lib/rbac';
import { PERMISSIONS } from '@/lib/rbac';

/**
 * Exemplo de ação protegida por permissão
 * 
 * Esta ação requer permissão FINANCIAL_DATA_VIEW
 * Se o usuário não tiver a permissão, lança erro
 */
export async function viewFinancialData() {
  // Verificar permissão antes de executar
  await requirePermission(PERMISSIONS.FINANCIAL_DATA_VIEW);

  // Lógica da ação aqui
  // Por enquanto, apenas retorna sucesso
  return { success: true, message: 'Dados financeiros acessados com sucesso' };
}

/**
 * Exemplo de ação que requer múltiplas permissões
 * 
 * Esta ação requer permissões FINANCIAL_DATA_CREATE e FINANCIAL_DATA_UPDATE
 */
export async function createFinancialData(data: unknown) {
  // Verificar múltiplas permissões
  await requirePermission(PERMISSIONS.FINANCIAL_DATA_CREATE);
  await requirePermission(PERMISSIONS.FINANCIAL_DATA_UPDATE);

  // Lógica da ação aqui
  return { success: true, message: 'Dados financeiros criados com sucesso' };
}
