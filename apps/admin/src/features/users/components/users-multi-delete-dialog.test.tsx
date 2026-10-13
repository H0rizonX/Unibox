import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import * as usersApi from '@/api/users'
import { mockInvalidateQueries } from '@/test-utils/mock-query-client'
import { createTableMock } from '@/test-utils/tanstack-table'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

vi.mock('@/api/users', () => ({
  bulkDeleteUsers: vi.fn(() => Promise.resolve({ deleted: 2 })),
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

describe('UsersMultiDeleteDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the dialog with the correct title, description, input and buttons', async () => {
    const { table } = createTableMock()

    const { getByRole, getByText } = await render(
      <UsersMultiDeleteDialog open onOpenChange={vi.fn()} table={table} />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /删除 2 个用户/i,
    })
    const desc = getByText(/确定要删除所选用户吗？/)
    const confirmDeleteInput = getByRole('textbox', {
      name: /输入 "删除" 以确认/i,
    })
    const deleteButton = getByRole('button', { name: /删除/i })

    await expect.element(title).toBeInTheDocument()
    await expect.element(desc).toBeInTheDocument()
    await expect.element(confirmDeleteInput).toBeInTheDocument()
    await expect.element(deleteButton).toBeInTheDocument()
    await expect.element(deleteButton).toBeDisabled()
  })

  it('keeps the delete button disabled until the confirm delete input is filled correctly', async () => {
    const { table } = createTableMock()
    const { getByRole } = await render(
      <UsersMultiDeleteDialog open onOpenChange={vi.fn()} table={table} />
    )

    const confirmDeleteInput = getByRole('textbox', {
      name: /输入 "删除" 以确认/i,
    })
    const deleteButton = getByRole('button', { name: /删除/i })

    await expect.element(deleteButton).toBeDisabled()

    await userEvent.fill(confirmDeleteInput, 'wrong-input')
    await expect.element(deleteButton).toBeDisabled()

    await userEvent.fill(confirmDeleteInput, '删除')
    await expect.element(deleteButton).toBeEnabled()
  })

  it('closes the dialog when the cancel button is clicked', async () => {
    const { table } = createTableMock()
    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <UsersMultiDeleteDialog open onOpenChange={onOpenChange} table={table} />
    )

    const cancelButton = getByRole('button', { name: /取消/i })
    await userEvent.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('resets the confirm delete input when the dialog is closed and reopened', async () => {
    const { table } = createTableMock()

    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Reopen
          </button>
          {open ? (
            <UsersMultiDeleteDialog
              open={open}
              onOpenChange={setOpen}
              table={table}
            />
          ) : null}
        </>
      )
    }

    const { getByRole } = await render(<Harness />)

    const confirmDeleteInput = getByRole('textbox', {
      name: /输入 "删除" 以确认/i,
    })
    await userEvent.fill(confirmDeleteInput, '删除')
    await expect.element(confirmDeleteInput).toHaveValue('删除')

    const cancelButton = getByRole('button', { name: /取消/i })
    await userEvent.click(cancelButton)

    const reopenButton = getByRole('button', { name: /Reopen/i })
    await userEvent.click(reopenButton)
    await expect.element(confirmDeleteInput).toHaveValue('')
  })

  it('calls bulkDeleteUsers when deleted successfully', async () => {
    const { table, resetRowSelection } = createTableMock()
    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <UsersMultiDeleteDialog open onOpenChange={onOpenChange} table={table} />
    )

    const confirmDeleteInput = getByRole('textbox', {
      name: /输入 "删除" 以确认/i,
    })
    const deleteButton = getByRole('button', { name: /删除/i })

    await expect.element(deleteButton).toBeDisabled()

    await userEvent.fill(confirmDeleteInput, '删除')
    await expect.element(deleteButton).toBeEnabled()

    await userEvent.click(deleteButton)

    await vi.waitFor(() =>
      expect(usersApi.bulkDeleteUsers).toHaveBeenCalledOnce()
    )

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)

    await vi.waitFor(() => expect(resetRowSelection).toHaveBeenCalledOnce())
  })

  it('deletes successfully when press Enter key on the confirm delete input', async () => {
    const { table, resetRowSelection } = createTableMock()
    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <UsersMultiDeleteDialog open onOpenChange={onOpenChange} table={table} />
    )

    const confirmDeleteInput = getByRole('textbox', {
      name: /输入 "删除" 以确认/i,
    })
    const deleteButton = getByRole('button', { name: /删除/i })

    await expect.element(deleteButton).toBeDisabled()

    await userEvent.fill(confirmDeleteInput, '删除')
    await expect.element(deleteButton).toBeEnabled()

    await userEvent.keyboard('{Enter}')

    await vi.waitFor(() =>
      expect(usersApi.bulkDeleteUsers).toHaveBeenCalledOnce()
    )

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)

    await vi.waitFor(() => expect(resetRowSelection).toHaveBeenCalledOnce())
  })
})
