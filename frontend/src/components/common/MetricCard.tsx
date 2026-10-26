import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'critical';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'neutral',
  className = '',
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-emerald-400';
      case 'critical':
        return 'text-red-400';
      case 'negative':
        return 'text-amber-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div
      className={`glass-panel rounded-xl p-5 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 group relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-blue-400 group-hover:text-blue-300 transition-colors">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
        {trend && <span className={`text-xs font-medium ${getTrendColor()}`}>{trend}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
