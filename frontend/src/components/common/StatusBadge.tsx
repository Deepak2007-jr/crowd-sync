import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'critical':
      case 'blocked':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'moderate':
      case 'medium':
      case 'under review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'low':
      case 'resolved':
      case 'completed':
      case 'safe':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'active':
      case 'ongoing':
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-600/40';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3.5 py-1 text-sm font-semibold';
      case 'md':
      default:
        return 'px-2.5 py-0.5 text-xs font-medium';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${getColors()} ${getSize()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      {status}
    </span>
  );
};
