import type { Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName="任务">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="删除所选任务"
              title="删除所选任务"
            >
              <Trash2 />
              <span className="sr-only">删除所选任务</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选任务</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <TasksMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
