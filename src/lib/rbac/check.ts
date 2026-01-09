/**
 * Funções de verificação de permissões
 * 
 * Funções helper para verificar permissões em Server Components e Server Actions
 * Todas as verificações de permissão devem usar estas funções
 */

import { getUserRole } from './user';
import { roleHasPermission, roleHasAllPermissions, roleHasAnyPermission } from './permissions';
import type { Permission } from './types';

/**
 * Verifica se o usuário autenticado possui uma permissão específica
 * 
 * FASE 5: Usa role real do banco de dados (profiles.role)
 * 
 * Comportamento:
 * - Se role === null → retorna false (acesso BLOQUEADO)
 * - Se role não tiver permissão → retorna false
 * - Apenas retorna true se role válido E tiver permissão
 * 
 * @param permission - Permissão a verificar
 * @returns true se o usuário possui a permissão, false caso contrário
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const role = await getUserRole();
  
  // Se role for null, acesso BLOQUEADO (sem fallback)
  if (!role) {
    return false;
  }

  return roleHasPermission(role, permission);
}

/**
 * Verifica se o usuário autenticado possui todas as permissões necessárias
 * 
 * @param permissions - Array de permissões necessárias (AND lógico)
 * @returns true se o usuário possui todas as permissões, false caso contrário
 */
export async function checkAllPermissions(permissions: Permission[]): Promise<boolean> {
  const role = await getUserRole();
  
  if (!role) {
    return false;
  }

  return roleHasAllPermissions(role, permissions);
}

/**
 * Verifica se o usuário autenticado possui pelo menos uma das permissões necessárias
 * 
 * @param permissions - Array de permissões (OR lógico)
 * @returns true se o usuário possui pelo menos uma permissão, false caso contrário
 */
export async function checkAnyPermission(permissions: Permission[]): Promise<boolean> {
  const role = await getUserRole();
  
  if (!role) {
    return false;
  }

  return roleHasAnyPermission(role, permissions);
}

/**
 * Verifica permissão e lança erro se não tiver acesso
 * 
 * FASE 5: Usa role real do banco de dados
 * 
 * Útil para Server Actions que precisam garantir permissão antes de executar.
 * 
 * Comportamento:
 * - Se role === null → lança erro (acesso BLOQUEADO)
 * - Se role não tiver permissão → lança erro
 * 
 * @param permission - Permissão necessária
 * @throws Error se o usuário não possui a permissão ou não tem profile
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const hasPermission = await checkPermission(permission);
  
  if (!hasPermission) {
    throw new Error('Você não tem permissão para realizar esta ação');
  }
}

/**
 * Verifica múltiplas permissões e lança erro se não tiver acesso
 * 
 * @param permissions - Array de permissões necessárias (AND lógico)
 * @throws Error se o usuário não possui todas as permissões
 */
export async function requireAllPermissions(permissions: Permission[]): Promise<void> {
  const hasPermissions = await checkAllPermissions(permissions);
  
  if (!hasPermissions) {
    throw new Error('Você não tem permissão para realizar esta ação');
  }
}
