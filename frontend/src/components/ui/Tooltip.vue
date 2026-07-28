<template>
  <div class="relative inline-block" ref="containerRef">
    <slot />
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isVisible"
          class="fixed z-[200] px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
          :style="tooltipStyle"
        >
          {{ text }}
          <div
            class="absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45"
            :class="arrowClasses"
          ></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
})

const GAP = 8

const isVisible = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})

const arrowClasses = computed(() => {
  const map = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2',
  }
  return map[props.position]
})

function updatePosition() {
  const trigger = containerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  switch (props.position) {
    case 'top':
      tooltipStyle.value = {
        left: `${cx}px`,
        top: `${rect.top - GAP}px`,
        transform: 'translate(-50%, -100%)',
      }
      break
    case 'bottom':
      tooltipStyle.value = {
        left: `${cx}px`,
        top: `${rect.bottom + GAP}px`,
        transform: 'translate(-50%, 0)',
      }
      break
    case 'left':
      tooltipStyle.value = {
        left: `${rect.left - GAP}px`,
        top: `${cy}px`,
        transform: 'translate(-100%, -50%)',
      }
      break
    case 'right':
      tooltipStyle.value = {
        left: `${rect.right + GAP}px`,
        top: `${cy}px`,
        transform: 'translate(0, -50%)',
      }
      break
  }
}

const show = async () => {
  updatePosition()
  isVisible.value = true
  await nextTick()
  updatePosition()
}

const hide = () => {
  isVisible.value = false
}

const onScrollOrResize = () => {
  if (isVisible.value) updatePosition()
}

onMounted(() => {
  const el = containerRef.value
  if (!el) return
  el.addEventListener('mouseenter', show)
  el.addEventListener('mouseleave', hide)
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize)
})

onUnmounted(() => {
  const el = containerRef.value
  if (el) {
    el.removeEventListener('mouseenter', show)
    el.removeEventListener('mouseleave', hide)
  }
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
})
</script>
