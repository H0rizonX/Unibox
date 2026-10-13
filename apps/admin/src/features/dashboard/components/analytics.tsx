import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '@/api/dashboard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AnalyticsChart } from './analytics-chart'

export function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: dashboardApi.getAnalytics,
  })

  const traffic = data?.traffic
  const chartData =
    traffic?.weeklyChart.map(({ name, clicks, visitors }) => ({
      name,
      clicks,
      uniques: visitors,
    })) ?? []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>流量概览</CardTitle>
          <CardDescription>每周点击量和独立访客</CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              加载中…
            </div>
          ) : (
            <AnalyticsChart data={chartData} />
          )}
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总点击量</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M3 3v18h18" />
              <path d="M7 15l4-4 4 4 4-6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : traffic?.totalClicks.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">独立访客</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : traffic?.uniqueVisitors.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">跳出率</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M3 12h6l3 6 3-6h6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : `${traffic?.bounceRate}%`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均会话时长</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : traffic?.avgSessionDuration}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>来源</CardTitle>
            <CardDescription>主要流量来源</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={data?.sources ?? []}
              barClass="bg-primary"
              valueFormatter={(n) => `${n}`}
              emptyHint="暂无来源数据"
            />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>设备</CardTitle>
            <CardDescription>用户访问应用的方式</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={data?.devices ?? []}
              barClass="bg-muted-foreground"
              valueFormatter={(n) => `${n}%`}
              emptyHint="暂无设备数据"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
  emptyHint,
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
  emptyHint?: string
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {emptyHint ?? '暂无数据'}
      </p>
    )
  }
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className="space-y-3">
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 truncate text-xs text-muted-foreground">
                {i.name}
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted">
                <div
                  className={`h-2.5 rounded-full ${barClass}`}
                  style={{ width }}
                />
              </div>
            </div>
            <div className="ps-2 text-xs font-medium tabular-nums">
              {valueFormatter(i.value)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
