import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { CivicSeverity } from '../types';

interface SeverityBadgeProps {
  severity: CivicSeverity | string;
  className?: string;
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  className = '',
  showIcon = true,
}) => {
  const norm = (severity || 'LOW').toUpperCase();

  const config: Record<
    string,
    { label: string; icon: any; bg: string; text: string; border: string; glow?: boolean }
  > = {
    CRITICAL: {
      label: 'Critical',
      icon: ShieldAlert,
      bg: '#FFF1F2',
      text: '#BE123C',
      border: '#FECDD3',
      glow: true,
    },
    HIGH: {
      label: 'High',
      icon: AlertTriangle,
      bg: '#FFF7ED',
      text: '#C2410C',
      border: '#FED7AA',
    },
    MEDIUM: {
      label: 'Medium',
      icon: AlertCircle,
      bg: '#FFFBEB',
      text: '#B45309',
      border: '#FDE68A',
    },
    LOW: {
      label: 'Low',
      icon: Info,
      bg: '#F0FDF4',
      text: '#15803D',
      border: '#BBF7D0',
    },
  };

  const current = config[norm] || config.LOW;
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight border transition-colors shadow-2xs ${
        current.glow ? 'critical-glow' : ''
      } ${className}`}
      style={{
        backgroundColor: current.bg,
        color: current.text,
        borderColor: current.border,
      }}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 flex-shrink-0 stroke-[2.2]" />}
      <span>{current.label}</span>
    </span>
  );
};

export default SeverityBadge;
