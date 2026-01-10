/**
 * Página de Insights com IA
 * 
 * FASE 12: Inteligência Artificial Aplicada
 * 
 * Protegida por requireRoutePermission(PERMISSIONS.AI_ACCESS).
 * Apenas usuários com permissão AI_ACCESS podem acessar.
 * 
 * IMPORTANTE: Esta página apenas renderiza dados retornados pela IA.
 * Toda lógica de análise ocorre em Server Actions.
 */

import { redirect } from 'next/navigation';
import { requireRoutePermission, PERMISSIONS } from '@/lib/rbac';
import { getUserProfile } from '@/lib/profile';
import { signOut } from '@/app/(auth)/actions';
import Link from 'next/link';
import { generateFinancialAnalysis } from './actions';
import InsightsContent from './components/InsightsContent';
// Funções auxiliares para manipulação de datas (sem dependências externas)
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function InsightsPage() {
  // Proteger rota usando RBAC (server-side)
  await requireRoutePermission(PERMISSIONS.AI_ACCESS);

  // Obter perfil do usuário
  const userProfile = await getUserProfile();
  
  if (!userProfile) {
    redirect('/dashboard');
  }

  // Obter período padrão (mês atual)
  const now = new Date();
  const startDate = formatDate(startOfMonth(now));
  const endDate = formatDate(endOfMonth(now));

  // Gerar análise inicial
  let analysis;
  try {
    analysis = await generateFinancialAnalysis(startDate, endDate);
  } catch (error) {
    console.error('[InsightsPage] Erro ao gerar análise:', error);
    analysis = null;
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
                <h1 className="text-2xl font-bold text-white">Insights com IA</h1>
                <p className="text-sm text-slate-400">
                  Análises inteligentes dos seus dados financeiros
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
        <InsightsContent initialAnalysis={analysis} initialStartDate={startDate} initialEndDate={endDate} />
      </main>
    </div>
  );
}
