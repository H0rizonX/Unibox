import { useEffect } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import * as settingsApi from '@/api/settings'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const profileFormSchema = z.object({
  username: z
    .string('请输入用户名。')
    .min(2, '用户名至少需要 2 个字符。')
    .max(30, '用户名不能超过 30 个字符。'),
  email: z.email({
    error: (iss) =>
      iss.input === undefined ? '请选择要显示的邮箱。' : undefined,
  }),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.url('请输入有效的 URL。'),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: ProfileFormValues = {
  username: '',
  email: '',
  bio: '',
  urls: [],
}

export function ProfileForm() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: settingsApi.getProfile,
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (data) {
      form.reset({
        username: data.username,
        email: data.email,
        bio: data.bio,
        urls: data.urls?.length ? data.urls : [{ value: '' }],
      })
    }
  }, [data, form])

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await settingsApi.updateProfile({
              ...values,
              urls: values.urls?.filter((item) => item.value) ?? [],
            })
            await queryClient.invalidateQueries({
              queryKey: ['settings', 'profile'],
            })
            toast.success('资料已更新。')
          } catch (error) {
            handleServerError(error)
          }
        })}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder='shadcn' {...field} />
              </FormControl>
              <FormDescription>
                这是您的公开显示名称，可以是真实姓名或昵称。每 30
                天只能修改一次。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormDescription>
                您可以在 <Link to='/'>邮件设置</Link> 中管理已验证的邮箱地址。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>简介</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='介绍一下您自己'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                您可以使用 <span>@提及</span> 其他用户和组织来链接他们。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    链接
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    添加您的网站、博客或社交媒体链接。
                  </FormDescription>
                  <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            添加链接
          </Button>
        </div>
        <Button type='submit'>更新资料</Button>
      </form>
    </Form>
  )
}
