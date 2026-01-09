/**
 * Funções para obter informações de role do usuário
 * 
 * FASE 5: RBAC Real Integrado ao Banco
 * 
 * Lê exclusivamente o campo profiles.role do banco de dados.
 * 
 * IMPORTANTE:
 * - RBAC nunca cria dados, apenas consome
 * - Se profile não existir, retorna null (acesso BLOQUEADO)
 * - Nenhum fallback automático (não assume 'user' ou qualquer valor default)
 * - null significa acesso BLOQUEADO em todas as verificações
 * 
 * FASE 6: SERVER-ONLY - Este módulo nunca deve ser importado em Client Components
 */

import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Role } from './types';
import { ROLES } from './types';
import { getUserProfile } from '../profile';

/**
 * Obtém o role do usuário autenticado
 * 
 * FASE 5: Lê exclusivamente profiles.role do banco de dados
 * 
 * Comportamento:
 * - Se profile não existir → retorna null (acesso BLOQUEADO)
 * - Se role não for válido → retorna null (acesso BLOQUEADO)
 * - Nenhum fallback ou valor default
 * 
 * @returns Role do usuário ou null se não autenticado, sem profile ou role inválido
 */
export async function getUserRole(): Promise<Role | null> {
  // Obter profile do banco (não cria, apenas lê)
  const userProfile = await getUserProfile();
  
  // Se não existir profile, retornar null (acesso BLOQUEADO)
  if (!userProfile) {
    return null;
  }

  const profileRole = userProfile.profile.role;

  // Validar explicitamente que o role pertence ao enum Role
  // O banco tem constraint CHECK, mas validamos aqui também para segurança
  if (profileRole === ROLES.ADMIN || profileRole === ROLES.USER) {
    return profileRole as Role;
  }

  // Role inválido → retornar null (acesso BLOQUEADO)
  // Log apenas para debug (não vaza dados sensíveis)
  console.warn('[RBAC] Role inválido encontrado no banco. Retornando null.');
  return null;
}

/**
 * Obtém o usuário autenticado e seu role
 * 
 * FASE 5: Retorna role real do banco de dados (profiles.role)
 * 
 * @returns Objeto com user e role, ou null se não autenticado, sem profile ou role inválido
 */
export async function getUserWithRole(): Promise<{
  user: { id: string; email: string | undefined };
  role: Role;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Obter role real do banco (pode retornar null se não existir profile)
  const role = await getUserRole();

  // Se role for null, retornar null (acesso BLOQUEADO)
  if (!role) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    role,
  };
}
