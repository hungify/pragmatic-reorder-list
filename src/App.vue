<script setup lang="ts">
import type { TColumn } from '~/utils/data'
import Column from '~/components/Column.vue'

defineOptions({
  name: 'IndexPage',
})

const scrollMode = ref<'window' | 'list'>('window')
const showImage = ref(false)

const column: TColumn = {
  id: 'column:a',
  title: 'Column A',
  cards: Array.from({ length: 5 }).fill(null).map((_, i) => ({
    id: `card:a:${i}`,
    description: `Card A${i}`,
  })),
}
</script>

<template>
  <Header v-model:scroll-mode="scrollMode" v-model:show-image="showImage" />
  <main font-sans p="x-4 y-10" text="center gray-700 dark:gray-200">
    <Column :column="column" />
  </main>
</template>
