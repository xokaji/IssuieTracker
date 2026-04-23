import { useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Pencil,
  Send,
  Trash,
  Trash2,
  User2,
  XCircle,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  useAddComment,
  useDeleteComment,
  useDeleteIssue,
  useIssue,
  useUpdateIssue,
} from '../hooks/useIssues'
import { useAuthStore } from '../store/authStore'
import { PriorityBadge, SeverityBadge, StatusBadge, TypeBadge } from '../components/ui/Badges'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import IssueForm from '../components/issues/IssueForm'
import Modal from '../components/ui/Modal'
import Spinner, { PageLoader } from '../components/ui/Spinner'
import type { IssueFormData } from '../types'

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data, isLoading } = useIssue(id!)
  const updateIssue = useUpdateIssue()
  const deleteIssue = useDeleteIssue()
  const addComment = useAddComment()
  const deleteComment = useDeleteComment()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState('')
  const [deletingComment, setDeletingComment] = useState<string | null>(null)

  const issue = data?.issue

  if (isLoading) return <PageLoader />

  if (!issue) {
    return (
      <div className="empty-state mx-auto max-w-2xl">
        <p className="text-lg font-semibold text-slate-900">Issue not found</p>
        <p className="mt-1 text-sm text-slate-600">The issue may have been deleted or you may not have access.</p>
        <button onClick={() => navigate('/issues')} className="btn-secondary mt-4">
          Back to Issues
        </button>
      </div>
    )
  }

  const isOwner = issue.reporter?._id === user?._id
  const isAdmin = user?.role === 'admin'
  const canEdit = isOwner || isAdmin

  const handleEdit = async (formData: IssueFormData) => {
    try {
      await updateIssue.mutateAsync({ id: issue._id, data: formData })
      toast.success('Issue updated')
      setEditOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update issue')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteIssue.mutateAsync(issue._id)
      toast.success('Issue deleted')
      navigate('/issues')
    } catch {
      toast.error('Failed to delete issue')
    }
  }

  const handleStatusChange = async (status: string, label: string) => {
    try {
      await updateIssue.mutateAsync({ id: issue._id, data: { status } })
      toast.success(`Issue marked as ${label}`)
      setResolveOpen(false)
      setCloseOpen(false)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = comment.trim()

    if (!content) {
      setCommentError('Comment cannot be empty.')
      return
    }

    setCommentError('')
    try {
      await addComment.mutateAsync({ issueId: issue._id, content })
      setComment('')
      toast.success('Comment added')
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync({ issueId: issue._id, commentId })
      setDeletingComment(null)
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  return (
    <div className="page-shell mx-auto max-w-4xl">
      <button onClick={() => navigate('/issues')} className="btn-ghost w-fit">
        <ArrowLeft size={15} />
        Back to Issues
      </button>

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
            <SeverityBadge severity={issue.severity} />
            <TypeBadge type={issue.type} />
            <span className="ml-auto text-xs font-semibold text-slate-400">#{issue._id.slice(-8)}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{issue.title}</h1>
        </div>

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {issue.description?.trim() || 'No description provided.'}
          </p>
        </div>

        <div className="grid gap-4 border-b border-slate-200 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem icon={User2} label="Reporter" value={issue.reporter?.name || '-'} />
          <MetaItem icon={User2} label="Assignee" value={issue.assignee?.name || 'Unassigned'} />
          <MetaItem icon={Calendar} label="Created" value={format(new Date(issue.createdAt), 'MMM d, yyyy')} />
          <MetaItem icon={Clock3} label="Updated" value={formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })} />
        </div>

        {issue.tags.length > 0 && (
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {issue.tags.map(tag => (
                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 px-6 py-4">
          {canEdit && (
            <button onClick={() => setEditOpen(true)} className="btn-secondary">
              <Pencil size={14} />
              Edit
            </button>
          )}

          {issue.status !== 'resolved' && issue.status !== 'closed' && canEdit && (
            <button
              onClick={() => setResolveOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <CheckCircle2 size={14} />
              Mark Resolved
            </button>
          )}

          {issue.status !== 'closed' && canEdit && (
            <button
              onClick={() => setCloseOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <XCircle size={14} />
              Close Issue
            </button>
          )}

          {canEdit && (
            <button onClick={() => setDeleteOpen(true)} className="btn-danger ml-auto">
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900">
            <MessageSquare size={16} />
            Comments ({issue.comments.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-200">
          {issue.comments.length === 0 && <p className="px-6 py-8 text-sm text-slate-600">No comments yet.</p>}

          {issue.comments.map(item => {
            const isCommentOwner = item.author?._id === user?._id
            return (
              <div key={item._id} className="flex gap-3 px-6 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {item.author?.name?.[0]?.toUpperCase() || '?'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{item.author?.name || 'Unknown'}</span>
                    <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{item.content}</p>
                </div>

                {(isCommentOwner || isAdmin) && (
                  <button
                    onClick={() => setDeletingComment(item._id)}
                    className="btn-ghost h-fit p-1.5 text-slate-400 hover:text-red-600"
                    aria-label="Delete comment"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <form onSubmit={handleAddComment} className="space-y-2">
            <label className="label">Add comment</label>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Write your comment"
                value={comment}
                onChange={e => {
                  setComment(e.target.value)
                  if (commentError) setCommentError('')
                }}
              />
              <button type="submit" disabled={addComment.isPending} className="btn-primary px-4">
                {addComment.isPending ? <Spinner size="sm" className="border-white/40 border-t-white" /> : <Send size={15} />}
              </button>
            </div>
            {commentError && <p className="text-xs font-semibold text-red-600">{commentError}</p>}
          </form>
        </div>
      </section>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Issue" size="lg">
        <IssueForm
          initialData={issue}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          isLoading={updateIssue.isPending}
          submitLabel="Save Changes"
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Issue"
        message="This action cannot be undone. The issue and all comments will be deleted permanently."
        confirmLabel="Delete Issue"
        isLoading={deleteIssue.isPending}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        onConfirm={() => handleStatusChange('resolved', 'resolved')}
        title="Resolve Issue"
        message="Mark this issue as resolved? You can reopen it later if needed."
        confirmLabel="Mark Resolved"
        isLoading={updateIssue.isPending}
        variant="warning"
      />

      <ConfirmDialog
        isOpen={closeOpen}
        onClose={() => setCloseOpen(false)}
        onConfirm={() => handleStatusChange('closed', 'closed')}
        title="Close Issue"
        message="Close this issue? It will move out of active work."
        confirmLabel="Close Issue"
        isLoading={updateIssue.isPending}
        variant="warning"
      />

      <ConfirmDialog
        isOpen={!!deletingComment}
        onClose={() => setDeletingComment(null)}
        onConfirm={() => deletingComment && handleDeleteComment(deletingComment)}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
        isLoading={deleteComment.isPending}
        variant="danger"
      />
    </div>
  )
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon size={12} />
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
