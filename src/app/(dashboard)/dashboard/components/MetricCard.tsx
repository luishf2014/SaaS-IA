/**
 * Componente de Card de Métrica
 * 
 * FASE 10: Dashboard Funcional
 * 
 * Exibe uma métrica financeira com formatação adequada
 */

interface MetricCardProps {
  title: string;
  value: number;
  growth?: number;
  isPositive?: boolean;
  prefix?: string;
  suffix?: string;
}

export default function MetricCard({
  title,
  value,
  growth,
  isPositive,
  prefix = 'R$',
  suffix = '',
}: MetricCardProps) {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  const growthColor = growth !== undefined
    ? growth >= 0
      ? 'text-green-400'
      : 'text-red-400'
    : 'text-slate-400';

  const growthIcon = growth !== undefined && growth >= 0 ? '↑' : '↓';

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        {growth !== undefined && (
          <span className={`text-xs font-semibold ${growthColor}`}>
            {growthIcon} {Math.abs(growth).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">
          {prefix} {formattedValue}
        </span>
        {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
      </div>
      {isPositive !== undefined && (
        <div className="mt-2">
          <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? 'Lucro' : 'Prejuízo'}
          </span>
        </div>
      )}
    </div>
  );
}
