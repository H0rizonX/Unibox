import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts } from './products-provider'

export function ProductsPrimaryButtons() {
  const { setOpen } = useProducts()
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('create')}>
        <span>上传商品</span> <Plus size={18} />
      </Button>
    </div>
  )
}
