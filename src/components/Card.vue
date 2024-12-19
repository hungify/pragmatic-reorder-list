<script setup lang="ts">
import type { TCard } from '~/utils/data'
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { onMounted, ref } from 'vue'
import { getCardData, getCardDropTargetData, isCardData, isDraggingACard } from '~/utils/data'
import { isSafari } from '../utils/is-safari'
import { isShallowEqual } from '../utils/is-shallow-equal'
import CardShadow from './CardShadow.vue'

interface Props {
  card: TCard
  columnId: string
}

const props = defineProps<Props>()

const innerStyles = {
  'idle': 'hover:outline outline-2 outline-neutral-50 cursor-grab',
  'is-dragging': 'opacity-40',
} satisfies Partial<Record<TCardState['type'], string>>

const outerStyles = {
  'is-dragging-and-left-self': '!hidden',
} satisfies Partial<Record<TCardState['type'], string>>

type TCardState =
  | { type: 'idle' }
  | { type: 'is-dragging' }
  | { type: 'is-dragging-and-left-self' }
  | { type: 'is-over', dragging: DOMRect, closestEdge: Edge }
  | { type: 'preview', container: HTMLElement, dragging: DOMRect }

const state = ref<TCardState>({ type: 'idle' })
const outerRef = ref<HTMLDivElement | null>(null)
const innerRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const outer = outerRef.value
  const inner = innerRef.value

  if (!outer || !inner)
    return

  return combine(
    draggable({
      element: inner,
      getInitialData: ({ element }) =>
        getCardData({
          card: props.card,
          columnId: props.columnId,
          rect: element.getBoundingClientRect(),
        }),
      onGenerateDragPreview({ nativeSetDragImage, location, source }) {
        const data = source.data
        if (!isCardData(data))
          return

        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: preserveOffsetOnSource({
            element: inner,
            input: location.current.input,
          }),
          render({ container }) {
            state.value = {
              type: 'preview',
              container,
              dragging: inner.getBoundingClientRect(),
            }
          },
        })
      },
      onDragStart() {
        state.value = { type: 'is-dragging' }
      },
      onDrop() {
        state.value = { type: 'idle' }
      },
    }),
    dropTargetForElements({
      element: outer,
      getIsSticky: () => true,
      canDrop: isDraggingACard,
      getData: ({ element, input }) => {
        const data = getCardDropTargetData({
          card: props.card,
          columnId: props.columnId,
        })
        return attachClosestEdge(data, {
          element,
          input,
          allowedEdges: ['top', 'bottom'],
        })
      },
      onDragEnter({ source, self }) {
        if (!isCardData(source.data))
          return
        if (source.data.card.id === props.card.id)
          return

        const closestEdge = extractClosestEdge(self.data)
        if (!closestEdge)
          return

        state.value = {
          type: 'is-over',
          dragging: source.data.rect,
          closestEdge,
        }
      },
      onDrag({ source, self }) {
        if (!isCardData(source.data))
          return
        if (source.data.card.id === props.card.id)
          return

        const closestEdge = extractClosestEdge(self.data)
        if (!closestEdge)
          return

        const proposed: TCardState = {
          type: 'is-over',
          dragging: source.data.rect,
          closestEdge,
        }

        if (!isShallowEqual(proposed, state.value)) {
          state.value = proposed
        }
      },
      onDragLeave({ source }) {
        if (!isCardData(source.data))
          return

        if (source.data.card.id === props.card.id) {
          state.value = { type: 'is-dragging-and-left-self' }
          return
        }

        state.value = { type: 'idle' }
      },
      onDrop() {
        state.value = { type: 'idle' }
      },
    }),
  )
})
</script>

<template>
  <div
    ref="outerRef"
    class="flex flex-shrink-0 flex-col gap-2 px-3 py-1"
    :class="outerStyles[state.type]"
  >
    <!-- Shadow before item if closer to top edge -->
    <CardShadow
      v-if="state.type === 'is-over' && state.closestEdge === 'top'"
      :dragging="state.dragging"
    >
      Shadow top
    </CardShadow>

    <div
      ref="innerRef"
      class="rounded bg-slate-700 p-2 text-slate-300"
      :class="innerStyles[state.type]"
      :style="state.type === 'preview' ? {
        width: `${state.dragging.width}px`,
        height: `${state.dragging.height}px`,
        transform: !isSafari() ? 'rotate(4deg)' : undefined,
      } : {}"
    >
      <div>{{ card.description }}</div>
      {{ state.type }}
    </div>

    <!-- Shadow after item if closer to bottom edge -->
    <CardShadow
      v-if="state.type === 'is-over' && state.closestEdge === 'bottom'"
      :dragging="state.dragging"
    >
      Shadow top
    </CardShadow>
  </div>

  <!-- Preview portal -->
  <Teleport
    v-if="state.type === 'preview'"
    :to="state.container"
  >
    <div
      class="rounded bg-slate-700 p-2 text-slate-300"
      :style="{
        width: `${state.dragging.width}px`,
        height: `${state.dragging.height}px`,
        transform: !isSafari() ? 'rotate(4deg)' : undefined,
      }"
    >
      <div>{{ card.description }}</div>
      preview
    </div>
  </Teleport>
</template>
