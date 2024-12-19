<script setup lang="ts">
import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import type { TCardData, TColumn } from '~/utils/data'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { onMounted, reactive, ref } from 'vue'
import { getColumnData, isCardData, isCardDropTargetData, isColumnData, isDraggingACard, isDraggingAColumn } from '~/utils/data'
import { isShallowEqual } from '../utils/is-shallow-equal'

type TColumnState =
  | {
    type: 'is-card-over'
    isOverChildCard: boolean
    dragging: DOMRect
  }
  | {
    type: 'is-column-over'
  }
  | {
    type: 'idle'
  }
  | {
    type: 'is-dragging'
  }

const props = defineProps<Props>()

const stateStyles: { [Key in TColumnState['type']]: string } = {
  'idle': 'cursor-grab',
  'is-card-over': 'outline outline-2 outline-neutral-50',
  'is-dragging': 'opacity-40',
  'is-column-over': 'bg-slate-900',
}

const idle = { type: 'idle' } satisfies TColumnState

interface Props {
  column: TColumn
}

const outerFullHeightRef = ref<HTMLDivElement | null>(null)
const scrollableRef = ref<HTMLDivElement | null>(null)
const headerRef = ref<HTMLDivElement | null>(null)
const innerRef = ref<HTMLDivElement | null>(null)

const state = reactive<TColumnState>(idle)

function setIsCardOver({ data, location }: { data: TCardData, location: DragLocationHistory }) {
  const innerMost = location.current.dropTargets[0]
  const isOverChildCard = Boolean(innerMost && isCardDropTargetData(innerMost.data))

  const proposed = {
    type: 'is-card-over',
    dragging: data.rect,
    isOverChildCard,
  }

  if (!isShallowEqual(proposed, state)) {
    Object.assign(state, proposed)
  }
}

onMounted(() => {
  const outer = outerFullHeightRef.value
  const scrollable = scrollableRef.value
  const header = headerRef.value
  const inner = innerRef.value

  if (!outer || !scrollable || !header || !inner) {
    return
  }

  const data = getColumnData({ column: props.column })

  combine(
    dropTargetForElements({
      element: outer,
      getData: () => data,
      canDrop({ source }) {
        return isDraggingACard({ source }) || isDraggingAColumn({ source })
      },
      getIsSticky: () => true,
      onDragStart({ source, location }) {
        if (isCardData(source.data)) {
          setIsCardOver({ data: source.data, location })
        }
      },
      onDragEnter({ source, location }) {
        if (isCardData(source.data)) {
          setIsCardOver({ data: source.data, location })
          return
        }
        if (isColumnData(source.data) && source.data.column.id !== props.column.id) {
          state.type = 'is-column-over'
        }
      },
      onDropTargetChange({ source, location }) {
        if (isCardData(source.data)) {
          setIsCardOver({ data: source.data, location })
        }
      },
      onDragLeave({ source }) {
        if (isColumnData(source.data) && source.data.column.id === props.column.id) {
          return
        }
        state.type = 'idle'
      },
      onDrop() {
        state.type = 'idle'
      },
    }),
  )
})
</script>

<template>
  <div ref="outerFullHeightRef" class="w-72 flex flex-shrink-0 flex-col select-none">
    <div
      ref="innerRef"
      :class="`flex max-h-full flex-col rounded-lg bg-slate-800 text-neutral-50 ${stateStyles[state.type]}`"
      :blockBoardPanningAttr="true"
    >
      <div :class="`flex max-h-full flex-col ${state.type === 'is-column-over' ? 'invisible' : ''}`">
        <div
          ref="scrollableRef"
          class="[overflow-anchor:none] [scrollbar-width:thin] flex flex-col overflow-y-auto [scrollbar-color:theme(colors.slate.600)_theme(colors.slate.700)]"
        >
          <Card
            v-for="card in column.cards"
            :key="card.id"
            :card="card"
            :column-id="column.id"
          />
        </div>
      </div>
    </div>
  </div>
</template>
