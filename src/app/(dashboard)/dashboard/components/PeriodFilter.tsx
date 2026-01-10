/**
 * Componente de Filtro por Período
 * 
 * FASE 10: Dashboard Funcional
 * 
 * Client Component para filtrar dados por período
 */

'use client';

import { useState } from 'react';

type PeriodOption = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

interface PeriodFilterProps {
  onPeriodChange: (startDate: string, endDate: string) => void;
}

export default function PeriodFilter({ onPeriodChange }: PeriodFilterProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handlePeriodChange = (period: PeriodOption) => {
    setSelectedPeriod(period);

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    switch (period) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'last_3_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'last_6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        // Não fazer nada, aguardar input do usuário
        return;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    onPeriodChange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  };

  const handleCustomSubmit = () => {
    if (customStart && customEnd) {
      onPeriodChange(customStart, customEnd);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-slate-300">Período:</label>
        
        <select
          value={selectedPeriod}
          onChange={(e) => handlePeriodChange(e.target.value as PeriodOption)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="this_month">Este Mês</option>
          <option value="last_month">Mês Anterior</option>
          <option value="last_3_months">Últimos 3 Meses</option>
          <option value="last_6_months">Últimos 6 Meses</option>
          <option value="this_year">Este Ano</option>
          <option value="custom">Personalizado</option>
        </select>

        {selectedPeriod === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Data inicial"
            />
            <span className="text-slate-400">até</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Data final"
            />
            <button
              onClick={handleCustomSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
