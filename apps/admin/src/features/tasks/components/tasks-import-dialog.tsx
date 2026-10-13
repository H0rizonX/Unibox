import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as tasksApi from '@/api/tasks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { handleServerError } from '@/lib/handle-server-error'

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: '请上传文件。',
    })
    .refine(
      (files) => ['text/csv'].includes(files?.[0]?.type),
      '请上传 CSV 格式文件。'
    ),
})

type TaskImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TasksImportDialog({
  open,
  onOpenChange,
}: TaskImportDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = async () => {
    const file = form.getValues('file')

    if (!file?.[0]) return

    try {
      const result = await tasksApi.importTasks(file[0])
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(`已导入 ${result.imported} 条任务。`)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      handleServerError(error)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className="gap-2 sm:max-w-sm">
        <DialogHeader className="text-start">
          <DialogTitle>导入任务</DialogTitle>
          <DialogDescription>从 CSV 文件快速导入任务。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="task-import-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem className="my-2">
                  <FormLabel>文件</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="text/csv"
                      {...fileRef}
                      className="h-8 py-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">关闭</Button>
          </DialogClose>
          <Button type="submit" form="task-import-form">
            导入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
