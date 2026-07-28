<template>
  <div>
    <h1 class="text-3xl font-bold mb-2">Saved homes</h1>
    <p class="text-muted-foreground mb-8">Listings you've saved while browsing.</p>

    <div v-if="!userStore.user" class="text-center py-12">
      <p class="mb-4 text-muted-foreground">Log in to save homes.</p>
      <router-link to="/login"><Button>Log In</Button></router-link>
    </div>
    <div v-else-if="loading" class="text-muted-foreground">Loading…</div>
    <div v-else-if="listings.length === 0" class="text-muted-foreground">No saved homes yet.</div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ListingCard v-for="listing in listings" :key="listing._id" :listing="listing" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import Button from '@/components/ui/Button.vue'
import ListingCard from '@/components/listings/ListingCard.vue'

const userStore = useUserStore()
const listings = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!userStore.user?.email) {
    loading.value = false
    return
  }
  try {
    listings.value = (await convex.query(api.favorites.getUserFavorites, {
      userEmail: userStore.user.email,
    })) as any[]
  } finally {
    loading.value = false
  }
})
</script>
