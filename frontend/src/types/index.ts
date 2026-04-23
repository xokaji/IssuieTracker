export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed'
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical'
export type IssueSeverity = 'minor' | 'moderate' | 'major' | 'critical'
export type IssueType = 'bug' | 'feature' | 'improvement' | 'task' | 'question'

export interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  author: User
  content: string
  createdAt: string
  updatedAt: string
}

export interface Issue {
  _id: string
  title: string
  description?: string
  status: IssueStatus
  priority: IssuePriority
  severity: IssueSeverity
  type: IssueType
  tags: string[]
  assignee?: User | null
  reporter: User
  comments: Comment[]
  resolvedAt?: string | null
  closedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface IssueFormData {
  title: string
  description: string
  priority: IssuePriority
  severity: IssueSeverity
  type: IssueType
  tags: string[]
  assignee?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface IssueListResponse {
  issues: Issue[]
  pagination: PaginationInfo
}

export interface StatsResponse {
  total: number
  statusCounts: Record<IssueStatus, number>
  priorityCounts: Record<IssuePriority, number>
}

export interface IssueFilters {
  search: string
  status: string
  priority: string
  type: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
}
