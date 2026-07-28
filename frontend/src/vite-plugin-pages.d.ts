declare module '~pages' {
  import { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}

declare module 'virtual:generated-layouts' {
  import { RouteRecordRaw } from 'vue-router'
  export function setupLayouts(routes: RouteRecordRaw[]): RouteRecordRaw[]
}

declare module 'virtual:generated-pages' {
  import { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}

declare global {
  function definePageMeta(meta: { layout?: string }): void
}
