/**
 * Cliente Supabase para uso no servidor (Server Components e Server Actions)
 * 
 * Utiliza createServerClient do @supabase/ssr para gerenciar
 * cookies de sessão em requisições server-side.
 * 
 * Uso:
 * - Em Server Components: await createClient()
 * - Em Server Actions: await createClient()
 * 
 * O cliente lê e escreve cookies automaticamente para manter a sessão.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variáveis de ambiente do Supabase não configuradas. ' +
      'Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidas em .env.local'
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Pode ocorrer em Server Actions quando a resposta já foi enviada
          // Ignoramos silenciosamente neste caso
        }
      },
    },
  });
}
