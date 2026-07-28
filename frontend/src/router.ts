import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import { setupLayouts } from 'virtual:generated-layouts'

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
