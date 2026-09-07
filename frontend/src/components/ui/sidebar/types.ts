import type { InjectionKey, Ref } from 'vue'

export type SidebarState = 'expanded' | 'collapsed'

export interface SidebarContext {
  state: Ref<SidebarState>
  isMobile: Ref<boolean>
  mobileOpen: Ref<boolean>
  toggleSidebar: () => void
  setMobileOpen: (open: boolean) => void
}

export const SIDEBAR_KEY: InjectionKey<SidebarContext> = Symbol('sidebar')
