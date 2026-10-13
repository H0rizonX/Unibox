import { useState } from 'react'
import { mockInvalidateQueries } from '@/test-utils/mock-query-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import * as tasksApi from '@/api/tasks'
import { TasksImportDialog } from './tasks-import-dialog'

vi.mock('@/api/tasks', () => ({
  importTasks: vi.fn(() => Promise.resolve({ imported: 1, data: [] })),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  }
})

describe('TasksImportDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the dialog with the correct title, description, file input and buttons', async () => {
    const onOpenChange = vi.fn()
    const { getByRole, getByText, getByLabelText } = await render(
      <TasksImportDialog open onOpenChange={onOpenChange} />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /导入任务/i,
    })
    const desc = getByText('从 CSV 文件快速导入任务。')
    const fileInput = getByLabelText('文件')
    const closeButtons = getByRole('dialog')
      .getByRole('button', { name: 'Close' })
      .all()

    const importButton = getByRole('button', { name: /^导入$/i })

    await expect.element(title).toBeInTheDocument()
    await expect.element(desc).toBeInTheDocument()
    await expect.element(fileInput).toBeInTheDocument()
    expect(closeButtons).toHaveLength(2)
    await expect.element(importButton).toBeInTheDocument()
  })

  it('shows validation when submitting without a file', async () => {
    const onOpenChange = vi.fn()
    const { getByRole, getByText } = await render(
      <TasksImportDialog open onOpenChange={onOpenChange} />
    )

    const importButton = getByRole('button', { name: /^导入$/i })
    await userEvent.click(importButton)

    await expect.element(getByText('请上传文件。')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(tasksApi.importTasks).not.toHaveBeenCalled()
  })

  it('calls importTasks and closes when a CSV file is imported', async () => {
    const onOpenChange = vi.fn()
    const { getByRole, getByLabelText } = await render(
      <TasksImportDialog open onOpenChange={onOpenChange} />
    )

    const csv = new File(['a,b'], 'tasks.csv', { type: 'text/csv' })
    await userEvent.upload(getByLabelText('文件'), csv)

    const importButton = getByRole('button', { name: /^导入$/i })
    await userEvent.click(importButton)

    await vi.waitFor(() => expect(tasksApi.importTasks).toHaveBeenCalledOnce())

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes the dialog when Close is clicked', async () => {
    const onOpenChange = vi.fn()

    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button type='button' onClick={() => setOpen(true)}>
            Reopen
          </button>
          <TasksImportDialog
            open={open}
            onOpenChange={(val) => {
              onOpenChange(val)
              setOpen(val)
            }}
          />
        </>
      )
    }

    const { getByRole } = await render(<Harness />)

    const closeButtonX = getByRole('dialog')
      .getByRole('button', {
        name: /Close/i,
      })
      .nth(0)
    await userEvent.click(closeButtonX)

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(tasksApi.importTasks).not.toHaveBeenCalled()

    await userEvent.click(getByRole('button', { name: /Reopen/i }))
    const closeButton = getByRole('dialog')
      .getByRole('button', {
        name: /关闭/i,
      })
      .nth(1)
    await userEvent.click(closeButton)

    expect(onOpenChange).toHaveBeenCalledTimes(2)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(tasksApi.importTasks).not.toHaveBeenCalled()
  })
})
