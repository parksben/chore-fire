import { type CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react'

export interface HighlightBorderProps {
  element?: (Element | null) | (() => Element | null)
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export default function HighlightBorder({
  element: userElement,
  className,
  style,
  children,
}: HighlightBorderProps) {
  const [element, setElement] = useState<Element | null>(null)

  useEffect(() => {
    setTimeout(() => {
      if (typeof userElement === 'function') {
        setElement(userElement())
      } else {
        setElement(userElement || null)
      }
    }, 0)
  }, [userElement])

  const [rect, setRect] = useState<DOMRect | null>(null)
  const animationFrameRef = useRef<number>()
  const lastUpdateTimeRef = useRef<number>(0)

  const updatePosition = useCallback(() => {
    if (!element) {
      setRect(null)
      return
    }

    const now = Date.now()

    if (now - lastUpdateTimeRef.current < 16) {
      animationFrameRef.current = requestAnimationFrame(updatePosition)
      return
    }

    lastUpdateTimeRef.current = now
    const newRect = element.getBoundingClientRect()

    setRect((prevRect) => {
      if (
        !prevRect ||
        prevRect.top !== newRect.top ||
        prevRect.left !== newRect.left ||
        prevRect.width !== newRect.width ||
        prevRect.height !== newRect.height
      ) {
        return newRect
      }
      return prevRect
    })
  }, [element])

  useEffect(() => {
    if (!element) {
      setRect(null)
      return
    }

    updatePosition()

    const handleUpdate = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(updatePosition)
    }

    window.addEventListener('resize', handleUpdate, { passive: true })

    window.addEventListener('scroll', handleUpdate, { passive: true, capture: true })

    const resizeObserver = new ResizeObserver(handleUpdate)
    const mutationObserver = new MutationObserver(handleUpdate)

    resizeObserver.observe(element)
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    })

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, { capture: true })

      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [element, updatePosition])

  if (!element || !rect) return null

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        border: '2px solid #15b9ffff',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
