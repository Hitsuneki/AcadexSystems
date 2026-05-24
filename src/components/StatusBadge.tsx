import React from 'react';
import { Badge } from './Badge';
import { ACCENT, SEMANTIC } from '@/constants/colors';

type StatusType = 'active' | 'completed' | 'cancelled' | 'uploading';

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: SEMANTIC.green, bg: SEMANTIC.greenDim },
  completed: { label: 'Completed', color: ACCENT.signal, bg: ACCENT.signalDim },
  cancelled: { label: 'Cancelled', color: SEMANTIC.red, bg: SEMANTIC.redDim },
  uploading: { label: 'Uploading', color: SEMANTIC.amber, bg: SEMANTIC.amberDim },
};

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color, bg } = STATUS_CONFIG[status];
  return <Badge label={label} color={color} bg={bg} />;
}
