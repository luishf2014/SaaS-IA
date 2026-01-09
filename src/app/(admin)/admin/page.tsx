/**
 * Página Administrativa Principal
 * 
 * FASE 6: UI Administrativa Baseada em RBAC
 * 
 * Protegida por requireRoutePermission(PERMISSIONS.ADMIN_PANEL).
 * Apenas usuários com role 'admin' podem acessar.
 * UI apenas consome decisões do RBAC, nunca cria regras de acesso.
 */

import { redirect } from 'next/navigation';
import { requireRoutePermission, PERMISSIONS, getUserWithRole } from '@/lib/rbac';
import { getUserProfile } from '@/lib/profile';
import { signOut } from '@/app/(auth)/actions';
import Link from 'next/link';

export default async function AdminPage() {
  // Proteger rota usando RBAC (server-side)
  await requireRoutePermission(PERMISSIONS.ADMIN_PANEL);

  // Obter dados do usuário para exibir na UI
  const userWithRole = await getUserWithRole();
  const userProfile = await getUserProfile();

  if (!userWithRole || !userProfile) {
    // Se não tiver dados, redirecionar (não deve acontecer devido ao requireRoutePermission)
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
                <p className="text-sm text-slate-400">
                  Área administrativa do sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
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
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações do Admin */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Bem-vindo, {userWithRole.user.email}!
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">
                  Role: <span className="text-blue-400 font-mono">{userWithRole.role}</span>
                </span>
                <span className="text-slate-500">
                  Empresa: <span className="text-slate-300">{userProfile.company.name}</span>
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-blue-950/50 border border-blue-800 rounded-lg">
              <span className="text-blue-400 text-sm font-semibold">Administrador</span>
            </div>
          </div>
        </div>

        {/* Cards de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gestão de Usuários */}
          <Link
            href="/admin/users"
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-blue-600 transition-colors group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-950/50 border border-blue-800 rounded-lg flex items-center justify-center group-hover:bg-blue-900/50 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Gestão de Usuários
                </h3>
                <p className="text-sm text-slate-400">
                  Gerenciar usuários do sistema
                </p>
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              Visualizar e gerenciar usuários e suas permissões
            </p>
          </Link>

          {/* Estatísticas Administrativas */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-950/50 border border-purple-800 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Estatísticas
                </h3>
                <p className="text-sm text-slate-400">
                  Indicadores do sistema
                </p>
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              Métricas e estatísticas administrativas (em desenvolvimento)
            </p>
          </div>

          {/* Configurações */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-950/50 border border-green-800 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Configurações
                </h3>
                <p className="text-sm text-slate-400">
                  Configurações do sistema
                </p>
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              Configurações administrativas (em desenvolvimento)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
