/**
 * Página de Gestão de Usuários
 * 
 * FASE 6: UI Administrativa Baseada em RBAC
 * 
 * Protegida por requireRoutePermission(PERMISSIONS.USER_MANAGE).
 * Apenas usuários com permissão USER_MANAGE podem acessar.
 * 
 * Esta página apenas lê dados (não cria ou modifica nesta fase).
 */

import { redirect } from 'next/navigation';
import { requireRoutePermission, PERMISSIONS, getUserWithRole } from '@/lib/rbac';
import { getUserProfile } from '@/lib/profile';
import { signOut } from '@/app/(auth)/actions';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminUsersPage() {
  // Proteger rota usando RBAC (server-side)
  await requireRoutePermission(PERMISSIONS.USER_MANAGE);

  // Obter dados do usuário para exibir na UI
  const userWithRole = await getUserWithRole();
  const userProfile = await getUserProfile();

  if (!userWithRole || !userProfile) {
    redirect('/dashboard');
  }

  // Obter lista de usuários da mesma empresa (apenas leitura)
  const supabase = await createClient();
  const { data: companyProfiles, error } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('company_id', userProfile.company.id)
    .order('created_at', { ascending: false });

  // Se houver erro ou não houver perfis, mostrar mensagem
  const profiles = companyProfiles || [];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-slate-400 hover:text-white transition-colors"
              >
                ← Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Gestão de Usuários</h1>
                <p className="text-sm text-slate-400">
                  Gerenciar usuários da empresa
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Admin
              </Link>
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
        {/* Informações */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Usuários da Empresa
              </h2>
              <p className="text-slate-400 text-sm">
                Total de usuários: <span className="text-white font-semibold">{profiles.length}</span>
              </p>
            </div>
            <div className="px-4 py-2 bg-blue-950/50 border border-blue-800 rounded-lg">
              <span className="text-blue-400 text-sm font-semibold">
                {userProfile.company.name}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {profiles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {profiles.map((profile: any) => (
                    <tr key={profile.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-slate-300">
                          {profile.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            profile.role === 'admin'
                              ? 'bg-blue-950/50 text-blue-400 border border-blue-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-slate-500 italic">
                          Ações em desenvolvimento
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Nota sobre Funcionalidades Futuras */}
        <div className="mt-6 bg-blue-950/20 border border-blue-800/50 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            <strong>Nota:</strong> Esta é uma visualização básica. Funcionalidades de criação,
            edição e exclusão de usuários serão implementadas nas próximas fases.
          </p>
        </div>
      </main>
    </div>
  );
}
