<template>
  <div class="auth-panel">
    <slot />
    <div class="mt-6 pt-4 border-t border-border/60 flex justify-center">
      <AuthThemeToggle />
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthThemeToggle from '@/components/layout/AuthThemeToggle.vue'
</script>
