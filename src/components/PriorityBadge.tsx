import React from 'react';
import { Badge } from './Badge';
import { PRIORITY_COLORS } from '@/constants/colors';
import type { Priority } from '@/types';

const LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { text, bg } = PRIORITY_COLORS[priority];
  return <Badge label={LABELS[priority]} color={text} bg={bg} />;
}
