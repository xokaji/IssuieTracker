import clsx from 'clsx'
import type { IssuePriority, IssueSeverity, IssueStatus, IssueType } from '../../types'

const statusConfig: Record<IssueStatus, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' },
  'in-progress': { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  resolved: { label: 'Resolved', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
}

const priorityConfig: Record<IssuePriority, { label: string; cls: string }> = {
  low: { label: 'Low', cls: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
  medium: { label: 'Medium', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  high: { label: 'High', cls: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
  critical: { label: 'Critical', cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
}

const severityConfig: Record<IssueSeverity, { label: string; cls: string }> = {
  minor: { label: 'Minor', cls: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
  moderate: { label: 'Moderate', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  major: { label: 'Major', cls: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
  critical: { label: 'Critical', cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
}

const typeConfig: Record<IssueType, { label: string; cls: string }> = {
  bug: { label: 'Bug', cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
  feature: { label: 'Feature', cls: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' },
  improvement: { label: 'Improvement', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  task: { label: 'Task', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  question: { label: 'Question', cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', className)}>{children}</span>
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  const config = statusConfig[status]
  return <Badge className={config.cls}>{config.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const config = priorityConfig[priority]
  return <Badge className={config.cls}>{config.label}</Badge>
}

export function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  const config = severityConfig[severity]
  return <Badge className={config.cls}>{config.label}</Badge>
}

export function TypeBadge({ type }: { type: IssueType }) {
  const config = typeConfig[type]
  return <Badge className={config.cls}>{config.label}</Badge>
}
