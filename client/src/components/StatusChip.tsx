import React from 'react';
import { CircleDot, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { CaseStatus } from '../types';

interface StatusChipProps {
  status: CaseStatus | string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, className = '' }) => {
  const norm = (status || 'SUBMITTED').toUpperCase();

  const config: Record<
    string,
    { label: string; icon: any; bg: string; text: string; border: string }
  > = {
    SUBMITTED: {
      label: 'Open',
      icon: CircleDot,
      bg: '#EFF6FF',
      text: '#1D4ED8',
      border: '#BFDBFE',
    },
    UNDER_INSPECTION: {
      label: 'Under inspection',
      icon: Clock,
      bg: '#F5F3FF',
      text: '#6D28D9',
      border: '#DDD6FE',
    },
    IN_PROGRESS: {
      label: 'In progress',
      icon: Clock,
      bg: '#FFFBEB',
      text: '#B45309',
      border: '#FDE68A',
    },
    RESOLVED: {
      label: 'Resolved',
      icon: CheckCircle2,
      bg: '#F0FDF4',
      text: '#15803D',
      border: '#BBF7D0',
    },
    REOPENED: {
      label: 'Reopened',
      icon: RotateCcw,
      bg: '#FFF1F2',
      text: '#BE123C',
      border: '#FECDD3',
    },
  };

  const current = config[norm] || config.SUBMITTED;
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight border transition-colors shadow-2xs ${className}`}
      style={{
        backgroundColor: current.bg,
        color: current.text,
        borderColor: current.border,
      }}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0 stroke-[2.2]" />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusChip;
