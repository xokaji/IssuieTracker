import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationInfo } from '../../types'

interface PaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pages, total, limit } = pagination
  if (pages <= 1) return null

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const getPages = () => {
    const list: (number | '...')[] = []

    if (pages <= 7) {
      for (let i = 1; i <= pages; i += 1) list.push(i)
      return list
    }

    list.push(1)
    if (page > 3) list.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i += 1) list.push(i)
    if (page < pages - 2) list.push('...')
    list.push(pages)

    return list
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{start}-{end}</span> of{' '}
        <span className="font-semibold text-slate-900">{total}</span> issues
      </p>

      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="btn-ghost px-2 disabled:opacity-40">
          <ChevronLeft size={16} />
        </button>

        {getPages().map((item, index) =>
          item === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item as number)}
              className={
                item === page
                  ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white'
                  : 'rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }
            >
              {item}
            </button>
          )
        )}

        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === pages} className="btn-ghost px-2 disabled:opacity-40">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
