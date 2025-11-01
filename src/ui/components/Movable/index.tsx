import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export interface MovableApi {
  reset: () => void
  revert: () => void
  adjust: () => void
}

export interface MovableProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode | ((api: MovableApi) => ReactNode)
  ignoreElement?: (element: HTMLElement) => boolean
  getApi?: (api: MovableApi) => void
  safeMargin?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
}

const SAFE_MARGIN_DEFAULT_VALUE = {
  left: 8,
  right: 8,
  top: 8,
  bottom: 8,
}

const DRAG_INFO_DEFAULT_VALUE = {
  defaultCursor: '',
  isDragging: false,
  startX: 0,
  startY: 0,
  dragStartX: 0,
  dragStartY: 0,
  translateX: 0,
  translateY: 0,
}

export default function Movable({
  className,
  style,
  children,
  ignoreElement,
  getApi,
  safeMargin: userSafeMargin,
}: MovableProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null)

  const cacheRef = useRef({
    dragInfo: { ...DRAG_INFO_DEFAULT_VALUE },
    lastPosition: { translateX: 0, translateY: 0 },
  })

  const safeMargin = useMemo(
    () => ({ ...SAFE_MARGIN_DEFAULT_VALUE, ...userSafeMargin }),
    [userSafeMargin],
  )

  const [dragging, setDragging] = useState(false)

  const reset = useCallback(() => {
    Object.assign(cacheRef.current.dragInfo, DRAG_INFO_DEFAULT_VALUE)
    if (containerRef.current instanceof HTMLSpanElement) {
      containerRef.current.style.transform = `translate(0px, 0px)`
    }
  }, [])

  const revert = useCallback(() => {
    const { lastPosition, dragInfo } = cacheRef.current
    dragInfo.translateX = lastPosition.translateX
    dragInfo.translateY = lastPosition.translateY
    if (containerRef.current instanceof HTMLSpanElement) {
      containerRef.current.style.transform = `translate(${dragInfo.translateX}px, ${dragInfo.translateY}px)`
    }
  }, [])

  const adjust = useCallback(() => {
    const { lastPosition, dragInfo } = cacheRef.current

    if (containerRef.current instanceof HTMLSpanElement) {
      const layoutParent =
        containerRef.current.style.position === 'fixed'
          ? window
          : containerRef.current.parentElement
      if (!layoutParent) return

      const parentRect =
        layoutParent instanceof Window
          ? {
              left: 0,
              top: 0,
              right: window.innerWidth,
              bottom: window.innerHeight,
            }
          : layoutParent?.getBoundingClientRect()
      const rect = containerRef.current.getBoundingClientRect()

      const overLeft = parentRect.left + safeMargin.left - rect.left
      const overRight = rect.right - (parentRect.right - safeMargin.right)
      const overTop = parentRect.top + safeMargin.top - rect.top
      const overBottom = rect.bottom - (parentRect.bottom - safeMargin.bottom)

      if (overLeft > 0) {
        dragInfo.translateX += overLeft
      }
      if (overRight > 0) {
        dragInfo.translateX -= overRight
      }
      if (overTop > 0) {
        dragInfo.translateY += overTop
      }
      if (overBottom > 0) {
        dragInfo.translateY -= overBottom
      }

      containerRef.current.style.transform = `translate(${dragInfo.translateX}px, ${dragInfo.translateY}px)`
    }

    lastPosition.translateX = dragInfo.translateX
    lastPosition.translateY = dragInfo.translateY
  }, [safeMargin])

  useEffect(() => {
    if (typeof getApi === 'function') {
      getApi({ reset, revert, adjust })
    }
  }, [getApi, reset, revert, adjust])

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

      const { dragInfo } = cacheRef.current
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

      const { dragInfo } = cacheRef.current
      if (!dragInfo.isDragging) return

      event.preventDefault()

      dragInfo.translateX = event.clientX - dragInfo.startX
      dragInfo.translateY = event.clientY - dragInfo.startY
      containerRef.current.style.transform = `translate(${dragInfo.translateX}px, ${dragInfo.translateY}px)`
    }

    const handleMouseUp = () => {
      setDragging(false)

      const { lastPosition, dragInfo } = cacheRef.current
      dragInfo.isDragging = false
      document.body.style.cursor = dragInfo.defaultCursor

      adjust()

      lastPosition.translateX = dragInfo.translateX
      lastPosition.translateY = dragInfo.translateY
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [ignoreElement, adjust])

  return (
    <span
      className={className}
      style={{
        position: 'fixed',
        ...style,
        transform: `translate(0px, 0px)`,
        transition: dragging
          ? undefined
          : 'width 0.1s linear, height 0.1s linear, transform 0.1s linear',
      }}
      ref={containerRef}
    >
      {typeof children === 'function' ? children({ reset, revert, adjust }) : children}
    </span>
  )
}
