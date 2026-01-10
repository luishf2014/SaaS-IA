/**
 * Página de Importação de Dados via CSV
 * 
 * FASE 11: Upload e Ingestão de Dados (CSV)
 * 
 * Protegida por requireRoutePermission(PERMISSIONS.CSV_UPLOAD).
 * Apenas usuários com permissão CSV_UPLOAD podem acessar.
 * 
 * IMPORTANTE: Esta página apenas renderiza o formulário.
 * Toda lógica de importação ocorre em Server Actions.
 */

import { redirect } from 'next/navigation';
import { requireRoutePermission, PERMISSIONS } from '@/lib/rbac';
import { getUserProfile } from '@/lib/profile';
import { signOut } from '@/app/(auth)/actions';
import Link from 'next/link';
import ImportForm from './ImportForm';

export default async function ImportPage() {
  // Proteger rota usando RBAC (server-side)
  await requireRoutePermission(PERMISSIONS.CSV_UPLOAD);

  // Obter perfil do usuário para exibir informações
  const userProfile = await getUserProfile();
  
  if (!userProfile) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-slate-400 hover:text-white transition-colors"
              >
                ← Voltar ao Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Importar Dados</h1>
                <p className="text-sm text-slate-400">
                  Importe vendas e despesas via CSV
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações da Empresa */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {userProfile.company.name}
              </h2>
              <p className="text-sm text-slate-400">
                Os dados importados serão vinculados exclusivamente à sua empresa
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Importação */}
        <ImportForm />
      </main>
    </div>
  );
}
