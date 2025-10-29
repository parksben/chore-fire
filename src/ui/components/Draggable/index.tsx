import clsx from 'clsx'
import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

export interface DraggableProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode | ((reset: () => void) => ReactNode)
  ignoreElement?: (element: HTMLElement) => boolean
}

const dragInfoDefaultValue = {
  defaultCursor: '',
  isDragging: false,
  startX: 0,
  startY: 0,
  dragStartX: 0,
  dragStartY: 0,
  translateX: 0,
  translateY: 0,
}

const dragInfo = {
  ...dragInfoDefaultValue,
}

export default function Draggable({ className, style, children, ignoreElement }: DraggableProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const reset = useCallback(() => {
    console.log('Draggable reset called')
    Object.assign(dragInfo, dragInfoDefaultValue)
    if (containerRef.current instanceof HTMLSpanElement) {
      containerRef.current.style.transform = `translate(0px, 0px)`
    }
  }, [])

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current instanceof HTMLSpanElement === false ||
        !containerRef.current.contains(event.target as Node)
      )
        return

      // ignore custom elements
      const targetElement = event.target as HTMLElement
      if (ignoreElement?.(targetElement)) return

      event.preventDefault()

      setDragging(true)
      dragInfo.isDragging = true
      dragInfo.startX = event.clientX - dragInfo.translateX
      dragInfo.startY = event.clientY - dragInfo.translateY
      dragInfo.dragStartX = event.clientX
      dragInfo.dragStartY = event.clientY

      dragInfo.defaultCursor = document.body.style.cursor
      document.body.style.cursor = 'move'
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef.current instanceof HTMLSpanElement === false) return

      if (!dragInfo.isDragging) return

      event.preventDefault()

      dragInfo.translateX = event.clientX - dragInfo.startX
      dragInfo.translateY = event.clientY - dragInfo.startY
      containerRef.current.style.transform = `translate(${dragInfo.translateX}px, ${dragInfo.translateY}px)`
    }

    const handleMouseUp = (event: MouseEvent) => {
      setDragging(false)
      dragInfo.isDragging = false
      document.body.style.cursor = dragInfo.defaultCursor

      if (
        event.clientX > window.innerWidth - 8 ||
        event.clientY > window.innerHeight - 8 ||
        event.clientX < 8 ||
        event.clientY < 8
      ) {
        reset()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [ignoreElement, reset])

  return (
    <span
      className={clsx('chore-fire-draggable', className)}
      style={{
        ...style,
        position: 'fixed',
        transform: `translate(0px, 0px)`,
        transition: dragging
          ? undefined
          : 'width 0.1s linear, height 0.1s linear, transform 0.1s linear',
      }}
      ref={containerRef}
    >
      {typeof children === 'function' ? children(reset) : children}
    </span>
  )
}
