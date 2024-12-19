<script setup lang="ts">
import { onMounted, ref } from 'vue'

const fps = ref(0)
let frameCount = 0
let lastTime = performance.now()

function updateFPS() {
  const now = performance.now()
  frameCount++

  if (now - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (now - lastTime))
    frameCount = 0
    lastTime = now
  }

  requestAnimationFrame(updateFPS)
}

onMounted(() => {
  updateFPS()
})
</script>

<template>
  <div class="rounded bg-black bg-opacity-70 p-1.5 text-sm text-white">
    FPS: {{ fps }}
  </div>
</template>
