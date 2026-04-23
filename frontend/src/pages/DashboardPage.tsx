import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Clock3, Plus, TrendingUp } from 'lucide-react'
import { useIssues, useIssueStats } from '../hooks/useIssues'
import { useAuthStore } from '../store/authStore'
import IssueCard from '../components/issues/IssueCard'
import Spinner from '../components/ui/Spinner'

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  hint: string
  icon: React.ElementType
  tone: string
}) {
  return (
    <div className="card">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${tone}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useIssueStats()
  const { data: recentData, isLoading: recentLoading } = useIssues({
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page-shell">
      <div className="flex justify-end">
        <button onClick={() => navigate('/issues/new')} className="btn-primary">
          <Plus size={16} />
          New Issue
        </button>
      </div>

      {statsLoading ? (
        <div className="surface flex items-center justify-center p-10">
          <Spinner />
        </div>
      ) : stats ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Issues"
              value={stats.total}
              hint="All issues in your workspace"
              icon={TrendingUp}
              tone="bg-brand-50 text-brand-700"
            />
            <StatCard
              label="Open"
              value={stats.statusCounts.open || 0}
              hint="Needs triage"
              icon={AlertCircle}
              tone="bg-sky-50 text-sky-700"
            />
            <StatCard
              label="In Progress"
              value={stats.statusCounts['in-progress'] || 0}
              hint="Currently being worked on"
              icon={Clock3}
              tone="bg-amber-50 text-amber-700"
            />
            <StatCard
              label="Resolved"
              value={stats.statusCounts.resolved || 0}
              hint="Completed successfully"
              icon={CheckCircle2}
              tone="bg-emerald-50 text-emerald-700"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <SummaryPanel
              title="Priority Breakdown"
              total={stats.total}
              rows={[
                { label: 'Critical', value: stats.priorityCounts.critical || 0, color: 'bg-red-500' },
                { label: 'High', value: stats.priorityCounts.high || 0, color: 'bg-orange-500' },
                { label: 'Medium', value: stats.priorityCounts.medium || 0, color: 'bg-blue-500' },
                { label: 'Low', value: stats.priorityCounts.low || 0, color: 'bg-slate-500' },
              ]}
            />

            <SummaryPanel
              title="Status Breakdown"
              total={stats.total}
              rows={[
                { label: 'Open', value: stats.statusCounts.open || 0, color: 'bg-sky-500' },
                { label: 'In Progress', value: stats.statusCounts['in-progress'] || 0, color: 'bg-amber-500' },
                { label: 'Resolved', value: stats.statusCounts.resolved || 0, color: 'bg-emerald-500' },
                { label: 'Closed', value: stats.statusCounts.closed || 0, color: 'bg-slate-500' },
              ]}
            />
          </section>
        </>
      ) : (
        <div className="empty-state">
          <p className="font-semibold text-slate-900">Could not load statistics.</p>
          <p className="mt-1 text-sm text-slate-600">Please refresh and try again.</p>
        </div>
      )}

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{greeting}</p>
            <h2 className="text-base font-bold text-slate-900">{user?.name ? `${user.name.split(' ')[0]}'s` : 'Your'} Recent Issues</h2>
          </div>
          <button onClick={() => navigate('/issues')} className="btn-ghost">
            View all
          </button>
        </div>

        {recentLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : recentData?.issues?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentData.issues.map(issue => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="empty-state p-8">
            <p className="font-semibold text-slate-900">No issues yet</p>
            <p className="mt-1 text-sm text-slate-600">Create your first issue to get started.</p>
            <button onClick={() => navigate('/issues/new')} className="btn-primary mt-4">
              <Plus size={15} />
              Create Issue
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

function SummaryPanel({
  title,
  total,
  rows,
}: {
  title: string
  total: number
  rows: { label: string; value: number; color: string }[]
}) {
  return (
    <div className="surface p-5">
      <h3 className="mb-4 text-base font-bold text-slate-900">{title}</h3>
      <div className="space-y-3">
        {rows.map(row => {
          const width = total > 0 ? Math.round((row.value / total) * 100) : 0
          return (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{row.label}</span>
                <span className="text-slate-500">{row.value}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full ${row.color} transition-all`} style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
