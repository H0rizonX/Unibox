import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as tasksApi from '@/api/tasks'
import { handleServerError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TasksImportDialog } from './tasks-import-dialog'
import { TasksMutateDrawer } from './tasks-mutate-drawer'
import { useTasks } from './tasks-provider'

export function TasksDialogs() {
  const queryClient = useQueryClient()
  const { open, setOpen, currentRow, setCurrentRow } = useTasks()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      await tasksApi.deleteTask(currentRow.id)
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(`已删除任务 ${currentRow.id}。`)
      setOpen(null)
      setCurrentRow(null)
    } catch (error) {
      handleServerError(error)
    }
  }

  return (
    <>
      <TasksMutateDrawer
        key='task-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <TasksImportDialog
        key='tasks-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <TasksMutateDrawer
            key={`task-update-${currentRow.id}`}
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
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => void handleDelete()}
            className='max-w-md'
            title={`删除任务 ${currentRow.id}？`}
            desc={
              <>
                您即将删除任务 <strong>{currentRow.id}</strong>。
                <br />
                此操作无法撤销。
              </>
            }
            confirmText='删除'
          />
        </>
      )}
    </>
  )
}
