/**
 * Definições de tipos TypeScript para o sistema
 * Tipos serão adicionados conforme necessário em cada fase
 */

// Tipos de RBAC (FASE 4)
export type { Role, Permission } from './rbac';
export { ROLES, PERMISSIONS } from './rbac';

// Tipos serão adicionados progressivamente:
// - FASE 3: User, Session ✅
// - FASE 4: RBAC (Role, Permission) ✅
// - FASE 5: Profile, Company
// - FASE 6: Transaction, FinancialData
// - FASE 7: CSVData
