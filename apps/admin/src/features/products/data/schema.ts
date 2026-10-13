import { z } from 'zod'
import {
  ACCEPTED_IMAGE_TYPES,
  categories,
  MAX_IMAGE_SIZE,
  MAX_IMAGES,
  productStatuses,
} from './data'

const categoryValues = categories.map((c) => c.value) as [
  (typeof categories)[number]['value'],
  ...(typeof categories)[number]['value'][],
]

const statusValues = productStatuses.map((s) => s.value) as [
  (typeof productStatuses)[number]['value'],
  ...(typeof productStatuses)[number]['value'][],
]

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  description: z.string().optional(),
  category: z.enum(categoryValues),
  status: z.enum(statusValues),
})

export type Product = z.infer<typeof productSchema>

const imageFileSchema = z
  .array(z.instanceof(File))
  .max(MAX_IMAGES, `最多上传 ${MAX_IMAGES} 张图片。`)
  .refine(
    (files) =>
      files.every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(
          file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
        )
      ),
    '仅支持 JPEG、PNG、WebP 格式。'
  )
  .refine(
    (files) => files.every((file) => file.size <= MAX_IMAGE_SIZE),
    '单张图片不能超过 5MB。'
  )

const productFormBaseSchema = z.object({
  name: z
    .string()
    .min(1, '商品名称不能为空。')
    .max(100, '商品名称不能超过 100 字。'),
  price: z
    .string()
    .min(1, '请输入价格。')
    .refine((val) => !Number.isNaN(Number(val)), '请输入有效价格。')
    .refine((val) => Number(val) > 0, '价格必须大于 0。')
    .refine(
      (val) => Math.round(Number(val) * 100) === Number(val) * 100,
      '价格最多保留 2 位小数。'
    ),
  description: z
    .string()
    .max(2000, '描述不能超过 2000 字。')
    .optional()
    .or(z.literal('')),
  category: z.enum(categoryValues, { error: '请选择商品分类。' }),
  status: z.enum(statusValues, { error: '请选择商品状态。' }),
})

export const productCreateFormSchema = productFormBaseSchema.extend({
  images: imageFileSchema.min(1, '请至少上传 1 张商品图片。'),
})

export const productUpdateFormSchema = productFormBaseSchema.extend({
  images: imageFileSchema,
})

export type ProductCreateFormValues = z.infer<typeof productCreateFormSchema>
export type ProductUpdateFormValues = z.infer<typeof productUpdateFormSchema>
export type ProductMutateFormValues = ProductCreateFormValues

/** @deprecated Use productCreateFormSchema */
export const productUploadFormSchema = productCreateFormSchema
/** @deprecated Use ProductCreateFormValues */
export type ProductUploadFormValues = ProductCreateFormValues

export const productMutateDefaultValues: ProductMutateFormValues = {
  name: '',
  price: '',
  description: '',
  category: 'other',
  status: 'draft',
  images: [],
}

/** @deprecated Use productMutateDefaultValues */
export const productUploadDefaultValues = productMutateDefaultValues
