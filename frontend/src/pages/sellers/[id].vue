<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

onMounted(() => {
  router.replace(`/dealers/${id.value}`)
})
</script>

<template>
  <div class="container py-16 text-muted-foreground">Redirecting…</div>
</template>
