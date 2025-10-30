/** biome-ignore-all lint/a11y/noStaticElementInteractions: make div clickable */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: make div clickable */
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Ban,
  ChevronsDown,
  ChevronsUp,
  Copy,
  Loader2,
  LocateFixed,
  MousePointer2,
  Pencil,
  Trash2,
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { type FC, useCallback, useEffect, useState } from 'react'
import { Task, TaskStatus } from '../../../server/common/store'
import Movable from '../Movable'
import './style.scss'
import clsx from 'clsx'
import { getElementSelector, highlightElement, screenshotElement } from './utils'

interface TaskListProps {
  data: Task[]
  onChange: (tasks: Task[]) => void
  isRunning?: boolean
}

const TaskList: FC<TaskListProps> = ({ data, onChange, isRunning = false }) => {
  const [isSelecting, setIsSelecting] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [promptInput, setPromptInput] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(true)

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
    async (e: MouseEvent) => {
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
        element_screenshot_base64: '', // 可以后续添加截图功能
        user_prompt: '',
        status: TaskStatus.TODO,
      }

      // cleanup selecting state
      hoveredElement?.classList.remove('cf-element-hover')
      setHoveredElement(null)
      setIsSelecting(false)

      // add new task and set editing state
      const updatedTasks = [...data, newTask]
      setEditingTaskId(newTaskId)

      // remove selecting mode class
      document.body.classList.remove('cf-selecting-mode')

      // scroll to and focus the new task card
      requestAnimationFrame(() => {
        const taskCard = document.querySelector(`.cf-task-card[data-task-id="${newTaskId}"]`)
        if (taskCard) {
          taskCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
          const textarea = taskCard.querySelector(`.cf-task-textarea`)
          if (textarea instanceof HTMLTextAreaElement) {
            textarea.focus()
          }
        }
      })

      newTask.element_screenshot_base64 = await screenshotElement(element)
      onChange(updatedTasks)
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

  // save edit
  const saveEdit = useCallback(() => {
    if (editingTaskId) {
      updateTaskPrompt(editingTaskId, promptInput)
      setEditingTaskId(null)
      setPromptInput('')
    }
  }, [editingTaskId, promptInput, updateTaskPrompt])

  // start edit
  const startEdit = useCallback((task: Task) => {
    setEditingTaskId(task.id)
    setPromptInput(task.user_prompt)

    // focus textarea
    requestAnimationFrame(() => {
      const textarea = document.querySelector(`[data-task-id="${task.id}"] .cf-task-textarea`)
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus()
        textarea.setSelectionRange(0, textarea.value.length)
      }
    })
  }, [])

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
                    {!isCollapsed && data.length > 1 && (
                      <button
                        type="button"
                        className="cf-clear-button"
                        onClick={() => onChange([])}
                        disabled={isSelecting || editingTaskId !== null}
                        title="Clear All"
                      >
                        <Ban size="1em" />
                      </button>
                    )}
                    {isCollapsed && <span className="cf-task-count">{data.length}</span>}
                  </h3>
                  {isRunning ? (
                    <div className="cf-running-indicator">
                      <Loader2 size="1em" className="cf-spinner" />
                      <span>Running</span>
                    </div>
                  ) : !isCollapsed ? (
                    <button
                      type="button"
                      className="cf-add-task-button"
                      onClick={startSelecting}
                      disabled={isSelecting || editingTaskId !== null}
                    >
                      <MousePointer2 size="1em" />
                      <span>Inspect</span>
                    </button>
                  ) : null}
                </div>
              </div>

              {!isCollapsed && (
                <div className="cf-task-scroll-container">
                  <div className="cf-task-items">
                    {data.map((task) => {
                      const statusClass =
                        task.status === TaskStatus.DOING
                          ? 'cf-task-card-doing'
                          : task.status === TaskStatus.DONE
                            ? 'cf-task-card-done'
                            : task.status === TaskStatus.CANCEL
                              ? 'cf-task-card-cancel'
                              : 'cf-task-card-todo'

                      return (
                        <div
                          key={task.id}
                          data-task-id={task.id}
                          className={`cf-task-card ${statusClass}`}
                        >
                          <div className="cf-task-card-header">
                            <span className="cf-task-tag">&lt;{task.element_tag}&gt;</span>
                            <div className="cf-task-selector" title={task.element_selector}>
                              {task.element_selector}
                            </div>
                            {!isRunning && (
                              <div className="cf-task-actions">
                                <button
                                  type="button"
                                  className="cf-locate-button"
                                  onClick={() => {
                                    highlightElement(task.element_selector)
                                  }}
                                  title="Locate"
                                >
                                  <LocateFixed size="1.15em" />
                                </button>
                                {editingTaskId !== task.id && (
                                  <>
                                    {data.findIndex((t) => t.id === task.id) !== 0 && (
                                      <button
                                        type="button"
                                        className="cf-move-button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          moveTaskToTop(task.id)
                                        }}
                                        title="Move to Top"
                                      >
                                        <ArrowUpToLine size="1em" />
                                      </button>
                                    )}
                                    {data.findIndex((t) => t.id === task.id) !==
                                      data.length - 1 && (
                                      <button
                                        type="button"
                                        className="cf-move-button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          moveTaskToBottom(task.id)
                                        }}
                                        title="Move to Bottom"
                                      >
                                        <ArrowDownToLine size="1em" />
                                      </button>
                                    )}
                                    {data.findIndex((t) => t.id === task.id) !== 0 && (
                                      <button
                                        type="button"
                                        className="cf-move-button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          moveTaskUp(task.id)
                                        }}
                                        title="Move Up"
                                      >
                                        <ArrowUp size="1em" />
                                      </button>
                                    )}
                                    {data.findIndex((t) => t.id === task.id) !==
                                      data.length - 1 && (
                                      <button
                                        type="button"
                                        className="cf-move-button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          moveTaskDown(task.id)
                                        }}
                                        title="Move Down"
                                      >
                                        <ArrowDown size="1em" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="cf-edit-button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        startEdit(task)
                                      }}
                                      title="Edit"
                                    >
                                      <Pencil size="1em" />
                                    </button>
                                    <button
                                      type="button"
                                      className="cf-copy-button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        duplicateTask(task.id)
                                      }}
                                      title="Duplicate"
                                    >
                                      <Copy size="1em" />
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  className="cf-delete-button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteTask(task.id)
                                    setEditingTaskId(null)
                                    setPromptInput('')
                                  }}
                                  title="Remove"
                                >
                                  <Trash2 size="1em" />
                                </button>
                              </div>
                            )}
                          </div>

                          {editingTaskId === task.id ? (
                            <div className="cf-task-edit">
                              <textarea
                                className="cf-task-textarea"
                                value={promptInput}
                                onChange={(e) => setPromptInput(e.target.value)}
                                placeholder="Describe your requirements..."
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="cf-task-edit-actions">
                                <button
                                  type="button"
                                  className="cf-save-button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    saveEdit()
                                  }}
                                  disabled={!promptInput.trim()}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="cf-cancel-button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (!promptInput.trim() && !task.user_prompt) {
                                      deleteTask(task.id)
                                    }
                                    setEditingTaskId(null)
                                    setPromptInput('')
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="cf-task-prompt">{task.user_prompt}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
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
