import { useState } from 'react'
import { Download, FileJson, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useIssues } from '../hooks/useIssues'
import { useDebounce } from '../hooks/useDebounce'
import IssueCard from '../components/issues/IssueCard'
import IssueFilterBar from '../components/issues/IssueFilterBar'
import Pagination from '../components/issues/Pagination'
import Spinner from '../components/ui/Spinner'
import { exportToCSV, exportToJSON } from '../utils/export'
import type { IssueFilters } from '../types'
import api from '../utils/api'

const DEFAULT_FILTERS: IssueFilters = {
  search: '',
  status: '',
  priority: '',
  type: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
}

export default function IssuesPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<IssueFilters>(DEFAULT_FILTERS)
  const [exporting, setExporting] = useState(false)

  const debouncedSearch = useDebounce(filters.search, 400)
  const activeFilters = { ...filters, search: debouncedSearch }

  const { data, isLoading, isFetching } = useIssues(activeFilters)

  const updateFilters = (partial: Partial<IssueFilters>) => setFilters(prev => ({ ...prev, ...partial }))
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true)
    try {
      const params = Object.fromEntries(
        Object.entries({ ...activeFilters, limit: 1000, page: 1 }).filter(([, value]) => value !== '')
      )
      const { data: exportData } = await api.get('/issues', { params })

      if (format === 'csv') exportToCSV(exportData.issues)
      else exportToJSON(exportData.issues)

      toast.success(`Exported ${exportData.issues.length} issues as ${format.toUpperCase()}`)
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button onClick={() => handleExport('csv')} className="btn-secondary" disabled={exporting}>
          <Download size={15} />
          Export CSV
        </button>
        <button onClick={() => handleExport('json')} className="btn-secondary" disabled={exporting}>
          <FileJson size={15} />
          Export JSON
        </button>
        <button onClick={() => navigate('/issues/new')} className="btn-primary">
          <Plus size={16} />
          New Issue
        </button>
      </div>

      <IssueFilterBar filters={filters} onChange={updateFilters} onReset={resetFilters} />

      <section className="surface p-5">
        {data && (
          <p className="mb-3 text-sm text-slate-600">
            {data.pagination.total} total issue{data.pagination.total !== 1 ? 's' : ''}
          </p>
        )}
        {isFetching && !isLoading && (
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Spinner size="sm" />
            Updating list...
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : !data?.issues.length ? (
          <div className="empty-state border-0 p-10 shadow-none">
            <p className="text-lg font-semibold text-slate-900">No issues found</p>
            <p className="mt-1 text-sm text-slate-600">
              {filters.search || filters.status || filters.priority || filters.type
                ? 'Try changing search or filters.'
                : 'Create your first issue to get started.'}
            </p>
            {!filters.search && !filters.status && !filters.priority && !filters.type && (
              <button onClick={() => navigate('/issues/new')} className="btn-primary mt-4">
                <Plus size={15} />
                Create Issue
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {data.issues.map(issue => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
            <Pagination pagination={data.pagination} onPageChange={page => updateFilters({ page })} />
          </>
        )}
      </section>
    </div>
  )
}
