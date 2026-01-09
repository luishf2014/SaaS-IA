/**
 * Componentes de UI baseados em RBAC
 * 
 * FASE 6: UI Administrativa Baseada em RBAC
 * 
 * IMPORTANTE: Estes componentes apenas controlam VISIBILIDADE na UI.
 * Eles NUNCA garantem segurança. A segurança real sempre ocorre no server-side.
 * 
 * Use estes componentes para mostrar/esconder elementos na UI baseado em permissões,
 * mas sempre proteja rotas e ações no server-side usando requireRoutePermission() e requirePermission().
 * 
 * FASE 6: SERVER-ONLY - Este módulo nunca deve ser importado em Client Components
 */

import 'server-only';

import { checkPermission } from './check';
import type { Permission } from './types';
import { ReactNode } from 'react';

/**
 * Props para componentes de UI baseados em permissão
 */
interface PermissionBasedUIProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente que renderiza children apenas se o usuário tiver a permissão
 * 
 * FASE 6: Usa checkPermission() no server-side para decidir renderização
 * 
 * IMPORTANTE: Este componente apenas controla VISIBILIDADE.
 * A segurança real deve ser garantida no server-side (requireRoutePermission).
 * 
 * @param permission - Permissão necessária para renderizar children
 * @param children - Conteúdo a ser renderizado se tiver permissão
 * @param fallback - Conteúdo alternativo se não tiver permissão (opcional)
 */
export async function IfHasPermission({
  permission,
  children,
  fallback = null,
}: PermissionBasedUIProps) {
  const hasPermission = await checkPermission(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
