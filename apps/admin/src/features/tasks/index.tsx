import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import * as tasksApi from '@/api/tasks'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'

const route = getRouteApi('/_authenticated/tasks/')

export function Tasks() {
  const search = route.useSearch()

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', search],
    queryFn: () =>
      tasksApi.listTasks({
        page: search.page,
        pageSize: search.pageSize,
        filter: search.filter,
        status: search.status,
        priority: search.priority,
      }),
  })

  return (
    <TasksProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <UserNav />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>任务</h2>
            <p className='text-muted-foreground'>这是您本月的任务列表！</p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <TasksTable
          data={data?.data ?? []}
          pageCount={data?.meta.totalPages}
          isLoading={isLoading}
        />
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
