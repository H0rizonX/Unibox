import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { EmptyState } from '@/components/empty-state'

type OverviewProps = {
  chart: { name: string; total: number }[]
}

export function Overview({ chart }: OverviewProps) {
  if (chart.length === 0) {
    return (
      <EmptyState variant="dashboard-chart" compact className="h-[350px]" />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chart}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction="ltr"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
