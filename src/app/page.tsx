/**
 * Página inicial da aplicação
 * 
 * Ponto central de entrada autenticada:
 * - Garante criação automática de company e profile (FASE 4)
 * - Redireciona baseado no estado de autenticação
 * 
 * Bootstrap de infraestrutura acontece aqui, não nas páginas individuais
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ensureUserProfile } from '@/lib/profile';

export default async function HomePage() {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se não autenticado, redirecionar para login
  if (!user) {
    redirect('/login');
  }

  // FASE 4: Garantir criação automática de company e profile
  // Isso acontece UMA VEZ, de forma idempotente, no ponto de entrada autenticada
  try {
    await ensureUserProfile();
  } catch (error) {
    // Se houver erro ao criar perfil, redirecionar para login
    // O usuário pode tentar novamente
    console.error('Erro ao garantir perfil:', error);
    redirect('/login');
  }

  // Redirecionar para dashboard após garantir infraestrutura
  redirect('/dashboard');
}
