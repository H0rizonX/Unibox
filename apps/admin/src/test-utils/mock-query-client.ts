import { vi } from 'vitest'

export const mockInvalidateQueries = vi.fn(() => Promise.resolve())

export function createMockQueryClient() {
  return {
    invalidateQueries: mockInvalidateQueries,
  }
}
