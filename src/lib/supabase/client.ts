/**
 * Cliente Supabase para uso no lado do cliente (Client Components)
 * 
 * Utiliza createBrowserClient do @supabase/ssr para gerenciar
 * cookies de sessão automaticamente no navegador.
 * 
 * Uso: Importe e chame createClient() em qualquer Client Component
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variáveis de ambiente do Supabase não configuradas. ' +
      'Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidas em .env.local'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
