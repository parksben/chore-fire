import clsx from 'clsx'
import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react'

export interface DraggableProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode
  safePaddingX?: number
  safePaddingY?: number
  ignoreElement?: (element: HTMLElement) => boolean
}

const clickableTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL']

export default function Draggable({
  className,
  style,
  children,
  safePaddingX = 8,
  safePaddingY = 8,
  ignoreElement,
}: DraggableProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const dragInfo = {
      defaultCursor: '',
      isDragging: false,
      startX: 0,
      startY: 0,
      rect: null as DOMRect | null,
      translateX: 0,
      translateY: 0,
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current instanceof HTMLSpanElement === false ||
        !containerRef.current.contains(event.target as Node)
      )
        return

      const targetElement = event.target as HTMLElement

      if (typeof ignoreElement === 'function') {
        // ignore custom elements
        if (ignoreElement(targetElement)) return
      } else {
        // ignore clickable elements
        if (clickableTags.includes(targetElement.tagName)) return
      }

      event.preventDefault()

      dragInfo.isDragging = true
      dragInfo.startX = event.clientX - dragInfo.translateX
      dragInfo.startY = event.clientY - dragInfo.translateY

      if (!dragInfo.rect) {
        dragInfo.rect = containerRef.current.getBoundingClientRect()
      }

      dragInfo.defaultCursor = document.body.style.cursor
      document.body.style.cursor = 'move'
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef.current instanceof HTMLSpanElement === false) return

      if (!dragInfo.isDragging) return

      event.preventDefault()

      const rect = dragInfo.rect as DOMRect

      dragInfo.translateX = event.clientX - dragInfo.startX
      if (rect.right + dragInfo.translateX > window.innerWidth - safePaddingX) {
        dragInfo.translateX = window.innerWidth - rect.right - safePaddingX
      }
      if (rect.left + dragInfo.translateX < safePaddingX) {
        dragInfo.translateX = safePaddingX - rect.left
      }

      dragInfo.translateY = event.clientY - dragInfo.startY
      if (rect.bottom + dragInfo.translateY > window.innerHeight - safePaddingY) {
        dragInfo.translateY = window.innerHeight - rect.bottom - safePaddingY
      }
      if (rect.top + dragInfo.translateY < safePaddingY) {
        dragInfo.translateY = safePaddingY - rect.top
      }

      containerRef.current.style.transform = `translate(${dragInfo.translateX}px, ${dragInfo.translateY}px)`
    }

    const handleMouseUp = () => {
      dragInfo.isDragging = false
      document.body.style.cursor = dragInfo.defaultCursor
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [safePaddingX, safePaddingY, ignoreElement])

  return (
    <span className={clsx('chore-fire-draggable', className)} style={style} ref={containerRef}>
      {children}
    </span>
  )
}
