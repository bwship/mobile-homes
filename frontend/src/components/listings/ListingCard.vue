<template>
  <router-link
    :to="`/listings/${listing._id}`"
    class="group block rounded-xl border border-border/60 bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
    :class="{ 'ring-2 ring-primary': selected }"
    @mouseenter="$emit('hover', listing._id)"
    @focus="$emit('hover', listing._id)"
  >
    <div class="aspect-[4/3] bg-muted relative overflow-hidden">
      <img
        v-if="listing.images?.[0]?.url"
        :src="listing.images[0].url"
        :alt="listing.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        No photo
      </div>
      <span
        class="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full"
        :class="listing.listingType === 'RENT' ? 'bg-blue-600 text-white' : 'bg-primary text-primary-foreground'"
      >
        {{ listing.listingType === 'RENT' ? 'For Rent' : 'For Sale' }}
      </span>
    </div>
    <div class="p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{{ listing.title }}</h3>
        <span class="font-bold text-primary shrink-0">{{ formatListingPrice(listing.priceCents, listing.listingType) }}</span>
      </div>
      <p class="text-sm text-muted-foreground mt-1">{{ bedsBathsLabel(listing.beds, listing.baths) }}</p>
      <p class="text-sm text-muted-foreground mt-1">{{ listing.city }}, {{ listing.state }}</p>
      <p v-if="listing.communityName" class="text-xs text-muted-foreground mt-2">{{ listing.communityName }}</p>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { formatListingPrice, bedsBathsLabel } from '@/lib/listingFormat'

defineProps<{
  listing: any
  selected?: boolean
}>()

defineEmits<{ hover: [id: string] }>()
</script>
