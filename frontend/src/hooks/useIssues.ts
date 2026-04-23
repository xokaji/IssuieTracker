import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import type { IssueFilters, IssueFormData, IssueListResponse, StatsResponse, Issue } from '../types'

export function useIssues(filters: Partial<IssueFilters>) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
  )
  return useQuery<IssueListResponse>({
    queryKey: ['issues', filters],
    queryFn: async () => {
      const { data } = await api.get('/issues', { params })
      return data
    },
    placeholderData: (prev) => prev,
  })
}

export function useIssueStats() {
  return useQuery<StatsResponse>({
    queryKey: ['issue-stats'],
    queryFn: async () => {
      const { data } = await api.get('/issues/stats')
      return data
    },
  })
}

export function useIssue(id: string) {
  return useQuery<{ issue: Issue }>({
    queryKey: ['issue', id],
    queryFn: async () => {
      const { data } = await api.get(`/issues/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: IssueFormData) => {
      const { data } = await api.post('/issues', formData)
      return data.issue as Issue
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] })
      qc.invalidateQueries({ queryKey: ['issue-stats'] })
    },
  })
}

export function useUpdateIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data: body }: { id: string; data: Partial<IssueFormData & { status: string }> }) => {
      const { data } = await api.put(`/issues/${id}`, body)
      return data.issue as Issue
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['issues'] })
      qc.invalidateQueries({ queryKey: ['issue', vars.id] })
      qc.invalidateQueries({ queryKey: ['issue-stats'] })
    },
  })
}

export function useDeleteIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/issues/${id}`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] })
      qc.invalidateQueries({ queryKey: ['issue-stats'] })
    },
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ issueId, content }: { issueId: string; content: string }) => {
      const { data } = await api.post(`/issues/${issueId}/comments`, { content })
      return data.issue as Issue
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['issue', vars.issueId] })
    },
  })
}

export function useDeleteComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ issueId, commentId }: { issueId: string; commentId: string }) => {
      const { data } = await api.delete(`/issues/${issueId}/comments/${commentId}`)
      return data.issue as Issue
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['issue', vars.issueId] })
    },
  })
}

export function useUsers() {
  return useQuery<{ users: { _id: string; name: string; email: string }[] }>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users')
      return data
    },
  })
}
