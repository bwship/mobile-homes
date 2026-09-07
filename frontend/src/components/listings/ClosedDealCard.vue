<template>
  <router-link
    :to="`/listings/${listing._id}`"
    class="group flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:border-deal/40 hover:shadow-lg hover:shadow-deal/10"
    :class="
      variant === 'carousel'
        ? 'w-[82vw] max-w-[320px] shrink-0 sm:w-[300px] md:w-[320px]'
        : 'w-full'
    "
  >
    <div class="relative aspect-[16/11] overflow-hidden bg-muted">
      <img
        v-if="listing.images?.[0]?.url"
        :src="listing.images[0].url"
        :alt="listing.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        No photo
      </div>

      <span class="absolute left-3 top-3 rounded-sm bg-deal px-2 py-1 text-[11px] font-black uppercase tracking-wide text-deal-foreground shadow-[0_0_18px_hsl(var(--deal)/0.55)]">
        {{ isLease ? 'Leased' : 'Sold' }}
      </span>

      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-10">
        <div class="inline-block rounded-md bg-white px-3 py-1.5 text-lg font-black tabular-nums tracking-tight text-black shadow-md">
          {{ priceLabel }}
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-2 text-[15px] font-bold leading-snug text-foreground transition-colors group-hover:text-deal">
        {{ listing.title }}
      </h3>

      <p v-if="metricLabel" class="mt-2 text-sm font-bold text-deal">
        {{ metricLabel }}
      </p>

      <p class="mt-1.5 text-xs text-muted-foreground line-clamp-1">
        {{ listing.address1 }}, {{ listing.city }}, {{ listing.state }}
      </p>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <span class="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {{ listing.state }}
        </span>
        <span v-if="listing.manufacturer" class="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {{ listing.manufacturer }}
        </span>
        <span class="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {{ isLease ? 'Lease' : 'Sale' }}
        </span>
      </div>

      <div class="mt-auto flex items-center justify-between gap-2 pt-4">
        <div class="flex min-w-0 items-center gap-2">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-deal/20 text-[10px] font-black text-deal">
            {{ dealerInitials }}
          </div>
          <span class="truncate text-xs font-medium text-muted-foreground">
            {{ listing.organizationName ?? 'Dealer' }}
          </span>
        </div>
        <span v-if="closedDate" class="shrink-0 text-[11px] text-muted-foreground">
          {{ closedDate }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatListingPrice } from '@/lib/listingFormat'

const props = withDefaults(
  defineProps<{
    listing: any
    variant?: 'carousel' | 'grid'
  }>(),
  { variant: 'carousel' },
)

const isLease = computed(() => props.listing.listingType === 'RENT')

const priceLabel = computed(() =>
  formatListingPrice(props.listing.priceCents, props.listing.listingType),
)

const metricLabel = computed(() => {
  const sqft = props.listing.sqft
  if (!sqft || sqft <= 0) return null
  if (isLease.value) {
    const beds = props.listing.beds
    return beds != null ? `${beds} bd · $${Math.round(props.listing.priceCents / 100).toLocaleString()}/mo` : null
  }
  const perSf = Math.round(props.listing.priceCents / 100 / sqft)
  return `$${perSf.toLocaleString()}/SF`
})

const dealerInitials = computed(() => {
  const name = String(props.listing.organizationName ?? 'D')
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
})

const closedDate = computed(() => {
  const ts = props.listing.soldAt ?? props.listing.updatedAt
  if (!ts) return null
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})
</script>
