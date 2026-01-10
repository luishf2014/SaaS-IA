/**
 * Mapeamento de Roles para Permissões
 * 
 * Define quais permissões cada role possui
 * Esta é a fonte única da verdade para mapeamento role → permissões
 */

import type { Role, Permission } from './types';
import { ROLES, PERMISSIONS } from './types';

/**
 * Mapa de permissões por role
 * Cada role possui um array de permissões que possui
 */
const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.ADMIN]: [
    // Admin tem todas as permissões
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.FINANCIAL_DATA_VIEW,
    PERMISSIONS.FINANCIAL_DATA_CREATE,
    PERMISSIONS.FINANCIAL_DATA_UPDATE,
    PERMISSIONS.FINANCIAL_DATA_DELETE,
    PERMISSIONS.CSV_UPLOAD,
    PERMISSIONS.AI_QUERY,
    PERMISSIONS.AI_ACCESS,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.USER_MANAGE,
  ],
  [ROLES.USER]: [
    // User tem permissões básicas
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.FINANCIAL_DATA_VIEW,
    PERMISSIONS.CSV_UPLOAD,
    PERMISSIONS.AI_QUERY,
    PERMISSIONS.AI_ACCESS,
  ],
};

/**
 * Verifica se um role possui uma permissão específica
 * 
 * @param role - Role do usuário
 * @param permission - Permissão a verificar
 * @returns true se o role possui a permissão, false caso contrário
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions.includes(permission);
}

/**
 * Retorna todas as permissões de um role
 * 
 * @param role - Role do usuário
 * @returns Array de permissões do role
 */
export function getRolePermissions(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Verifica se um role possui todas as permissões necessárias
 * 
 * @param role - Role do usuário
 * @param requiredPermissions - Array de permissões necessárias
 * @returns true se o role possui todas as permissões, false caso contrário
 */
export function roleHasAllPermissions(
  role: Role,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((permission) =>
    roleHasPermission(role, permission)
  );
}

/**
 * Verifica se um role possui pelo menos uma das permissões necessárias
 * 
 * @param role - Role do usuário
 * @param requiredPermissions - Array de permissões (OR lógico)
 * @returns true se o role possui pelo menos uma permissão, false caso contrário
 */
export function roleHasAnyPermission(
  role: Role,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((permission) =>
    roleHasPermission(role, permission)
  );
}
