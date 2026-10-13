import { createFileRoute, redirect } from '@tanstack/react-router'
import { Products } from '@/features/products'
import { hasRole } from '@/lib/authorization'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/products/')({
  beforeLoad: () => {
    const roles = useAuthStore.getState().auth.user?.role
    if (!hasRole(roles, ['tenant', 'admin', 'superadmin'])) {
      throw redirect({ to: '/' })
    }
  },
  component: Products,
})
