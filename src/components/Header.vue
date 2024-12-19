<script setup lang="ts">
import { Github } from 'lucide-vue-next'
import FPSCounter from './FPSCounter.vue'

defineProps<{ scrollMode: 'window' | 'list' }>()
defineEmits<{
  'update:scrollMode': (value: 'window' | 'list') => void
  'update:showImage': (value: boolean) => void
}>()

const scrollMode = defineModel('scrollMode', {
  type: String,
  default: 'window',
})

const showImage = defineModel('showImage', {
  type: Boolean,
  default: true,
})

function toggleScrollMode() {
  scrollMode.value = scrollMode.value === 'window' ? 'list' : 'window'
}

function toggleShowImage() {
  showImage.value = !showImage.value
}
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-gray-200 bg-white p-3">
    <div class="flex items-center justify-between gap-3">
      <FPSCounter />
      <div class="flex items-center justify-center gap-4">
        <button
          class="cursor-pointer border border-gray-300 rounded bg-purple-600 px-4 py-2 text-white transition-all"
          :class="{ 'border-purple-600': scrollMode === 'window' }"
          @click="toggleScrollMode"
        >
          Scroll: {{ scrollMode === "window" ? "Window" : "List" }}
        </button>
        <button
          class="cursor-pointer border border-gray-300 rounded bg-purple-600 px-4 py-2 text-white transition-all"
          :class="{ 'border-purple-600': showImage }"
          @click="toggleShowImage"
        >
          Mode: {{ showImage ? "Image" : "Text" }}
        </button>
        <a
          href="https://github.com/hungify/pragmatic-reorder-list"
          target="_blank"
          class="h-7 w-7 flex items-center justify-center rounded-full bg-gray-200"
        >
          <img src="/icons/github.svg" alt="GitHub">
        </a>
      </div>
    </div>
  </header>
</template>
