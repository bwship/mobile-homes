<template>
  <div
    class="relative mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card/70 shadow-lg shadow-black/5 backdrop-blur-md dark:bg-card/55 dark:shadow-black/30"
  >
    <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/40 opacity-90" />

    <div class="relative h-28 overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-primary/5">
      <div class="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
      <div class="pointer-events-none absolute -left-8 -top-6 h-24 w-24 rounded-full bg-primary/30 blur-3xl" />
      <div class="pointer-events-none absolute -right-6 top-2 h-20 w-20 rounded-full bg-sky-400/25 blur-3xl" />
    </div>

    <div class="absolute left-5 top-20 z-10">
      <slot name="icon">
        <BrandLogo to="/" size="lg" badge />
      </slot>
    </div>

    <div class="space-y-5 px-5 pb-5 pt-10">
      <div v-if="title || subtitle || $slots.heading" class="space-y-1">
        <slot name="heading">
          <h1 v-if="title" class="text-lg font-semibold tracking-tight">{{ title }}</h1>
          <p v-if="subtitle" class="text-sm text-muted-foreground">{{ subtitle }}</p>
        </slot>
      </div>
      <slot />
    </div>

    <div class="border-t border-border bg-background/30">
      <div class="flex justify-center py-2">
        <AuthThemeToggle />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import AuthThemeToggle from '@/components/layout/AuthThemeToggle.vue'

defineProps<{
  title?: string
  subtitle?: string
}>()
</script>
