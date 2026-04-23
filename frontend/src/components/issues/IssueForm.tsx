import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Issue, IssueFormData } from '../../types'
import { useUsers } from '../../hooks/useIssues'

interface IssueFormProps {
  initialData?: Partial<Issue>
  onSubmit: (data: IssueFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  submitLabel?: string
}

const DEFAULT: IssueFormData = {
  title: '',
  description: '',
  priority: 'medium',
  severity: 'moderate',
  type: 'bug',
  tags: [],
  assignee: '',
}

const TYPE_OPTIONS: Array<{ value: IssueFormData['type']; label: string; hint: string }> = [
  { value: 'bug', label: 'Bug', hint: 'Something broken' },
  { value: 'feature', label: 'Feature', hint: 'New capability request' },
  { value: 'improvement', label: 'Improvement', hint: 'Enhance existing flow' },
  { value: 'task', label: 'Task', hint: 'General engineering work' },
  { value: 'question', label: 'Question', hint: 'Needs clarification' },
]

const PRIORITY_OPTIONS: Array<{ value: IssueFormData['priority']; label: string; hint: string }> = [
  { value: 'low', label: 'Low', hint: 'No urgency' },
  { value: 'medium', label: 'Medium', hint: 'Normal planning' },
  { value: 'high', label: 'High', hint: 'Needs attention soon' },
  { value: 'critical', label: 'Critical', hint: 'Immediate impact' },
]

export default function IssueForm({ initialData, onSubmit, onCancel, isLoading, submitLabel = 'Create Issue' }: IssueFormProps) {
  const isEditMode = Boolean(initialData)
  const [form, setForm] = useState<IssueFormData>({
    ...DEFAULT,
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    severity: initialData?.severity || 'moderate',
    type: initialData?.type || 'bug',
    tags: initialData?.tags || [],
    assignee: (initialData?.assignee as any)?._id || (initialData?.assignee as any) || '',
  })
  const [tagInput, setTagInput] = useState('')
  const [attempted, setAttempted] = useState(false)
  const { data: usersData } = useUsers()

  const errors = useMemo(() => {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'Title is required.'
    if (form.title.length > 200) next.title = 'Title cannot exceed 200 characters.'
    if (form.description.length > 2000) next.description = 'Description cannot exceed 2000 characters.'
    return next
  }, [form.title, form.description])

  const setField = (field: keyof IssueFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (!tag) return
    if (form.tags.includes(tag) || form.tags.length >= 8) {
      setTagInput('')
      return
    }
    setField('tags', [...form.tags, tag])
    setTagInput('')
  }

  const removeTag = (tag: string) => setField('tags', form.tags.filter(item => item !== tag))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    if (Object.keys(errors).length > 0) return

    await onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      assignee: form.assignee || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6" noValidate>
      <div>
        <label className="label">Title</label>
        <input
          className="input"
          placeholder="Brief summary of the issue"
          value={form.title}
          onChange={e => setField('title', e.target.value)}
          aria-invalid={attempted && !!errors.title}
        />
        {attempted && errors.title && <p className="mt-1 text-xs font-semibold text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className="textarea min-h-[130px] resize-y"
          placeholder="What happened, expected behavior, and impact"
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          aria-invalid={attempted && !!errors.description}
        />
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span>{attempted && errors.description ? <span className="font-semibold text-red-600">{errors.description}</span> : 'Optional but recommended.'}</span>
          <span>{form.description.length}/2000</span>
        </div>
      </div>

      {!isEditMode ? (
        <div className="space-y-4">
          <div>
            <label className="label">Issue Type</label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {TYPE_OPTIONS.map(option => {
                const selected = form.type === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField('type', option.value)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${
                      selected
                        ? 'border-brand-300 bg-brand-50 ring-1 ring-brand-200'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{option.hint}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="label">Priority</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {PRIORITY_OPTIONS.map(option => {
                const selected = form.priority === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField('priority', option.value)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${
                      selected
                        ? 'border-brand-300 bg-brand-50 ring-1 ring-brand-200'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{option.hint}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Type</label>
            <select className="select" value={form.type} onChange={e => setField('type', e.target.value)}>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="improvement">Improvement</option>
              <option value="task">Task</option>
              <option value="question">Question</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="select" value={form.priority} onChange={e => setField('priority', e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      )}

      {isEditMode && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Severity</label>
              <select className="select" value={form.severity} onChange={e => setField('severity', e.target.value)}>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="label">Assignee</label>
              <select className="select" value={form.assignee} onChange={e => setField('assignee', e.target.value)}>
                <option value="">Unassigned</option>
                {usersData?.users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Tags</label>
            <div className="mb-2 flex min-h-8 flex-wrap gap-2">
              {form.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-brand-700/70 hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <button type="button" onClick={addTag} className="btn-secondary px-3">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
