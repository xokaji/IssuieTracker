import type { Issue } from '../types'
import { format } from 'date-fns'

export function exportToCSV(issues: Issue[], filename = 'issues') {
  const headers = [
    'ID', 'Title', 'Status', 'Priority', 'Severity', 'Type',
    'Reporter', 'Assignee', 'Tags', 'Created At', 'Updated At'
  ]

  const rows = issues.map(issue => [
    issue._id,
    `"${issue.title.replace(/"/g, '""')}"`,
    issue.status,
    issue.priority,
    issue.severity,
    issue.type,
    issue.reporter?.name || '',
    issue.assignee?.name || '',
    issue.tags.join('; '),
    format(new Date(issue.createdAt), 'yyyy-MM-dd HH:mm'),
    format(new Date(issue.updatedAt), 'yyyy-MM-dd HH:mm'),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadFile(csv, `${filename}-${format(new Date(), 'yyyyMMdd')}.csv`, 'text/csv')
}

export function exportToJSON(issues: Issue[], filename = 'issues') {
  const json = JSON.stringify(issues, null, 2)
  downloadFile(json, `${filename}-${format(new Date(), 'yyyyMMdd')}.json`, 'application/json')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
