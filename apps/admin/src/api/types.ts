export interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface ForgotPasswordResponse {
  message: string
  otp?: string
}

export type OtpResponse = ForgotPasswordResponse

export interface ResetTokenResponse {
  message: string
  resetToken: string
}

export interface MessageResponse {
  message: string
}

export type PaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type PaginatedResult<T> = {
  data: T[]
  meta: PaginationMeta
}

export type ApiUser = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  status: string
  role: string
  createdAt: string
  updatedAt: string
}

export type ApiTask = {
  id: string
  title: string
  status: string
  label: string
  priority: string
  assignee?: string | null
  description?: string | null
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

export type Profile = {
  username: string
  email: string
  bio: string
  urls: { value: string }[]
}

export type Account = {
  name: string
  dob: string | null
  language: string
}

export type Notifications = {
  type: 'all' | 'mentions' | 'none'
  mobile?: boolean
  communication_emails?: boolean
  social_emails?: boolean
  marketing_emails?: boolean
  security_emails: boolean
}

export type DashboardOverview = {
  stats: {
    totalRevenue: number
    userCount: number
    taskCount: number
    activeUsers: number
    completedTasks: number
  }
  chart: { name: string; total: number }[]
  recentSales: {
    id: string
    title: string
    assignee: string | null
    status: string
    updatedAt: string
  }[]
}

export type DashboardAnalytics = {
  traffic: {
    totalClicks: number
    uniqueVisitors: number
    bounceRate: number
    avgSessionDuration: string
    weeklyChart: { name: string; clicks: number; visitors: number }[]
  }
  sources: { name: string; value: number }[]
  devices: { name: string; value: number }[]
}

export type ApiConversation = {
  id: string
  fullName: string
  username: string
  title: string
  avatar?: string | null
  messages: { sender: string; message: string; timestamp: string }[]
}
