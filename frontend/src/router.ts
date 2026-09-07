import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import { setupLayouts } from 'virtual:generated-layouts'
import { useUserStore } from '@/stores/user'

const routesWithLayouts = routes.map((route) => {
  if (
    route.path === '/login' ||
    route.path === '/signup' ||
    route.path === '/forgot-password' ||
    route.path === '/reset-password'
  ) {
    return { ...route, meta: { ...route.meta, layout: 'auth' } }
  }
  return route
})

export const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routesWithLayouts),
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const user = userStore.user

  if (to.path.startsWith('/admin')) {
    if (!user) return { path: '/login', query: { redirect: to.fullPath } }
    if (!userStore.canAccessAdmin) return { path: '/' }
  }

  if (to.path === '/favorites' && !user) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/profile' && !user) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  return true
})
