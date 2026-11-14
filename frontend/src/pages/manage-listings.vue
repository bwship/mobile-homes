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
  const orgId = userStore.user?.organizationId
  if (orgId && (userStore.isDealer || userStore.isAdmin || userStore.canAccessAdmin)) {
    router.replace(`/dealers/${orgId}`)
    return
  }
  router.replace({ path: '/signup', query: { role: 'SELLER' } })
})
</script>
