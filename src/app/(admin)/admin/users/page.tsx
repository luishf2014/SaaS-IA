/**
 * Página de Gestão de Usuários
 * 
 * FASE 7: CRUD Administrativo Seguro
 * 
 * Protegida por requireRoutePermission(PERMISSIONS.USER_MANAGE).
 * Apenas usuários com permissão USER_MANAGE podem acessar.
 * 
 * IMPORTANTE: Esta página apenas renderiza dados.
 * Toda lógica administrativa (leitura e escrita) ocorre em Server Actions.
 * 
 * Funcionalidades:
 * - Listar usuários (via getAdminUsers() Server Action)
 * - Criar novos usuários (via createUser() Server Action)
 * - Editar role de usuários (via updateUserRole() Server Action)
 * - Deletar usuários (via deleteUser() Server Action)
 * 
 * Todas as operações são protegidas por RBAC no server-side.
 */

import { redirect } from 'next/navigation';
import { requireRoutePermission, PERMISSIONS, getUserWithRole } from '@/lib/rbac';
import { getUserProfile } from '@/lib/profile';
import { signOut } from '@/app/(auth)/actions';
import Link from 'next/link';
import { getAdminUsers } from './actions';
import CreateUserForm from './CreateUserForm';
import UserActions from './UserActions';

export default async function AdminUsersPage() {
  // Proteger rota usando RBAC (server-side)
  await requireRoutePermission(PERMISSIONS.USER_MANAGE);

  // Obter dados do usuário para exibir na UI
  const userWithRole = await getUserWithRole();
  const userProfile = await getUserProfile();

  if (!userWithRole || !userProfile) {
    redirect('/dashboard');
  }

  // Obter lista de usuários via Server Action (única forma de ler dados administrativos)
  const adminUsers = await getAdminUsers();

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
        {/* Formulário de Criação */}
        <CreateUserForm />

        {/* Informações */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Usuários da Empresa
              </h2>
              <p className="text-slate-400 text-sm">
                Total de usuários: <span className="text-white font-semibold">{adminUsers.length}</span>
              </p>
            </div>
            <div className="px-4 py-2 bg-blue-950/50 border border-blue-800 rounded-lg">
              <span className="text-blue-400 text-sm font-semibold">
                {userProfile.company.name}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Usuários - FASE 9: Estado vazio melhorado */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {adminUsers.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhum usuário encontrado</h3>
              <p className="text-sm text-slate-500 mb-4">
                Crie o primeiro usuário da empresa usando o formulário acima.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      E-mail
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
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-blue-950/50 text-blue-400 border border-blue-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UserActions
                          profileId={user.id}
                          userId={user.userId}
                          currentRole={user.role}
                          userEmail={user.email}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
