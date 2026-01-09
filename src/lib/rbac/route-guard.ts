/**
 * Route Guards para Server Components
 * 
 * Funções helper para proteger rotas baseadas em permissões
 * Use estas funções em Server Components para verificar acesso antes de renderizar
 */

import { redirect } from 'next/navigation';
import { checkPermission, checkAnyPermission } from './check';
import type { Permission } from './types';

/**
 * Verifica se o usuário possui permissão para acessar uma rota
 * Redireciona para /dashboard se não tiver permissão
 * 
 * @param permission - Permissão necessária para acessar a rota
 * @throws Redirect se o usuário não possui a permissão
 */
export async function requireRoutePermission(permission: Permission): Promise<void> {
  const hasPermission = await checkPermission(permission);
  
  if (!hasPermission) {
    // Redireciona para dashboard (ou página de acesso negado no futuro)
    redirect('/dashboard');
  }
}

/**
 * Verifica se o usuário possui pelo menos uma das permissões para acessar uma rota
 * 
 * @param permissions - Array de permissões (OR lógico)
 * @throws Redirect se o usuário não possui nenhuma das permissões
 */
export async function requireAnyRoutePermission(permissions: Permission[]): Promise<void> {
  const hasPermission = await checkAnyPermission(permissions);
  
  if (!hasPermission) {
    redirect('/dashboard');
  }
}
