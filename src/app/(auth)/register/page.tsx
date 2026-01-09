/**
 * Página de Registro
 * 
 * Interface de cadastro usando Supabase Auth
 * Redireciona para /dashboard após registro bem-sucedido
 * Redireciona para /dashboard se usuário já estiver autenticado
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RegisterForm from './RegisterForm';

export default async function RegisterPage() {
  const supabase = await createClient();

  // Verificar se já está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se já autenticado, redirecionar para dashboard
  if (user) {
    redirect('/dashboard');
  }

  // Renderizar formulário de registro
  return <RegisterForm />;
}
