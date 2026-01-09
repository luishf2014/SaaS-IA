/**
 * Página de Login
 * 
 * Interface de autenticação usando Supabase Auth
 * Redireciona para /dashboard após login bem-sucedido
 * Redireciona para /dashboard se usuário já estiver autenticado
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const supabase = await createClient();

  // Verificar se já está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se já autenticado, redirecionar para dashboard
  if (user) {
    redirect('/dashboard');
  }

  // Renderizar formulário de login
  return <LoginForm />;
}
