import { IssueCategory, IssueSeverity, IssueStatus, PriorityLevel } from '../types';

export const ADMIN_CONFIG = {
  EMAIL: 'sanjanadhere61@gmail.com',
  NAME: 'Sanjana Dhere (Chief Admin)',
  ROLE: 'admin' as const,
};

export const ISSUE_CATEGORIES: {
  id: IssueCategory;
  label: string;
  emoji: string;
  iconName: string;
  description: string;
  defaultSeverity: IssueSeverity;
}[] = [
  {
    id: 'pothole',
    label: 'Pothole & Road Hazard',
    emoji: '🕳️',
    iconName: 'CircleDot',
    description: 'Damaged asphalt, craters, or road depressions',
    defaultSeverity: 'high',
  },
  {
    id: 'streetlight',
    label: 'Broken Streetlight',
    emoji: '💡',
    iconName: 'Lightbulb',
    description: 'Non-functional or flickering public lighting',
    defaultSeverity: 'medium',
  },
  {
    id: 'garbage',
    label: 'Garbage & Waste',
    emoji: '🗑️',
    iconName: 'Trash2',
    description: 'Overflowing dumpsters or illegal trash dumping',
    defaultSeverity: 'medium',
  },
  {
    id: 'water_leak',
    label: 'Water Pipe Leakage',
    emoji: '💧',
    iconName: 'Droplets',
    description: 'Burst pipelines or flooded pedestrian walkways',
    defaultSeverity: 'high',
  },
  {
    id: 'traffic',
    label: 'Traffic & Signals',
    emoji: '🚦',
    iconName: 'Car',
    description: 'Faulty traffic signals or hazardous gridlock',
    defaultSeverity: 'critical',
  },
  {
    id: 'tree',
    label: 'Fallen Tree / Branches',
    emoji: '🌳',
    iconName: 'Trees',
    description: 'Blocked lanes or dangerous hanging limbs',
    defaultSeverity: 'high',
  },
  {
    id: 'electrical',
    label: 'Electrical Danger',
    emoji: '⚡',
    iconName: 'Zap',
    description: 'Exposed live wiring or spark hazards',
    defaultSeverity: 'critical',
  },
  {
    id: 'other',
    label: 'Other Civic Issue',
    emoji: '📌',
    iconName: 'AlertCircle',
    description: 'Public property damages, noise, or other concerns',
    defaultSeverity: 'low',
  },
];

export const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; color: string; bg: string; border: string; step: number; description: string }
> = {
  'Submitted': {
    label: 'Submitted',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    step: 1,
    description: 'Issue reported and registered in the dispatch queue.',
  },
  'Under Review': {
    label: 'Under Review',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    step: 2,
    description: 'Civic triage officer is analyzing location & priority.',
  },
  'Verified': {
    label: 'Verified',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    step: 3,
    description: 'Report validated by municipal dispatch center.',
  },
  'Assigned': {
    label: 'Assigned',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    step: 4,
    description: 'Dispatched to civic maintenance response team.',
  },
  'Work Started': {
    label: 'Work Started',
    color: 'text-amber-300',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
    step: 5,
    description: 'Maintenance crew on-site conducting active repairs.',
  },
  'Resolved': {
    label: 'Resolved',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    step: 6,
    description: 'Repair completed and verified with photographic proof.',
  },
  'Closed': {
    label: 'Closed',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    step: 7,
    description: 'Report successfully archived with citizen feedback.',
  },
  'Rejected': {
    label: 'Rejected',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    step: -1,
    description: 'Invalid report or out of municipal jurisdiction.',
  },
  'Duplicate': {
    label: 'Duplicate',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    step: -1,
    description: 'Merged with an existing active civic ticket.',
  },
};

export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  low: {
    label: 'Low Priority',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
  },
  medium: {
    label: 'Medium Priority',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
  },
  high: {
    label: 'High Priority',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20',
  },
  critical: {
    label: 'Critical Priority',
    color: 'text-rose-400',
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/50',
    glow: 'shadow-rose-500/30',
  },
};
