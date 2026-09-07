<template>
  <section class="mb-12 md:mb-16" ref="sectionRef">
    <div class="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
      <div class="relative">
        <h2 class="flex flex-wrap items-baseline gap-x-2 text-xl font-extrabold tracking-tight md:text-2xl">
          <span>Recently Closed</span>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-deal transition-colors hover:brightness-110"
            :aria-expanded="menuOpen"
            @click.stop="menuOpen = !menuOpen"
          >
            {{ dealKindLabel }}
            <svg class="h-4 w-4 transition-transform" :class="menuOpen && 'rotate-180'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </h2>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ dealKind === 'SALE' ? 'Homes that just sold on the marketplace' : 'Homes that were just leased' }}
        </p>

        <div
          v-if="menuOpen"
          class="absolute left-0 top-full z-20 mt-2 min-w-[140px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
        >
          <button
            v-for="opt in dealOptions"
            :key="opt.value"
            type="button"
            class="block w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-muted"
            :class="dealKind === opt.value ? 'text-deal' : 'text-foreground'"
            @click="selectKind(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          class="hidden h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-accent disabled:opacity-30 sm:inline-flex"
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
          class="hidden h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-accent disabled:opacity-30 sm:inline-flex"
          :disabled="!canScrollNext"
          aria-label="Scroll right"
          @click="scroll('next')"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex gap-4 overflow-hidden px-1">
      <div
        v-for="n in 4"
        :key="n"
        class="min-h-[380px] w-[82vw] max-w-[320px] shrink-0 animate-pulse rounded-2xl border border-border/60 bg-muted/40 sm:w-[300px]"
      />
    </div>

    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground"
    >
      No closed {{ dealKind === 'SALE' ? 'sales' : 'leases' }} yet.
    </div>

    <div
      v-else
      ref="trackRef"
      class="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scrollbar-hide"
      @scroll="updateScrollState"
    >
      <ClosedDealCard
        v-for="listing in listings"
        :key="listing._id"
        :listing="listing"
        class="snap-start"
      />
    </div>

    <router-link
      :to="{ path: '/closings', query: { type: dealKind === 'RENT' ? 'lease' : 'sale' } }"
      class="mt-5 flex w-full items-center justify-center rounded-xl border border-border/60 py-3 text-sm font-bold text-deal transition-colors hover:border-deal/50 hover:bg-deal/5"
    >
      View all closed {{ dealKind === 'SALE' ? 'sales' : 'leases' }} →
    </router-link>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ClosedDealCard from './ClosedDealCard.vue'

export type ClosedDealKind = 'SALE' | 'RENT'

const props = defineProps<{
  listings: any[]
  loading?: boolean
  dealKind: ClosedDealKind
}>()

const emit = defineEmits<{ 'update:dealKind': [ClosedDealKind] }>()

const menuOpen = ref(false)
const sectionRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const canScrollPrev = ref(false)
const canScrollNext = ref(true)

const dealOptions = [
  { value: 'SALE' as const, label: 'Sales' },
  { value: 'RENT' as const, label: 'Leases' },
]

const dealKindLabel = computed(() => (props.dealKind === 'RENT' ? 'Leases' : 'Sales'))

function selectKind(kind: ClosedDealKind) {
  emit('update:dealKind', kind)
  menuOpen.value = false
}

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

function onDocClick(e: MouseEvent) {
  if (!menuOpen.value) return
  const target = e.target as Node | null
  if (target && sectionRef.value?.contains(target)) return
  menuOpen.value = false
}

watch(
  () => props.listings,
  () => requestAnimationFrame(updateScrollState),
)

onMounted(() => {
  updateScrollState()
  window.addEventListener('resize', updateScrollState)
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollState)
  document.removeEventListener('click', onDocClick)
})
</script>
