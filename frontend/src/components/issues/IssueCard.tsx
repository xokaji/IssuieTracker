import { Calendar, MessageSquare, User2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import type { Issue } from '../../types'
import { PriorityBadge, StatusBadge, TypeBadge } from '../ui/Badges'

interface IssueCardProps {
  issue: Issue
}

export default function IssueCard({ issue }: IssueCardProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/issues/${issue._id}`)}
      className="card w-full text-left transition-transform hover:-translate-y-0.5"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={issue.status} />
        <PriorityBadge priority={issue.priority} />
        <TypeBadge type={issue.type} />
        <span className="ml-auto text-xs font-semibold text-slate-400">#{issue._id.slice(-6)}</span>
      </div>

      <h3 className="mb-2 line-clamp-2 text-base font-bold text-slate-900">{issue.title}</h3>

      <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm text-slate-600">
        {issue.description?.trim() || 'No description provided.'}
      </p>

      {issue.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {issue.tags.slice(0, 4).map(tag => (
            <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {tag}
            </span>
          ))}
          {issue.tags.length > 4 && <span className="text-xs text-slate-500">+{issue.tags.length - 4} more</span>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <User2 size={13} />
            {issue.reporter?.name || 'Unknown'}
          </span>
          {issue.assignee && <span className="inline-flex items-center gap-1 text-brand-700">Assigned: {issue.assignee.name}</span>}
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <MessageSquare size={13} />
            {issue.comments.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} />
            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </button>
  )
}
