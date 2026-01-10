/**
 * Cliente Supabase Admin para operações administrativas
 * 
 * FASE 7: CRUD Administrativo Seguro
 * 
 * Este cliente usa a Service Role Key para operações administrativas
 * que requerem privilégios elevados (criar/deletar usuários).
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY e nunca deve ser importado em Client Components.
 * A Service Role Key nunca deve ser exposta ao cliente.
 */

import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cria um cliente Supabase Admin usando Service Role Key
 * 
 * Este cliente tem privilégios elevados e pode:
 * - Criar/deletar usuários
 * - Bypass RLS (quando necessário)
 * 
 * Use apenas em Server Actions protegidas por RBAC.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL não configurada. Verifique .env.local'
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY não configurada. ' +
      'Esta chave é necessária para operações administrativas. ' +
      'Encontre-a em: Supabase Dashboard → Settings → API → service_role key'
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
