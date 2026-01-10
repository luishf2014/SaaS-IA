/**
 * Componente de Conteúdo de Insights
 * 
 * FASE 12: Inteligência Artificial Aplicada
 * 
 * Client Component que gerencia estado e filtros de período para insights.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateFinancialAnalysis } from '../actions';
import type { FinancialAnalysis } from '@/lib/ai/types';
import InsightCard from './InsightCard';
import PeriodFilter from '../../components/PeriodFilter';
// Ícones SVG inline (sem dependências externas)

interface InsightsContentProps {
  initialAnalysis: FinancialAnalysis | null;
  initialStartDate: string;
  initialEndDate: string;
}

export default function InsightsContent({
  initialAnalysis,
  initialStartDate,
  initialEndDate,
}: InsightsContentProps) {
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(initialAnalysis);
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAnalysis = await generateFinancialAnalysis(startDate, endDate);
      setAnalysis(fetchedAnalysis);
    } catch (err) {
      console.error('Failed to generate financial analysis:', err);
      setError('Não foi possível gerar a análise. Tente novamente.');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate !== initialStartDate || endDate !== initialEndDate) {
      fetchAnalysis();
    }
  }, [startDate, endDate, initialStartDate, initialEndDate, fetchAnalysis]);

  const handlePeriodChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const healthColors = {
    excellent: 'text-green-400',
    good: 'text-blue-400',
    moderate: 'text-yellow-400',
    poor: 'text-red-400',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  };

  return (
    <div className="space-y-6">
      <PeriodFilter
        onPeriodChange={handlePeriodChange}
      />

      {loading && (
        <div className="flex items-center justify-center p-12 bg-slate-900 rounded-xl border border-slate-800">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-blue-400">Gerando análise com IA...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center p-8 bg-red-950/50 border border-red-800 text-red-300 rounded-xl">
          <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && analysis && (
        <>
          {/* Resumo Executivo */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h2 className="text-xl font-bold text-white">Resumo Executivo</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">{analysis.summary}</p>
            <p className="text-xs text-slate-500 mt-4">
              Análise gerada em {new Date(analysis.generatedAt).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <p className="text-sm text-slate-400 mb-1">Margem de Lucro</p>
              <p className="text-2xl font-bold text-white">
                {analysis.keyMetrics.margin.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <p className="text-sm text-slate-400 mb-1">Tendência</p>
              <p className="text-2xl font-bold text-white">
                {trendIcons[analysis.keyMetrics.trend]} {analysis.keyMetrics.trend === 'up' ? 'Alta' : analysis.keyMetrics.trend === 'down' ? 'Queda' : 'Estável'}
              </p>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <p className="text-sm text-slate-400 mb-1">Saúde Financeira</p>
              <p className={`text-2xl font-bold ${healthColors[analysis.keyMetrics.health]}`}>
                {analysis.keyMetrics.health === 'excellent' ? 'Excelente' : 
                 analysis.keyMetrics.health === 'good' ? 'Boa' :
                 analysis.keyMetrics.health === 'moderate' ? 'Moderada' : 'Precária'}
              </p>
            </div>
          </div>

          {/* Insights */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Insights Principais</h2>
            <div className="space-y-4">
              {analysis.insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        </>
      )}

      {!loading && !error && !analysis && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
          <svg className="h-16 w-16 mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhuma análise disponível</h3>
          <p className="text-center">
            Não foi possível gerar análise para o período selecionado.
            Certifique-se de que há dados financeiros disponíveis.
          </p>
        </div>
      )}
    </div>
  );
}
