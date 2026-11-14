<template>
  <div class="flex min-h-[40vh] items-center justify-center px-4">
    <p class="text-sm text-muted-foreground">Redirecting…</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (userStore.user) {
    router.replace('/profile')
    return
  }
  router.replace('/login')
})
</script>