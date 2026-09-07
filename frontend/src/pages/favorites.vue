<template>
  <div class="container py-6 md:py-8">
    <h1 class="mb-2 text-3xl font-bold">Favorites</h1>
    <p class="mb-8 text-muted-foreground">Homes you’ve saved while browsing.</p>

    <div v-if="!userStore.user" class="py-12 text-center">
      <p class="mb-4 text-muted-foreground">Log in to save favorites.</p>
      <router-link to="/login"><Button>Log In</Button></router-link>
    </div>
    <div v-else-if="loading" class="text-muted-foreground">Loading…</div>
    <div
      v-else-if="listings.length === 0"
      class="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/[0.08] via-card to-card px-6 py-16 text-center sm:px-10 sm:py-20"
    >
      <div
        class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div class="relative mx-auto flex max-w-md flex-col items-center">
        <div class="relative mb-6">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <svg class="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
              />
            </svg>
          </div>
          <span
            class="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background text-xs font-bold text-muted-foreground shadow-sm ring-1 ring-border"
          >
            0
          </span>
        </div>

        <h2 class="text-xl font-bold tracking-tight sm:text-2xl">No favorites yet</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Tap the heart on homes you love while browsing. They’re saved here so you can compare and revisit anytime.
        </p>

        <router-link to="/search" class="mt-8">
          <Button size="lg" class="gap-2 px-6">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
            Browse homes
          </Button>
        </router-link>
      </div>
    </div>
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ListingCard
        v-for="listing in listings"
        :key="listing._id"
        :listing="listing"
        show-favorite
        favorited
        @favorite-change="onFavoriteChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'
import Button from '@/components/ui/Button.vue'
import ListingCard from '@/components/listings/ListingCard.vue'

const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const listings = ref<any[]>([])
const loading = ref(true)

async function load() {
  if (!userStore.user?.email) {
    listings.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    listings.value = (await convex.query(api.favorites.getUserFavorites, {
      userEmail: userStore.user.email,
    })) as any[]
    await favoritesStore.refresh()
  } finally {
    loading.value = false
  }
}

function onFavoriteChange({ listingId, favorited }: { listingId: string; favorited: boolean }) {
  if (!favorited) {
    listings.value = listings.value.filter((l) => l._id !== listingId)
  }
}

watch(
  () => userStore.user?.email,
  () => {
    void load()
  },
)

onMounted(load)
</script>
