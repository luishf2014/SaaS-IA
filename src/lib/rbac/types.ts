/**
 * Tipos e constantes para RBAC (Role-Based Access Control)
 * 
 * Fonte única da verdade para roles e permissões do sistema
 * Todas as definições de roles e permissões devem vir daqui
 */

/**
 * Roles disponíveis no sistema
 */
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Permissões disponíveis no sistema
 */
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  
  // Dados financeiros (futuro)
  FINANCIAL_DATA_VIEW: 'financial_data:view',
  FINANCIAL_DATA_CREATE: 'financial_data:create',
  FINANCIAL_DATA_UPDATE: 'financial_data:update',
  FINANCIAL_DATA_DELETE: 'financial_data:delete',
  
  // Upload CSV (futuro)
  CSV_UPLOAD: 'csv:upload',
  
  // IA
  AI_QUERY: 'ai:query',
  AI_ACCESS: 'ai:access', // Acesso a insights e análises com IA
  
  // Administração
  ADMIN_PANEL: 'admin:panel',
  USER_MANAGE: 'user:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Verificação de tipo para garantir que todas as permissões estão definidas
 */
export const ALL_PERMISSIONS: readonly Permission[] = Object.values(PERMISSIONS);
