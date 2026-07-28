<template>
  <div ref="mapEl" class="w-full h-full min-h-[320px] rounded-xl bg-muted" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  listings: any[]
  selectedId?: string | null
  center?: { lat: number; lng: number }
  zoom?: number
}>()

const emit = defineEmits<{ select: [id: string] }>()

const mapEl = ref<HTMLElement | null>(null)
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() ?? ''

let map: google.maps.Map | null = null
let markers: google.maps.Marker[] = []

function loadGoogleMapsScript(): Promise<void> {
  if (typeof google !== 'undefined' && google.maps) return Promise.resolve()
  return new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'))
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

function syncMarkers() {
  if (!map) return
  markers.forEach((m) => m.setMap(null))
  markers = []

  for (const listing of props.listings) {
    if (listing.lat == null || listing.lng == null) continue
    const marker = new google.maps.Marker({
      map,
      position: { lat: listing.lat, lng: listing.lng },
      title: listing.title,
    })
    marker.addListener('click', () => emit('select', listing._id))
    markers.push(marker)
  }

  if (props.selectedId) {
    const selected = props.listings.find((l) => l._id === props.selectedId)
    if (selected?.lat != null && selected?.lng != null) {
      map.panTo({ lat: selected.lat, lng: selected.lng })
    }
  } else if (props.listings.length > 1) {
    const bounds = new google.maps.LatLngBounds()
    props.listings.forEach((l) => {
      if (l.lat != null && l.lng != null) bounds.extend({ lat: l.lat, lng: l.lng })
    })
    if (!bounds.isEmpty()) map.fitBounds(bounds, 48)
  }
}

onMounted(async () => {
  if (!mapEl.value) return
  try {
    await loadGoogleMapsScript()
    map = new google.maps.Map(mapEl.value, {
      center: props.center ?? { lat: 28.5383, lng: -81.3792 },
      zoom: props.zoom ?? 7,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })
    syncMarkers()
  } catch (err) {
    console.error(err)
    if (mapEl.value) {
      mapEl.value.innerHTML = '<div class="flex h-full items-center justify-center text-sm text-muted-foreground p-4 text-center">Add VITE_GOOGLE_MAPS_API_KEY to show the map.</div>'
    }
  }
})

watch(() => [props.listings, props.selectedId], syncMarkers, { deep: true })

onUnmounted(() => {
  markers.forEach((m) => m.setMap(null))
  markers = []
  map = null
})
</script>
