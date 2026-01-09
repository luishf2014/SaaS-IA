/**
 * Exportações centralizadas do módulo RBAC
 * 
 * Importe tudo relacionado a RBAC a partir daqui
 */

// Types
export type { Role, Permission } from './types';
export { ROLES, PERMISSIONS } from './types';

// Permissions
export {
  roleHasPermission,
  getRolePermissions,
  roleHasAllPermissions,
  roleHasAnyPermission,
} from './permissions';

// User
export { getUserRole, getUserWithRole } from './user';

// Check
export {
  checkPermission,
  checkAllPermissions,
  checkAnyPermission,
  requirePermission,
  requireAllPermissions,
} from './check';

// Route Guards
export {
  requireRoutePermission,
  requireAnyRoutePermission,
} from './route-guard';

// UI Components (FASE 6)
export { IfHasPermission } from './ui';
