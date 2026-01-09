/**
 * Server Actions para autenticação
 * 
 * Gerencia registro, login e logout usando Supabase Auth
 * Todas as operações são server-side e usam cookies HTTP-only
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signUp(email: string, password: string) {
  const supabase = await createClient();

  // Validação básica
  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter no mínimo 6 caracteres' };
  }

  // Registrar usuário
  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Revalidar e redirecionar
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  // Validação básica
  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  // Fazer login
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Revalidar e redirecionar
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();

  // Fazer logout
  await supabase.auth.signOut();

  // Revalidar e redirecionar
  revalidatePath('/', 'layout');
  redirect('/login');
}
