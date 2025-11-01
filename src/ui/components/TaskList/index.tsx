import { BrushCleaning, ChevronsDown, ChevronsUp, Loader2, MousePointer2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { type FC, useCallback, useEffect, useRef, useState } from 'react'
import { Task, TaskStatus } from '../../../server/common/store'
import Movable, { MovableApi } from '../Movable'
import './style.scss'
import clsx from 'clsx'
import TaskItem from './TaskItem'
import { getElementSelector } from './utils'

interface TaskListProps {
  data: Task[]
  onChange: (tasks: Task[]) => void
  isRunning?: boolean
}

const TaskList: FC<TaskListProps> = ({ data, onChange, isRunning = false }) => {
  const [isSelecting, setIsSelecting] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isScrolledToTop, setIsScrolledToTop] = useState(true)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false)

  const movableApi = useRef<MovableApi | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: adjust position on collapse change
  useEffect(() => {
    movableApi.current?.adjust()
  }, [isCollapsed])

  // scroll to DOING task when data changes
  useEffect(() => {
    if (!isRunning) return

    const doingTaskIndex = data.findIndex((t) => t.status === TaskStatus.DOING)
    if (doingTaskIndex === -1) return

    const doingTask = data[doingTaskIndex]

    const container = scrollContainerRef.current
    if (!container) return

    // use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      // scroll task item into view
      const taskElement = container.querySelector(`[data-task-id="${doingTask.id}"]`)
      if (taskElement instanceof HTMLElement) {
        taskElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }

      // scroll page element into view
      const pageElement = document.querySelector(doingTask.element_selector)
      if (pageElement instanceof Element) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }, [data, isRunning])

  // check scroll position
  // biome-ignore lint/correctness/useExhaustiveDependencies: need to re-check scroll position when data changes
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const threshold = 5 // allowable threshold

      // check if at top
      const isAtTop = scrollTop <= threshold
      setIsScrolledToTop(isAtTop)

      // check if at bottom
      const isAtBottom = scrollHeight - scrollTop - clientHeight <= threshold
      setIsScrolledToBottom(isAtBottom)
    }

    // initial check
    handleScroll()

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [data.length, isCollapsed])

  // handle mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting) return

      let element = e.target as HTMLElement

      // ignore TaskList component and selecting overlay
      if (element.closest('.cf-task-list') || element.closest('.cf-selecting-overlay')) return

      // if hovered element is inside SVG, get the SVG element
      if (element instanceof SVGElement && !(element instanceof SVGSVGElement)) {
        const svgRoot = element.closest('svg')
        if (svgRoot) {
          element = svgRoot as unknown as HTMLElement
        }
      }

      if (hoveredElement !== element) {
        hoveredElement?.classList.remove('cf-element-hover')
        element.classList.add('cf-element-hover')
        setHoveredElement(element)
      }
    },
    [isSelecting, hoveredElement],
  )

  // handle click to create task
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting) return

      let element = e.target as HTMLElement

      // ignore TaskList component and selecting overlay
      if (element.closest('.cf-task-list') || element.closest('.cf-selecting-overlay')) return

      e.preventDefault()
      e.stopPropagation()

      // if clicked element is inside SVG, get the SVG element
      if (element instanceof SVGElement && !(element instanceof SVGSVGElement)) {
        const svgRoot = element.closest('svg')
        if (svgRoot) {
          element = svgRoot as unknown as HTMLElement
        }
      }

      // get element selector
      const selector = getElementSelector(element)
      const newTaskId = nanoid()

      // create new task
      const newTask: Task = {
        id: newTaskId,
        page_url: window.location.href,
        element_selector: selector,
        element_tag: element.tagName.toLowerCase(),
        element_html: element.outerHTML,
        element_screenshot: '', // screenshot will be taken when saving the prompt first time
        user_prompt: '',
        status: TaskStatus.TODO,
      }

      // cleanup selecting state
      hoveredElement?.classList.remove('cf-element-hover')
      setHoveredElement(null)
      setIsSelecting(false)

      // add new task
      const updatedTasks = [...data, newTask]
      onChange(updatedTasks)

      // remove selecting mode class
      document.body.classList.remove('cf-selecting-mode')
    },
    [isSelecting, hoveredElement, data, onChange],
  )

  // start selecting
  const startSelecting = useCallback(() => {
    setIsSelecting(true)
    document.body.classList.add('cf-selecting-mode')
    setIsCollapsed(false)
  }, [])

  // cancel selecting
  const cancelSelecting = useCallback(() => {
    setIsSelecting(false)
    hoveredElement?.classList.remove('cf-element-hover')
    setHoveredElement(null)
    document.body.classList.remove('cf-selecting-mode')
  }, [hoveredElement])

  // use esc to cancel selecting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelecting) {
        cancelSelecting()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSelecting, cancelSelecting])

  // remove task
  const deleteTask = useCallback(
    (taskId: string) => {
      const updatedTasks = data.filter((t) => t.id !== taskId)
      onChange(updatedTasks)
    },
    [data, onChange],
  )

  // duplicate task
  const duplicateTask = useCallback(
    (taskId: string) => {
      const taskIndex = data.findIndex((t) => t.id === taskId)
      if (taskIndex === -1) return

      const originalTask = data[taskIndex]
      const newTask: Task = {
        ...originalTask,
        id: nanoid(),
      }

      const updatedTasks = [...data.slice(0, taskIndex + 1), newTask, ...data.slice(taskIndex + 1)]
      onChange(updatedTasks)
    },
    [data, onChange],
  )

  // move task up
  const moveTaskUp = useCallback(
    (taskId: string) => {
      const taskIndex = data.findIndex((t) => t.id === taskId)
      if (taskIndex <= 0) return

      const updatedTasks = [...data]
      const [task] = updatedTasks.splice(taskIndex, 1)
      updatedTasks.splice(taskIndex - 1, 0, task)
      onChange(updatedTasks)
    },
    [data, onChange],
  )

  // move task down
  const moveTaskDown = useCallback(
    (taskId: string) => {
      const taskIndex = data.findIndex((t) => t.id === taskId)
      if (taskIndex === -1 || taskIndex >= data.length - 1) return

      const updatedTasks = [...data]
      const [task] = updatedTasks.splice(taskIndex, 1)
      updatedTasks.splice(taskIndex + 1, 0, task)
      onChange(updatedTasks)
    },
    [data, onChange],
  )

  // move task to top
  const moveTaskToTop = useCallback(
    (taskId: string) => {
      const taskIndex = data.findIndex((t) => t.id === taskId)
      if (taskIndex <= 0) return

      const updatedTasks = [...data]
      const [task] = updatedTasks.splice(taskIndex, 1)
      updatedTasks.unshift(task)
      onChange(updatedTasks)
    },
    [data, onChange],
  )

  // move task to bottom
  const moveTaskToBottom = useCallback(
    (taskId: string) => {
      const taskIndex = data.findIndex((t) => t.id === taskId)
      if (taskIndex === -1 || taskIndex >= data.length - 1) return

      const updatedTasks = [...data]
      const [task] = updatedTasks.splice(taskIndex, 1)
      updatedTasks.push(task)
      onChange(updatedTasks)
    },
    [data, onChange],
  )

  // update task prompt
  const updateTaskPrompt = useCallback(
    (taskId: string, prompt: string) => {
      const updatedTasks = data.map((t) => (t.id === taskId ? { ...t, user_prompt: prompt } : t))
      onChange(updatedTasks)
    },
    [data, onChange],
  )

  // update task prompt and screenshot together
  const updateTaskPromptAndScreenshot = useCallback(
    (taskId: string, prompt: string, screenshot: string) => {
      const updatedTasks = data.map((t) =>
        t.id === taskId ? { ...t, user_prompt: prompt, element_screenshot: screenshot } : t,
      )
      onChange(updatedTasks)
    },
    [data, onChange],
  )

  // setup event listeners during selecting
  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('click', handleClick, true)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('click', handleClick, true)
      }
    }
  }, [isSelecting, handleMouseMove, handleClick])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      hoveredElement?.classList.remove('cf-element-hover')
      document.body.classList.remove('cf-selecting-mode')
    }
  }, [hoveredElement])

  return (
    <>
      <Movable
        className={clsx('cf-task-draggable', isCollapsed && 'cf-task-draggable-collapsed')}
        ignoreElement={(element) =>
          element.closest('.cf-task-card') instanceof Element ||
          element.closest('button') instanceof Element
        }
        style={{
          position: 'fixed',
          zIndex: 10000,
          right: '8px',
          bottom: '8px',
        }}
        getApi={(api) => {
          movableApi.current = api
        }}
      >
        <div className="cf-task-list">
          {data.length === 0 ? (
            <div className="cf-task-container cf-task-container-empty">
              {isCollapsed ? (
                <div className="cf-task-header">
                  <div className="cf-drag-handle">
                    <div className="cf-drag-indicator"></div>
                  </div>
                  <div className="cf-task-header-content">
                    <h3 className="cf-task-header-title">
                      <button
                        type="button"
                        className="cf-toggle-button"
                        onClick={() => setIsCollapsed((prev) => !prev)}
                        title="Expand"
                      >
                        <ChevronsUp size="1.4em" />
                      </button>
                      ChoreFire
                    </h3>
                  </div>
                </div>
              ) : (
                <>
                  <div className="cf-empty-drag-handle">
                    <div className="cf-drag-indicator"></div>
                  </div>
                  <div className="cf-empty-header">
                    <button
                      type="button"
                      className="cf-toggle-button"
                      onClick={() => setIsCollapsed((prev) => !prev)}
                      title="Collapse"
                    >
                      <ChevronsDown size="1.4em" />
                    </button>
                  </div>
                  <div className="cf-empty-content">
                    <div className="cf-empty-icon">🔥</div>
                    <h3 className="cf-empty-title">ChoreFire</h3>
                    <p className="cf-empty-description">Click to start your jobs</p>
                    <button type="button" className="cf-start-button" onClick={startSelecting}>
                      <MousePointer2 size="1.2em" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="cf-task-container">
              <div className="cf-task-header">
                <div className="cf-drag-handle">
                  <div className="cf-drag-indicator"></div>
                </div>
                <div className="cf-task-header-content">
                  <h3 className="cf-task-header-title">
                    <button
                      type="button"
                      className="cf-toggle-button"
                      onClick={() => setIsCollapsed((prev) => !prev)}
                      title={isCollapsed ? 'Expand List' : 'Collapse List'}
                    >
                      {isCollapsed ? <ChevronsUp size="1.4em" /> : <ChevronsDown size="1.4em" />}
                    </button>
                    {isCollapsed ? 'ChoreFire' : `${data.length} items`}
                    {!isRunning && !isCollapsed && data.length > 1 && (
                      <button
                        type="button"
                        className="cf-clear-button"
                        onClick={() => onChange([])}
                        disabled={isSelecting}
                        title="Clean"
                      >
                        <BrushCleaning size="1.25em" />
                      </button>
                    )}
                    {!isRunning && isCollapsed && (
                      <span className="cf-task-count">{data.length}</span>
                    )}
                  </h3>
                  {isRunning ? (
                    <div className="cf-running-indicator">
                      <Loader2 size="1em" className="cf-spinner" />
                      <span>
                        Running{' '}
                        {
                          data.filter(
                            (t) =>
                              t.status === TaskStatus.DONE ||
                              t.status === TaskStatus.CANCEL ||
                              t.status === TaskStatus.DOING,
                          ).length
                        }
                        /{data.length}
                      </span>
                    </div>
                  ) : !isCollapsed ? (
                    <button
                      type="button"
                      className="cf-add-task-button"
                      onClick={startSelecting}
                      disabled={isSelecting}
                    >
                      <MousePointer2 size="1em" />
                      <span>Inspect</span>
                    </button>
                  ) : null}
                </div>
              </div>

              {!isCollapsed && (
                <div className="cf-task-list-wrapper">
                  {!isScrolledToTop && <div className="cf-scroll-fade-mask-top" />}
                  <div ref={scrollContainerRef} className="cf-task-scroll-container">
                    <div className="cf-task-items">
                      {data.map((task, index) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          taskIndex={index}
                          totalTasks={data.length}
                          isRunning={isRunning}
                          onDelete={deleteTask}
                          onDuplicate={duplicateTask}
                          onMoveUp={moveTaskUp}
                          onMoveDown={moveTaskDown}
                          onMoveToTop={moveTaskToTop}
                          onMoveToBottom={moveTaskToBottom}
                          onUpdatePrompt={updateTaskPrompt}
                          onUpdatePromptAndScreenshot={updateTaskPromptAndScreenshot}
                        />
                      ))}
                    </div>
                  </div>
                  {!isScrolledToBottom && <div className="cf-scroll-fade-mask-bottom" />}
                </div>
              )}
            </div>
          )}
        </div>
      </Movable>

      {/* Selection mode tip */}
      {isSelecting && (
        <div className="cf-selecting-overlay">
          <div className="cf-selecting-tip">
            <MousePointer2 size="1.2em" className="cf-tip-icon" />
            <span className="cf-tip-text">Click to select an element on the page</span>
            <button type="button" className="cf-cancel-selecting-button" onClick={cancelSelecting}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default TaskList
