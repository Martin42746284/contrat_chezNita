import React from 'react';
import { ContractStatus } from '@/types/contract';
import { Clock, CheckCircle2, FileEdit } from 'lucide-react';

const statusConfig: Record<ContractStatus, { label: string; icon: React.ReactNode; className: string }> = {
  brouillon: {
    label: 'Brouillon',
    icon: <FileEdit size={16} />,
    className: 'bg-muted text-muted-foreground',
  },
  en_attente: {
    label: 'En attente',
    icon: <Clock size={16} />,
    className: 'bg-warning/15 text-warning-foreground border border-warning/30',
  },
  valide: {
    label: 'Validé',
    icon: <CheckCircle2 size={16} />,
    className: 'bg-success/15 text-success border border-success/30',
  },
};

const StatusBadge: React.FC<{ status: ContractStatus }> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
