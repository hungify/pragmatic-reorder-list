import type {
  AllDragTypes,
  BaseEventPayload,
  DropTargetGetFeedbackArgs,
  ElementDragType,
  Input,
} from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import type {
  MaybeRefOrGetter,
  StyleValue,
} from 'vue'
import type { DraggableOffset, DraggablePreview, DraggableState } from '~/types/draggable'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview'
import {
  onMounted,
  ref,
  toValue,
  watchEffect,
} from 'vue'

// Lib doesn't export these types, so we need to define them ourselves
interface DraggableGetFeedbackArgs {
  /**
   * The user input as a drag is trying to start (the `initial` input)
   */
  input: Input
  /**
   * The `draggable` element
   */
  element: HTMLElement
  /**
   * The `dragHandle` element for the `draggable`
   */
  dragHandle: Element | null
}

interface DraggableOptions<
  TElement extends HTMLElement,
  TDragType extends AllDragTypes = ElementDragType,
> {
  element: MaybeRefOrGetter<TElement | null>
  canDrag?: (args: DraggableGetFeedbackArgs) => boolean
  canDrop?: (args: DropTargetGetFeedbackArgs<TDragType>) => boolean
  handle?: Element
  getInitialData?: (args: DraggableGetFeedbackArgs) => Record<string, unknown>
  getData?: (
    args: DropTargetGetFeedbackArgs<TDragType>
  ) => Record<string | symbol, unknown>
  onDragLeave?: (args: BaseEventPayload<TDragType>) => void
}

const draggablePreviewStyles: StyleValue = {
  position: 'fixed',
  pointerEvents: 'none',
  willChange: 'transform',
  zIndex: 1000,
  top: 0,
  left: 0,
}

export function useDraggable<TElement extends HTMLElement>(options: DraggableOptions<TElement>) {
  const state = ref<DraggableState>('idle')
  const pointer = ref<Input | null>(null)
  const offset = ref<DraggableOffset | null>(null)
  const preview = ref<DraggablePreview | null>(null)
  const previewElement = ref<HTMLElement | null>(null)

  const resetDraggable = () => {
    previewElement.value = null
    preview.value = null
    pointer.value = null
    offset.value = null
  }

  onMounted(() => {
    const element = toValue(options.element)
    if (!element)
      return

    combine(
      draggable({
        element,
        getInitialData: options.getInitialData,
        canDrag: options.canDrag,
        onDragStart: ({ location }) => {
          state.value = 'dragging'
          const { input } = location.current

          const bounds = element.getBoundingClientRect()
          offset.value = {
            x: input.clientX - bounds.left,
            y: input.clientY - bounds.top,
          }
          pointer.value = input
        },
        onDrag: ({ location }) => {
          state.value = 'dragging'
          pointer.value = location.current.input
        },
        onDrop: () => {
          state.value = 'idle'
          resetDraggable()
        },
        onGenerateDragPreview: ({ source, nativeSetDragImage }) => {
          disableNativeDragPreview({ nativeSetDragImage })

          const bounds = source.element.getBoundingClientRect()
          if (!bounds)
            return

          preview.value = {
            element: source.element,
            bounds,
          }
        },
      }),
      dropTargetForElements({
        element,
        canDrop: options.canDrop,
        getData: options.getData,
        onDragEnter: () => (state.value = 'over'),
        onDragLeave: () => (state.value = 'idle'),
        onDrop: () => (state.value = 'idle'),
      }),
    )
  })

  watchEffect(() => {
    if (
      !previewElement.value
      || !pointer.value
      || !offset.value
      || !preview.value
    ) {
      return
    }

    Object.assign(previewElement.value.style, {
      ...draggablePreviewStyles,
      width: `${preview.value.bounds.width}px`,
      height: `${preview.value.bounds.height}px`,
    })

    const x = pointer.value.clientX - offset.value.x
    const y = pointer.value.clientY - offset.value.y

    requestAnimationFrame(() => {
      if (!previewElement.value)
        return
      Object.assign(previewElement.value.style, {
        transform: `translate(${x}px, ${y}px)`,
      })
    })
  })

  return {
    state,
    preview,
    previewElement,
  }
}
