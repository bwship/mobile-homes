<template>
  <router-link
    :to="`/listings/${listing._id}`"
    class="group block overflow-hidden transition-all duration-300"
    :class="cardClass"
    @mouseenter="$emit('hover', listing._id)"
    @focus="$emit('hover', listing._id)"
  >
    <div class="relative overflow-hidden bg-muted" :class="imageWrapClass">
      <img
        v-if="listing.images?.[0]?.url"
        :src="listing.images[0].url"
        :alt="listing.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        No photo
      </div>
      <span
        class="absolute left-3 top-3 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
        :class="badgeClass"
      >
        {{ badgeLabel }}
      </span>
      <button
        v-if="showFavorite"
        type="button"
        class="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
        :aria-label="isFavorited ? 'Remove from favorites' : 'Save to favorites'"
        :disabled="favoriteBusy"
        @click.prevent.stop="onFavoriteClick"
      >
        <svg
          class="h-5 w-5 transition-colors"
          :class="isFavorited ? 'fill-red-500 text-red-500' : 'fill-none text-muted-foreground'"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
          />
        </svg>
      </button>
    </div>
    <div :class="bodyClass">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {{ listing.city }}, {{ listing.state }}
          </p>
          <h3 class="mt-1 font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors" :class="titleClass">
            {{ listing.title }}
          </h3>
        </div>
        <span class="shrink-0 text-right font-extrabold tabular-nums text-primary" :class="priceClass">
          {{ formatListingPrice(listing.priceCents, listing.listingType) }}
        </span>
      </div>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ bedsBathsLabel(listing.beds, listing.baths) }}
        <span v-if="listing.sqft"> · {{ listing.sqft.toLocaleString() }} sq ft</span>
      </p>
      <p v-if="listing.communityName" class="mt-1.5 text-xs text-muted-foreground line-clamp-1">
        {{ listing.communityName }}
      </p>
      <p class="mt-3 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
        View listing →
      </p>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cn } from '@/lib/utils'
import { formatListingPrice, bedsBathsLabel } from '@/lib/listingFormat'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'

const props = withDefaults(
  defineProps<{
    listing: any
    selected?: boolean
    variant?: 'grid' | 'carousel'
    showFavorite?: boolean
    favorited?: boolean
  }>(),
  { variant: 'grid', showFavorite: false, favorited: false },
)

const emit = defineEmits<{
  hover: [id: string]
  'favorite-change': [payload: { listingId: string; favorited: boolean }]
}>()

const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const favoriteBusy = ref(false)
const localFavorited = ref(props.favorited)

watch(
  () => props.favorited,
  (v) => {
    localFavorited.value = v
  },
)

const isFavorited = computed(() => localFavorited.value)

const cardClass = computed(() =>
  cn(
    'rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
    props.variant === 'carousel' && 'carousel-card w-[82vw] max-w-[320px] shrink-0 sm:w-[300px] md:w-[320px]',
    props.variant === 'grid' && 'rounded-xl',
    props.selected && 'ring-2 ring-primary',
  ),
)

const imageWrapClass = computed(() =>
  props.variant === 'carousel' ? 'aspect-[16/10]' : 'aspect-[4/3]',
)

const bodyClass = computed(() => (props.variant === 'carousel' ? 'p-4' : 'p-4'))

const titleClass = computed(() => (props.variant === 'carousel' ? 'text-base' : 'text-sm font-semibold'))

const priceClass = computed(() => (props.variant === 'carousel' ? 'text-base' : 'text-sm font-bold'))

const isSold = computed(() => props.listing.status === 'SOLD')

const badgeLabel = computed(() => {
  if (isSold.value) return 'Sold'
  return props.listing.listingType === 'RENT' ? 'For Rent' : 'For Sale'
})

const badgeClass = computed(() => {
  if (isSold.value) return 'bg-deal text-deal-foreground shadow-[0_0_14px_hsl(var(--deal)/0.45)]'
  return props.listing.listingType === 'RENT'
    ? 'bg-sky-600 text-white'
    : 'bg-primary text-white'
})

async function onFavoriteClick() {
  if (!userStore.user?.email || favoriteBusy.value) return
  favoriteBusy.value = true
  try {
    const res = await convex.mutation(api.favorites.toggleFavorite, {
      userEmail: userStore.user.email,
      listingId: props.listing._id,
    })
    const next = Boolean((res as any).favorited)
    localFavorited.value = next
    await favoritesStore.refresh()
    emit('favorite-change', { listingId: props.listing._id, favorited: next })
  } finally {
    favoriteBusy.value = false
  }
}
</script>
