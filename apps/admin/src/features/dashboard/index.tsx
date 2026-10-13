import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '@/api/dashboard'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserNav } from '@/components/user-nav'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

const topNav = [
  {
    title: '概览',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
]

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardApi.getOverview,
  })

  const stats = data?.stats

  return (
    <>
      <Header>
        <TopNav links={topNav} className="me-auto cursor-pointer" />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <UserNav />
      </Header>
      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <div className="flex items-center space-x-2">
            <Button>下载</Button>
          </div>
        </div>
        <Tabs
          orientation="vertical"
          defaultValue="overview"
          className="space-y-4"
        >
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="analytics">分析</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    用户总数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '—' : stats?.userCount}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    活跃用户
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '—' : stats?.activeUsers}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    任务总数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '—' : stats?.taskCount}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    已完成任务
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '—' : stats?.completedTasks}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>概览</CardTitle>
                </CardHeader>
                <CardContent className="ps-2">
                  <Overview chart={data?.chart ?? []} />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>最近任务</CardTitle>
                  <CardDescription>最近更新的任务列表。</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales items={data?.recentSales ?? []} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
