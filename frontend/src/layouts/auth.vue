<template>
  <div class="auth-shell">
    <div class="relative z-10 w-full max-w-md">
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-block hover:opacity-85 transition-opacity" aria-label="MH Marketplace home">
          <div class="h-14 w-14 mx-auto rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            MH
          </div>
        </RouterLink>
        <p class="text-muted-foreground italic text-sm mt-3 tracking-wide">
          Mobile & Manufactured Home Marketplace
        </p>
      </div>
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
