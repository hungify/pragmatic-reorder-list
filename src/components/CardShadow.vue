<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  dragging: DOMRect
}

const props = defineProps<Props>()
</script>

<template>
  <div
    class="flex-shrink-0 rounded bg-slate-900"
    :style="{ height: `${props.dragging.height}px` }"
  >
    shadow
  </div>
</template>
