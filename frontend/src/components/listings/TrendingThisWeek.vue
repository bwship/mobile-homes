<template>
  <section v-if="hasContent" class="mb-12 md:mb-16">
    <div class="mb-6 px-1">
      <h2 class="text-xl font-extrabold tracking-tight md:text-2xl">Trending this week</h2>
      <p class="mt-1 text-sm text-muted-foreground">Top closed sales, dealers, markets, and factories</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-border/60 bg-card p-5">
        <div class="mb-4 flex items-center gap-2.5">
          <span class="trending-icon trending-icon-sales" aria-hidden="true">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </span>
          <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top sales</h3>
        </div>
        <ul v-if="data?.topSales?.length" class="space-y-3">
          <li v-for="(listing, i) in data.topSales" :key="listing._id" class="flex gap-3">
            <span class="w-5 shrink-0 text-sm font-bold tabular-nums text-deal">{{ i + 1 }}</span>
            <router-link :to="`/listings/${listing._id}`" class="min-w-0 flex-1 hover:text-deal">
              <p class="truncate text-sm font-semibold leading-snug">{{ listing.title }}</p>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ listing.city }}, {{ listing.state }} ·
                <span class="font-semibold text-deal">{{ formatPrice(listing.priceCents) }}</span>
              </p>
            </router-link>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">No closed sales yet.</p>
      </div>

      <div class="rounded-2xl border border-border/60 bg-card p-5">
        <div class="mb-4 flex items-center gap-2.5">
          <span class="trending-icon trending-icon-dealers" aria-hidden="true">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </span>
          <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trending dealers</h3>
        </div>
        <ul v-if="data?.trendingDealers?.length" class="space-y-3">
          <li v-for="(dealer, i) in data.trendingDealers" :key="dealer.organizationId" class="flex gap-3">
            <span class="w-5 shrink-0 text-sm font-bold tabular-nums text-deal">{{ i + 1 }}</span>
            <router-link :to="`/dealers/${dealer.organizationId}`" class="min-w-0 flex-1 hover:text-deal">
              <p class="truncate text-sm font-semibold leading-snug">{{ dealer.name }}</p>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ dealer.count }} closed · {{ formatPrice(dealer.volumeCents) }}
              </p>
            </router-link>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">No dealer activity yet.</p>
      </div>

      <div class="rounded-2xl border border-border/60 bg-card p-5">
        <div class="mb-4 flex items-center gap-2.5">
          <span class="trending-icon trending-icon-states" aria-hidden="true">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trending states</h3>
        </div>
        <ul v-if="data?.trendingStates?.length" class="space-y-3">
          <li v-for="(row, i) in data.trendingStates" :key="row.state" class="flex items-center gap-3">
            <span class="w-5 shrink-0 text-sm font-bold tabular-nums text-deal">{{ i + 1 }}</span>
            <button
              type="button"
              class="min-w-0 flex-1 text-left hover:text-deal"
              @click="$emit('select-state', row.state)"
            >
              <p class="truncate text-sm font-semibold">{{ row.state }}</p>
              <p class="mt-0.5 text-xs text-muted-foreground">{{ row.count }} listings</p>
            </button>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">No state data yet.</p>
      </div>

      <div class="rounded-2xl border border-border/60 bg-card p-5">
        <div class="mb-4 flex items-center gap-2.5">
          <span class="trending-icon trending-icon-factories" aria-hidden="true">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V9l-5 2V9l-5 2V5H4v16h15zM9 17h1m4 0h1" />
            </svg>
          </span>
          <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trending factories</h3>
        </div>
        <ul v-if="data?.trendingFactories?.length" class="space-y-3">
          <li v-for="(factory, i) in data.trendingFactories" :key="factory.name" class="flex gap-3">
            <span class="w-5 shrink-0 text-sm font-bold tabular-nums text-deal">{{ i + 1 }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold">{{ factory.name }}</p>
              <p class="mt-0.5 text-xs text-muted-foreground">{{ factory.count }} homes</p>
            </div>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">No factory data yet.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatListingPrice } from '@/lib/listingFormat'

export type TrendingData = {
  topSales: any[]
  trendingDealers: { organizationId: string; name: string; count: number; volumeCents: number }[]
  trendingStates: { state: string; count: number }[]
  trendingFactories: { name: string; count: number }[]
}

const props = defineProps<{
  data: TrendingData | null
}>()

defineEmits<{ 'select-state': [state: string] }>()

const hasContent = computed(() => {
  const d = props.data
  if (!d) return false
  return (
    d.topSales.length > 0 ||
    d.trendingDealers.length > 0 ||
    d.trendingStates.length > 0 ||
    d.trendingFactories.length > 0
  )
})

function formatPrice(cents: number) {
  return formatListingPrice(cents, 'SALE')
}
</script>
