<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
onMounted(() => {
  router.replace('/admin/dealers')
})
</script>

<template>
  <div class="container py-16 text-muted-foreground">Redirecting to Dealers…</div>
</template>
