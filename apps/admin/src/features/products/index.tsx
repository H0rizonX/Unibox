import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsPrimaryButtons } from './components/products-primary-buttons'
import { ProductsProvider } from './components/products-provider'
import { ProductsTable } from './components/products-table'
import { type Product } from './data/schema'

const EMPTY_PRODUCTS: Product[] = []

export function Products() {
  return (
    <ProductsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <UserNav />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>商品</h2>
            <p className='text-muted-foreground'>
              管理您的商品，支持上传、编辑与删除。
            </p>
          </div>
          <ProductsPrimaryButtons />
        </div>
        <ProductsTable data={EMPTY_PRODUCTS} />
      </Main>

      <ProductsDialogs />
    </ProductsProvider>
  )
}
