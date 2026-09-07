<template>
  <section class="mb-12 md:mb-16">
    <div class="flex items-end justify-between gap-4 mb-5 px-1">
      <div>
        <h2 class="text-xl md:text-2xl font-extrabold tracking-tight">{{ title }}</h2>
        <p v-if="subtitle" class="text-sm text-muted-foreground mt-1">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-accent disabled:opacity-30"
          :disabled="!canScrollPrev"
          aria-label="Scroll left"
          @click="scroll('prev')"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          class="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-accent disabled:opacity-30"
          :disabled="!canScrollNext"
          aria-label="Scroll right"
          @click="scroll('next')"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <router-link
          v-if="viewAllTo"
          :to="viewAllTo"
          class="text-sm font-semibold text-primary hover:underline underline-offset-4 whitespace-nowrap"
        >
          View all →
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="flex gap-4 overflow-hidden px-1">
      <div
        v-for="n in 4"
        :key="n"
        class="carousel-card skeleton-shimmer shrink-0 rounded-2xl border border-border/60 bg-muted/40"
      />
    </div>

    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground"
    >
      No listings yet.
    </div>

    <div
      v-else
      ref="trackRef"
      class="carousel-track flex gap-4 overflow-x-auto pb-2 px-1 snap-x snap-mandatory scrollbar-hide -mx-1"
      @scroll="updateScrollState"
    >
      <ListingCard
        v-for="listing in listings"
        :key="listing._id"
        :listing="listing"
        variant="carousel"
        class="snap-start"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import ListingCard from '@/components/listings/ListingCard.vue'

defineProps<{
  title: string
  subtitle?: string
  viewAllTo?: string | { path: string; query?: Record<string, string> }
  listings: any[]
  loading?: boolean
}>()

const trackRef = ref<HTMLElement | null>(null)
const canScrollPrev = ref(false)
const canScrollNext = ref(true)

function updateScrollState() {
  const el = trackRef.value
  if (!el) return
  canScrollPrev.value = el.scrollLeft > 8
  canScrollNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 8
}

function scroll(direction: 'prev' | 'next') {
  const el = trackRef.value
  if (!el) return
  const amount = Math.max(280, el.clientWidth * 0.85)
  el.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('resize', updateScrollState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollState)
})
</script>
