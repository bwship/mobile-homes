<template>
  <div class="mx-auto max-w-5xl px-4 py-8 md:py-12">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold tracking-tight md:text-3xl">Find a Dealer</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Browse approved mobile home dealers on MH Marketplace.
      </p>
    </div>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="i in 6"
        :key="i"
        class="h-28 animate-pulse rounded-xl border border-border bg-muted/50"
      />
    </div>

    <div v-else-if="!dealers.length" class="rounded-xl border border-border bg-muted/30 px-6 py-16 text-center">
      <p class="text-sm font-medium text-muted-foreground">No dealers to show yet.</p>
      <router-link to="/search" class="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
        Search homes instead
      </router-link>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <router-link
        v-for="dealer in dealers"
        :key="dealer._id"
        :to="`/dealers/${dealer._id}`"
        class="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
      >
        <div
          class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-sm font-black text-primary"
        >
          <img
            v-if="dealer.imageUrl"
            :src="dealer.imageUrl"
            :alt="dealer.name"
            class="h-full w-full object-cover"
          />
          <span v-else>{{ dealerInitials(dealer.name) }}</span>
        </div>
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ dealer.name }}</p>
          <p v-if="dealer.url" class="truncate text-xs text-muted-foreground">{{ dealer.url }}</p>
          <p v-else class="text-xs text-muted-foreground">View listings</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'

type Dealer = {
  _id: string
  name: string
  url?: string
  imageUrl?: string | null
}

const dealers = ref<Dealer[]>([])
const loading = ref(true)

function dealerInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

onMounted(async () => {
  try {
    dealers.value = (await convex.query(api.organizations.getFeaturedDealers, {})) as Dealer[]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
