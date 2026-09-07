<template>
  <div class="container py-16 text-center text-muted-foreground">Opening impersonate…</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useImpersonateDialogStore } from '@/stores/impersonateDialog'

const router = useRouter()
const dialog = useImpersonateDialogStore()

onMounted(() => {
  dialog.show()
  router.replace('/')
})
</script>
