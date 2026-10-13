import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import * as usersApi from '@/api/users'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () =>
      usersApi.listUsers({
        page: search.page,
        pageSize: search.pageSize,
        username: search.username,
        status: search.status,
        role: search.role,
      }),
  })

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <UserNav />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>用户列表</h2>
            <p className='text-muted-foreground'>在此管理用户及其角色。</p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable
          data={data?.data ?? []}
          pageCount={data?.meta.totalPages}
          isLoading={isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
