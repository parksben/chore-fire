import clsx from 'clsx'
import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react'

export interface DraggableProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode
  safePaddingX?: number
  safePaddingY?: number
}

export default function Draggable({
  className,
  style,
  children,
  safePaddingX = 8,
  safePaddingY = 8,
}: DraggableProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null)
  const handlerRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const dragInfo = {
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
        handlerRef.current instanceof HTMLSpanElement === false ||
        !handlerRef.current.contains(event.target as Node)
      )
        return

      event.preventDefault()

      dragInfo.isDragging = true
      dragInfo.startX = event.clientX - dragInfo.translateX
      dragInfo.startY = event.clientY - dragInfo.translateY

      if (!dragInfo.rect) {
        dragInfo.rect = containerRef.current.getBoundingClientRect()
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (
        containerRef.current instanceof HTMLSpanElement === false ||
        handlerRef.current instanceof HTMLSpanElement === false
      )
        return

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
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [safePaddingX, safePaddingY])

  return (
    <span
      className={clsx('chore-fire-float-container', className)}
      style={style}
      ref={containerRef}
    >
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      >
        <span
          className="draggable-handler"
          style={{
            lineHeight: 0,
            padding: '5px 3px',
            position: 'absolute',
            left: 0,
            top: 0,
            cursor: 'move',
            zIndex: 9999,
          }}
          ref={handlerRef}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            fill="currentColor"
            version="1.1"
            viewBox="0 0 32 32"
            width="12px"
            height="12px"
            style={{
              color: '#666',
              filter: 'contrast(2) brightness(0.8)',
              mixBlendMode: 'difference',
            }}
          >
            <title>draggable</title>
            <g>
              <path d="M10 6h4v4h-4zM18 6h4v4h-4zM10 14h4v4h-4zM18 14h4v4h-4zM10 22h4v4h-4zM18 22h4v4h-4z" />
              <path fill="none" d="M0 0h32v32H0z" />
            </g>
          </svg>
        </span>
        {children}
      </span>
    </span>
  )
}
