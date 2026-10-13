import {
  AudioWaveform,
  Bell,
  Command,
  GalleryVerticalEnd,
  HelpCircle,
  LayoutDashboard,
  ListTodo,
  MessagesSquare,
  Monitor,
  Package,
  Palette,
  Settings,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react'
import type { SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn 管理后台',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: '企业版',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: '创业版',
    },
  ],
  navGroups: [
    {
      title: '常规',
      items: [
        {
          title: '仪表盘',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '待办',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: '商品',
          url: '/products',
          icon: Package,
          roles: ['tenant', 'admin', 'superadmin'],
        },
        {
          title: '聊天',
          url: '/chats',
          badge: '',
          icon: MessagesSquare,
        },
        {
          title: '用户',
          url: '/users',
          icon: Users,
          roles: ['superadmin', 'admin'],
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          title: '设置',
          icon: Settings,
          items: [
            {
              title: '个人资料',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: '账户',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: '外观',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: '通知',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: '显示',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: '帮助中心',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
