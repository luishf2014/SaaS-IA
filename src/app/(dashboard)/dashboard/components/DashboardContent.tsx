/**
 * Componente Principal do Dashboard
 * 
 * FASE 10: Dashboard Funcional
 * 
 * Client Component que gerencia filtros e exibe métricas
 */

'use client';

import { useState, useEffect } from 'react';
import { getFinancialMetrics, type FinancialMetrics } from '../actions';
import MetricCard from './MetricCard';
import PeriodFilter from './PeriodFilter';

interface DashboardContentProps {
  initialMetrics: FinancialMetrics;
}

export default function DashboardContent({ initialMetrics }: DashboardContentProps) {
  const [metrics, setMetrics] = useState<FinancialMetrics>(initialMetrics);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Inicializar com mês atual
  useEffect(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    setStartDate(currentMonthStart.toISOString().split('T')[0]);
    setEndDate(currentMonthEnd.toISOString().split('T')[0]);
  }, []);

  const handlePeriodChange = async (newStartDate: string, newEndDate: string) => {
    setLoading(true);
    setStartDate(newStartDate);
    setEndDate(newEndDate);

    try {
      const newMetrics = await getFinancialMetrics(newStartDate, newEndDate);
      setMetrics(newMetrics);
    } catch (error) {
      console.error('[DashboardContent] Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <PeriodFilter onPeriodChange={handlePeriodChange} />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-slate-400">Carregando dados...</p>
        </div>
      )}

      {/* Métricas Principais */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Receita Total"
              value={metrics.totalRevenue}
              growth={metrics.revenueGrowth}
              isPositive={metrics.totalRevenue >= 0}
            />
            <MetricCard
              title="Despesas Totais"
              value={metrics.totalExpenses}
              growth={metrics.expensesGrowth}
              isPositive={false}
            />
            <MetricCard
              title="Lucro Total"
              value={metrics.profit}
              isPositive={metrics.profit >= 0}
            />
            <MetricCard
              title="Lucro Este Mês"
              value={metrics.profitThisMonth}
              isPositive={metrics.profitThisMonth >= 0}
            />
          </div>

          {/* Comparativo Mensal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Este Mês</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Receita</span>
                  <span className="text-green-400 font-semibold">
                    R$ {metrics.revenueThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Despesas</span>
                  <span className="text-red-400 font-semibold">
                    R$ {metrics.expensesThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <span className="text-slate-300 font-medium">Lucro</span>
                  <span className={`font-bold ${metrics.profitThisMonth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {metrics.profitThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Mês Anterior</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Receita</span>
                  <span className="text-green-400 font-semibold">
                    R$ {metrics.revenueLastMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Despesas</span>
                  <span className="text-red-400 font-semibold">
                    R$ {metrics.expensesLastMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <span className="text-slate-300 font-medium">Lucro</span>
                  <span className={`font-bold ${metrics.profitLastMonth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {metrics.profitLastMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estado Vazio */}
          {metrics.totalRevenue === 0 && metrics.totalExpenses === 0 && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhum dado financeiro encontrado</h3>
              <p className="text-slate-500 text-sm">
                Adicione vendas e despesas para ver suas métricas aqui.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
