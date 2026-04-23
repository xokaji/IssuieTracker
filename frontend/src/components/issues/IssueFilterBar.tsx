import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { IssueFilters } from '../../types'

interface FiltersProps {
  filters: IssueFilters
  onChange: (filters: Partial<IssueFilters>) => void
  onReset: () => void
}

export default function IssueFilterBar({ filters, onChange, onReset }: FiltersProps) {
  const hasActiveFilters = Boolean(filters.search || filters.status || filters.priority || filters.type)

  return (
    <div className="surface p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="relative md:col-span-2 xl:col-span-2">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9 pr-9"
            placeholder="Search issues"
            value={filters.search}
            onChange={e => onChange({ search: e.target.value, page: 1 })}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select className="select" value={filters.status} onChange={e => onChange({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select className="select" value={filters.priority} onChange={e => onChange({ priority: e.target.value, page: 1 })}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select className="select" value={filters.type} onChange={e => onChange({ type: e.target.value, page: 1 })}>
          <option value="">All types</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="improvement">Improvement</option>
          <option value="task">Task</option>
          <option value="question">Question</option>
        </select>

        <select
          className="select"
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={e => {
            const [sortBy, sortOrder] = e.target.value.split(':')
            onChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc', page: 1 })
          }}
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="updatedAt:desc">Recently updated</option>
          <option value="priority:desc">Priority high to low</option>
        </select>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={onReset} className="btn-ghost">
            <SlidersHorizontal size={14} />
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}
