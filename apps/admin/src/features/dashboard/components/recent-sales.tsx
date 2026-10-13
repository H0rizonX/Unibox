import type { DashboardOverview } from '@/api/types'
import { EmptyState } from '@/components/empty-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getDisplayNameInitials } from '@/lib/utils'

type RecentSalesProps = {
  items: DashboardOverview['recentSales']
}

export function RecentSales({ items }: RecentSalesProps) {
  if (items.length === 0) {
    return <EmptyState variant="dashboard-tasks" compact />
  }

  return (
    <div className="space-y-8">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {getDisplayNameInitials(item.assignee ?? item.title)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-wrap items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm leading-none font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {item.assignee ?? '未分配'} · {item.status}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
