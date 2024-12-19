export type DraggableState = 'idle' | 'preview' | 'dragging' | 'over'

export interface DraggablePreview {
  element: HTMLElement
  bounds: DOMRect
}

export interface DraggableOffset {
  x: number
  y: number
}
