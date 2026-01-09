/**
 * Página Dashboard Principal
 * 
 * Dashboard protegido que requer autenticação e permissão DASHBOARD_VIEW
 * Redireciona para /login se usuário não estiver autenticado
 * Verifica permissão usando RBAC centralizado
 * 
 * FASE 4: Dashboard apenas CONSOME dados já existentes (não cria infraestrutura)
 * O bootstrap de company/profile acontece em src/app/page.tsx
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/(auth)/actions';
import { requireRoutePermission } from '@/lib/rbac';
import { PERMISSIONS } from '@/lib/rbac';
import { getUserProfile } from '@/lib/profile';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se não houver usuário, redirecionar para login
  if (!user) {
    redirect('/login');
  }

  // Verificar permissão usando RBAC
  await requireRoutePermission(PERMISSIONS.DASHBOARD_VIEW);

  // FASE 4: Apenas consumir dados existentes (não criar)
  // O bootstrap acontece em src/app/page.tsx antes de chegar aqui
  const userProfile = await getUserProfile();
  
  if (!userProfile) {
    // Se não existir perfil, redirecionar para página inicial
    // que garantirá a criação antes de redirecionar novamente
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-slate-400">
                Inteligência de Negócios com IA
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Bem-vindo, {user.email}!
            </h2>
            <div className="space-y-2 mb-4">
              <p className="text-slate-500 text-sm">
                Role: <span className="text-slate-300 font-mono">{userProfile.profile.role}</span>
              </p>
              <p className="text-slate-500 text-sm">
                Empresa: <span className="text-slate-300">{userProfile.company.name}</span>
              </p>
            </div>
            <p className="text-slate-400">
              Seu dashboard está pronto. Funcionalidades serão adicionadas nas próximas fases.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
