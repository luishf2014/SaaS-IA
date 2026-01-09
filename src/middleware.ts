/**
 * Middleware de proteção de rotas
 * 
 * Responsabilidade ÚNICA: bloquear acesso a rotas privadas sem autenticação
 * 
 * NÃO faz:
 * - Redirecionamentos de UX (usuários autenticados em /login)
 * - Decisões de fluxo de navegação
 * - Busca de dados no banco além da verificação de sessão
 * 
 * Apenas faz:
 * - Permite acesso a rotas públicas
 * - Redireciona usuários NÃO autenticados que tentam acessar rotas privadas
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rotas privadas (requerem autenticação)
  const isPrivateRoute = pathname.startsWith('/dashboard');

  // ÚNICA responsabilidade: bloquear acesso a rotas privadas sem autenticação
  if (isPrivateRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Permitir acesso a todas as outras rotas (públicas ou privadas com autenticação)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
