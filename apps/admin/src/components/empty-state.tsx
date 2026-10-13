import {
  FileText,
  MessageSquareText,
  Package,
  PlusCircle,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type EmptyStateVariant =
  | 'dashboard-chart'
  | 'dashboard-tasks'
  | 'dashboard-analytics'
  | 'tasks'
  | 'users'
  | 'products'
  | 'chats-list'
  | 'chats-empty'

type IconMap = Record<EmptyStateVariant, ComponentType<{ className?: string }>>

const ICONS: IconMap = {
  'dashboard-chart': FileText,
  'dashboard-tasks': FileText,
  'dashboard-analytics': FileText,
  tasks: FileText,
  users: Users,
  products: Package,
  'chats-list': MessageSquareText,
  'chats-empty': MessageSquareText,
}

type ActionProps = {
  label: string
  onClick: () => void
}

export type EmptyStateProps = {
  variant: EmptyStateVariant
  title?: string
  description?: string
  action?: ActionProps
  secondaryAction?: ActionProps
  compact?: boolean
  className?: string
}

export function EmptyState({
  variant,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className,
}: EmptyStateProps) {
  const Icon = ICONS[variant]

  const defaults: Record<
    EmptyStateVariant,
    { title: string; description: string }
  > = {
    'dashboard-chart': {
      title: '暂无概览数据',
      description: '创建用户和任务后,这里将展示每月的统计趋势。',
    },
    'dashboard-tasks': {
      title: '暂无最近任务',
      description: '创建任务后,这里将显示最近更新的任务。',
    },
    'dashboard-analytics': {
      title: '暂无分析数据',
      description: '接入流量分析后,这里将展示访问数据概览。',
    },
    tasks: {
      title: '还没有任务',
      description: '开始创建您的第一个任务,或从 CSV 文件批量导入。',
    },
    users: {
      title: '没有匹配的用户',
      description: '尝试调整筛选条件,或添加一个新用户。',
    },
    products: {
      title: '还没有商品',
      description: '上传您的第一个商品，开始管理货架。',
    },
    'chats-list': {
      title: '暂无聊天记录',
      description: '新建对话后,这里将列出所有会话。',
    },
    'chats-empty': {
      title: '您的消息',
      description: '发送消息开始聊天。',
    },
  }

  const content = defaults[variant]

  const wrapperClass = compact
    ? 'flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-6 text-center'
    : 'flex h-full w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center'

  const iconSizeClass = compact ? 'h-8 w-8' : 'h-12 w-12'
  const titleClass = compact
    ? 'text-sm font-medium'
    : 'text-base font-semibold sm:text-lg'
  const descClass = compact
    ? 'max-w-sm text-xs text-muted-foreground'
    : 'max-w-sm text-sm text-muted-foreground'

  return (
    <div className={cn(wrapperClass, className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground',
          compact ? 'size-12' : 'size-16'
        )}
      >
        <Icon className={cn(iconSizeClass, 'stroke-1.5')} />
      </div>
      <div className="space-y-1">
        <p className={titleClass}>{title ?? content.title}</p>
        {description !== null ? (
          <p className={descClass}>{description ?? content.description}</p>
        ) : null}
      </div>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {secondaryAction && (
            <Button
              variant="outline"
              size={compact ? 'sm' : 'default'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button size={compact ? 'sm' : 'default'} onClick={action.onClick}>
              <PlusCircle className="me-1 h-4 w-4" />
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
