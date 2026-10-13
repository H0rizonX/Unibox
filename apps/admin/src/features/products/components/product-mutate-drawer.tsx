import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { categories, productStatuses } from '../data/data'
import {
  productCreateFormSchema,
  productMutateDefaultValues,
  productUpdateFormSchema,
  type Product,
  type ProductMutateFormValues,
} from '../data/schema'
import { ProductImageUpload } from './product-image-upload'

type ProductMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Product
}

export function ProductMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ProductMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<ProductMutateFormValues>({
    resolver: zodResolver(
      isUpdate ? productUpdateFormSchema : productCreateFormSchema
    ),
    defaultValues: productMutateDefaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (currentRow) {
      form.reset({
        name: currentRow.name,
        price: currentRow.price,
        description: currentRow.description ?? '',
        category: currentRow.category,
        status: currentRow.status,
        images: [],
      })
    } else {
      form.reset(productMutateDefaultValues)
    }
  }, [open, currentRow, form])

  const onSubmit = (_data: ProductMutateFormValues) => {
    toast.success(
      isUpdate
        ? '表单校验通过，更新功能待接入后端'
        : '表单校验通过，提交功能待接入后端'
    )
    onOpenChange(false)
    form.reset(productMutateDefaultValues)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value)
        if (!value) form.reset(productMutateDefaultValues)
      }}
    >
      <SheetContent className='flex flex-col sm:max-w-2xl'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? '编辑商品' : '上传商品'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? '修改商品信息。图片选填，不上传则保留原图（接入后端后生效）。'
              : '填写商品信息并上传图片，完成后提交。'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='product-mutate-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto px-4 py-2'
          >
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品图片{isUpdate ? '（选填）' : ''}</FormLabel>
                  <FormControl>
                    <ProductImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品名称</FormLabel>
                  <FormControl>
                    <Input placeholder='请输入商品名称' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>价格（元）</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      step={0.01}
                      placeholder='0.00'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择分类'
                      items={categories.map((item) => ({
                        label: item.label,
                        value: item.value,
                      }))}
                      isControlled
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择状态'
                      items={productStatuses.map((item) => ({
                        label: item.label,
                        value: item.value,
                      }))}
                      isControlled
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述（选填）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='请输入商品描述'
                      className='min-h-20 resize-y'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>取消</Button>
          </SheetClose>
          <Button type='submit' form='product-mutate-form'>
            {isUpdate ? '保存' : '提交'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
