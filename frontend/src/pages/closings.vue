<template>
  <div class="container py-8 md:py-10">
    <div class="mb-8">
      <p class="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-deal">Closings</p>
      <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">
        Recently Closed
        <span class="text-deal">{{ dealKind === 'RENT' ? 'Leases' : 'Sales' }}</span>
      </h1>
      <p class="mt-2 max-w-2xl text-muted-foreground">
        Sold and leased manufactured homes across the marketplace — comps updated as dealers mark listings closed.
      </p>
    </div>

    <div class="mb-6 flex flex-wrap items-center gap-2">
      <button
        v-for="opt in dealOptions"
        :key="opt.value"
        type="button"
        class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
        :class="
          dealKind === opt.value
            ? 'border-deal bg-deal text-deal-foreground'
            : 'border-border text-muted-foreground hover:border-deal/40 hover:text-foreground'
        "
        @click="setKind(opt.value)"
      >
        {{ opt.label }}
      </button>

      <select
        v-model="stateFilter"
        class="ml-auto h-10 rounded-full border border-border bg-background px-4 text-sm font-medium"
        @change="load"
      >
        <option value="">All states</option>
        <option v-for="s in US_STATES" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="n in 8"
        :key="n"
        class="min-h-[380px] animate-pulse rounded-2xl border border-border/60 bg-muted/40"
      />
    </div>

    <div v-else-if="listings.length === 0" class="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
      No closed {{ dealKind === 'SALE' ? 'sales' : 'leases' }} found.
    </div>

    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ClosedDealCard
        v-for="listing in listings"
        :key="listing._id"
        :listing="listing"
        variant="grid"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { US_STATES } from '@/lib/listingFormat'
import ClosedDealCard from '@/components/listings/ClosedDealCard.vue'
import type { ClosedDealKind } from '@/components/listings/RecentlyClosedSection.vue'

const route = useRoute()
const router = useRouter()

const dealOptions = [
  { value: 'SALE' as const, label: 'Sales' },
  { value: 'RENT' as const, label: 'Leases' },
]

function kindFromQuery(): ClosedDealKind {
  return route.query.type === 'lease' || route.query.type === 'RENT' ? 'RENT' : 'SALE'
}

const dealKind = ref<ClosedDealKind>(kindFromQuery())
const stateFilter = ref(typeof route.query.state === 'string' ? route.query.state : '')
const listings = ref<any[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    listings.value = (await convex.query(api.listings.getRecentlyClosed, {
      limit: 48,
      listingType: dealKind.value,
      state: stateFilter.value || undefined,
    })) as any[]
  } finally {
    loading.value = false
  }
}

function setKind(kind: ClosedDealKind) {
  dealKind.value = kind
  router.replace({
    path: '/closings',
    query: {
      type: kind === 'RENT' ? 'lease' : 'sale',
      state: stateFilter.value || undefined,
    },
  })
}

watch(
  () => route.query.type,
  () => {
    dealKind.value = kindFromQuery()
    load()
  },
)

onMounted(load)
</script>
