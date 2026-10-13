import { useState } from 'react'
import { mockInvalidateQueries } from '@/test-utils/mock-query-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import * as tasksApi from '@/api/tasks'
import { type Task } from '../data/schema'
import { TasksMutateDrawer } from './tasks-mutate-drawer'

vi.mock('@/api/tasks', () => ({
  createTask: vi.fn(() => Promise.resolve({ id: 'new-task' })),
  updateTask: vi.fn(() => Promise.resolve({ id: 'task-1' })),
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

const MOCK_TASK = {
  id: 'task-1',
  title: 'Existing task',
  status: 'in progress',
  label: 'feature',
  priority: 'medium',
} as const satisfies Task

describe('TasksMutateDrawer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders create title and description', async () => {
    const { getByRole, getByText } = await render(
      <TasksMutateDrawer open onOpenChange={vi.fn()} />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /创建任务/i,
    })
    const desc = getByText(/提供必要信息以添加新任务。/)

    await expect.element(title).toBeInTheDocument()
    await expect.element(desc).toBeInTheDocument()
  })

  it('renders edit title, description, and prefilled title', async () => {
    const { getByRole, getByText } = await render(
      <TasksMutateDrawer open onOpenChange={vi.fn()} currentRow={MOCK_TASK} />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /更新任务/i,
    })
    const desc = getByText(/提供必要信息以更新任务。/)

    const titleInput = getByRole('textbox', { name: /标题/i })
    const statusSelect = getByRole('combobox', { name: /状态/i })
    const labelRadio = getByRole('radio', { name: /功能/i })
    const priorityRadio = getByRole('radio', { name: /中/i })

    await expect.element(title).toBeInTheDocument()
    await expect.element(desc).toBeInTheDocument()
    await expect.element(titleInput).toHaveValue(MOCK_TASK.title)
    await expect.element(statusSelect).toHaveTextContent(/进行中/i)
    await expect.element(labelRadio).toBeChecked()
    await expect.element(priorityRadio).toBeChecked()
  })

  it('shows validation messages when submitting an empty form', async () => {
    const { getByRole, getByText } = await render(
      <TasksMutateDrawer open onOpenChange={vi.fn()} />
    )

    const saveButton = getByRole('button', { name: /保存更改/i })
    await userEvent.click(saveButton)

    await expect.element(getByText(/标题不能为空。/)).toBeInTheDocument()
    await expect.element(getByText(/请选择状态。/)).toBeInTheDocument()
    await expect.element(getByText(/请选择标签。/)).toBeInTheDocument()
    await expect.element(getByText(/请选择优先级。/)).toBeInTheDocument()
  })

  it('submits create form and calls createTask', async () => {
    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <TasksMutateDrawer open onOpenChange={onOpenChange} />
    )

    const titleInput = getByRole('textbox', { name: /标题/i })
    await userEvent.fill(titleInput, 'New task title')

    const statusSelect = getByRole('combobox', { name: /状态/i })
    await userEvent.click(statusSelect)
    await userEvent.click(getByRole('option', { name: /待办/i }))

    await userEvent.click(getByRole('radio', { name: /缺陷/i }))
    await userEvent.click(getByRole('radio', { name: /低/i }))

    const saveButton = getByRole('button', { name: /保存更改/i })
    await userEvent.click(saveButton)

    await vi.waitFor(() => expect(tasksApi.createTask).toHaveBeenCalledOnce())

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(tasksApi.createTask).toHaveBeenCalledWith({
      title: 'New task title',
      status: 'todo',
      label: 'bug',
      priority: 'low',
    })
  })

  it('closes when Close is clicked', async () => {
    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <TasksMutateDrawer open onOpenChange={onOpenChange} />
    )

    const closeButtons = getByRole('dialog')
      .getByRole('button', {
        name: /关闭/i,
      })
      .all()
    expect(closeButtons).toHaveLength(2)
    await userEvent.click(closeButtons[1])

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('resets entered values when the sheet is closed and reopened', async () => {
    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button type='button' onClick={() => setOpen(true)}>
            Reopen
          </button>
          <TasksMutateDrawer open={open} onOpenChange={setOpen} />
        </>
      )
    }

    const { getByRole } = await render(<Harness />)

    const titleInput = getByRole('textbox', { name: /标题/i })
    await userEvent.fill(titleInput, 'Draft title')
    await expect.element(titleInput).toHaveValue('Draft title')

    const statusSelect = getByRole('combobox', { name: /状态/i })
    await userEvent.click(statusSelect)
    await userEvent.click(getByRole('option', { name: /待办/i }))
    await expect.element(statusSelect).toHaveTextContent(/待办/i)

    const labelRadio = getByRole('radio', { name: /文档/i })
    await userEvent.click(labelRadio)
    await expect.element(labelRadio).toBeChecked()

    const priorityRadio = getByRole('radio', { name: /高/i })
    await userEvent.click(priorityRadio)
    await expect.element(priorityRadio).toBeChecked()

    const closeButtons = getByRole('dialog')
      .getByRole('button', {
        name: /关闭/i,
      })
      .all()
    await userEvent.click(closeButtons[0])

    const reopenButton = getByRole('button', { name: /Reopen/i })
    await userEvent.click(reopenButton)

    await expect.element(titleInput).toHaveValue('')
    await expect.element(statusSelect).not.toHaveTextContent(/待办/i)
    await expect.element(labelRadio).not.toBeChecked()
    await expect.element(priorityRadio).not.toBeChecked()
  })
})
