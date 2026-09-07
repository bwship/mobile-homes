<template>
  <div v-if="companies.length" class="hero-logo-rail" @mouseenter="paused = true" @mouseleave="paused = false">
    <div class="hero-marquee-mask overflow-hidden py-5">
      <div
        class="hero-marquee-track flex w-max items-center"
        :class="paused && 'hero-marquee-paused'"
      >
        <div
          v-for="loop in 2"
          :key="loop"
          class="flex items-center"
          :aria-hidden="loop === 2 ? 'true' : undefined"
        >
          <router-link
            v-for="company in displayCompanies"
            :key="`${loop}-${company._id}`"
            :to="`/dealers/${company._id}`"
            class="hero-logo-item transition-colors hover:text-white"
          >
            {{ company.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export type MarqueeCompany = {
  _id: string
  name: string
  url?: string
  imageUrl?: string
}

const props = defineProps<{
  companies: MarqueeCompany[]
}>()

const paused = ref(false)

/** Repeat items so the track is long enough to scroll smoothly. */
const displayCompanies = computed(() => {
  const list = props.companies
  if (list.length === 0) return []
  if (list.length >= 8) return list
  const out: MarqueeCompany[] = []
  while (out.length < 8) out.push(...list)
  return out
})
</script>
