/**
 * Página Dashboard Principal
 * 
 * FASE 10: Dashboard Funcional (Dados Reais)
 * 
 * Dashboard protegido que requer autenticação e permissão DASHBOARD_VIEW.
 * Exibe métricas financeiras reais do banco de dados.
 * 
 * IMPORTANTE: Toda lógica de dados ocorre em Server Actions.
 * Esta página apenas renderiza dados retornados.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/(auth)/actions';
import { requireRoutePermission, checkPermission, PERMISSIONS } from '@/lib/rbac';
import { getUserProfile } from '@/lib/profile';
import Link from 'next/link';
import { getFinancialMetrics } from './actions';
import DashboardContent from './components/DashboardContent';

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

  // Obter perfil do usuário
  const userProfile = await getUserProfile();
  
  if (!userProfile) {
    redirect('/');
  }

  // Obter métricas financeiras (sem filtro de período - mostra todos os dados)
  let metrics;
  try {
    metrics = await getFinancialMetrics();
  } catch (error) {
    console.error('[DashboardPage] Erro ao buscar métricas:', error);
    metrics = {
      totalRevenue: 0,
      totalExpenses: 0,
      profit: 0,
      revenueThisMonth: 0,
      expensesThisMonth: 0,
      profitThisMonth: 0,
      revenueLastMonth: 0,
      expensesLastMonth: 0,
      profitLastMonth: 0,
      revenueGrowth: 0,
      expensesGrowth: 0,
    };
  }

  // FASE 6: Verificar permissão para mostrar link administrativo (apenas UI)
  const hasAdminAccess = await checkPermission(PERMISSIONS.ADMIN_PANEL);
  
  // FASE 11: Verificar permissão para mostrar link de importação (apenas UI)
  const hasImportAccess = await checkPermission(PERMISSIONS.CSV_UPLOAD);

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
            <div className="flex items-center gap-4">
              {hasImportAccess && (
                <Link
                  href="/dashboard/import"
                  className="px-4 py-2 text-sm font-medium text-green-400 hover:text-green-300 hover:bg-slate-800 rounded-lg transition-colors border border-green-800"
                >
                  Importar CSV
                </Link>
              )}
              {hasAdminAccess && (
                <Link
                  href="/admin"
                  className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors border border-blue-800"
                >
                  Admin
                </Link>
              )}
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
        {/* Informações da Empresa */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {userProfile.company.name}
              </h2>
              <p className="text-sm text-slate-400">
                {user.email} • {userProfile.profile.role}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content (Client Component com filtros) */}
        <DashboardContent initialMetrics={metrics} />
      </main>
    </div>
  );
}
