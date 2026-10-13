import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ProductMutateDrawer } from './product-mutate-drawer'
import { useProducts } from './products-provider'

export function ProductsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts()

  const handleDelete = () => {
    if (!currentRow) return
    toast.success(`删除功能待接入后端（商品：${currentRow.name}）`)
    setOpen(null)
    setCurrentRow(null)
  }

  return (
    <>
      <ProductMutateDrawer
        key="product-create"
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <ProductMutateDrawer
            key={`product-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="product-delete"
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={handleDelete}
            className="max-w-md"
            title={`删除商品「${currentRow.name}」？`}
            desc={
              <>
                您即将删除商品 <strong>{currentRow.name}</strong>。
                <br />
                此操作无法撤销。
              </>
            }
            confirmText="删除"
          />
        </>
      )}
    </>
  )
}
