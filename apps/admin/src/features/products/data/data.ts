export const categories = [
  { value: 'electronics', label: '数码' },
  { value: 'clothing', label: '服饰' },
  { value: 'food', label: '食品' },
  { value: 'other', label: '其他' },
] as const

export const productStatuses = [
  { value: 'draft', label: '草稿' },
  { value: 'active', label: '上架' },
] as const

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const MAX_IMAGES = 5
