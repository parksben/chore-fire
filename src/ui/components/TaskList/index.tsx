import { ChevronDown, ChevronUp, Loader2, MousePointer2, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { type FC, useCallback, useEffect, useState } from 'react'
import { Task, TaskStatus } from '../../../server/common/store'
import Draggable from '../Draggable'
import './style.css'
import { getElementSelector, highlightElement } from './utils'

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
  const [isCollapsed, setIsCollapsed] = useState(false)

  // handle mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting) return

      const element = e.target as HTMLElement

      // ignore TaskList component and selecting overlay
      if (element.closest('.cf-task-list') || element.closest('.cf-selecting-overlay')) return

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

      const element = e.target as HTMLElement

      // ignore TaskList component and selecting overlay
      if (element.closest('.cf-task-list') || element.closest('.cf-selecting-overlay')) return

      e.preventDefault()
      e.stopPropagation()

      // get element selector
      const selector = getElementSelector(element)
      const newTaskId = nanoid()

      // create new task
      const newTask: Task = {
        id: newTaskId,
        page_url: window.location.href,
        element_selector: selector,
        element_tag: element.tagName.toLowerCase(),
        element_html: element.outerHTML.substring(0, 500), // 限制长度
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
      onChange(updatedTasks)

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
      <Draggable className="cf-task-draggable">
        <div className="cf-task-list">
          {data.length === 0 ? (
            <div className="cf-empty-state">
              <div className="cf-empty-icon">🎯</div>
              <h3 className="cf-empty-title">Chore Fire Tasks</h3>
              <p className="cf-empty-description">Click the button to create your first task</p>
              <button type="button" className="cf-start-button" onClick={startSelecting}>
                <span className="cf-button-icon">✨</span>
                <span>Create Task</span>
              </button>
            </div>
          ) : (
            <div className="cf-task-container">
              <div className="cf-task-header">
                <h3 className="cf-task-header-title">
                  <button
                    type="button"
                    className="cf-toggle-button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? 'Expand List' : 'Collapse List'}
                  >
                    {isCollapsed ? <ChevronUp size="1.2em" /> : <ChevronDown size="1.2em" />}
                  </button>
                  Tasks <span className="cf-task-count">{data.length}</span>
                </h3>
                {isRunning ? (
                  <div className="cf-running-indicator">
                    <Loader2 size="1em" className="cf-spinner" />
                    <span>Running...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="cf-add-task-button"
                    onClick={startSelecting}
                    disabled={isSelecting || editingTaskId !== null}
                  >
                    <MousePointer2 size="1em" />
                    <span>Inspect Element</span>
                  </button>
                )}
              </div>

              {!isCollapsed && (
                <div className="cf-task-scroll-container">
                  <div className="cf-task-items">
                    {data.map((task, index) => {
                      const statusClass =
                        task.status === TaskStatus.DOING
                          ? 'cf-task-card-doing'
                          : task.status === TaskStatus.DONE
                            ? 'cf-task-card-done'
                            : task.status === TaskStatus.CANCEL
                              ? 'cf-task-card-cancel'
                              : 'cf-task-card-todo'

                      return (
                        <button
                          key={task.id}
                          type="button"
                          data-task-id={task.id}
                          className={`cf-task-card ${statusClass}`}
                          onClick={() => {
                            if (editingTaskId !== task.id) {
                              highlightElement(task.element_selector)
                            }
                          }}
                        >
                          <div className="cf-task-card-header">
                            <span className="cf-task-number">#{index + 1}</span>
                            <span className="cf-task-tag">{task.element_tag}</span>
                            <div className="cf-task-selector">{task.element_selector}</div>
                            {!isRunning && (
                              <button
                                type="button"
                                className="cf-delete-button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteTask(task.id)
                                }}
                              >
                                <X size="1em" />
                              </button>
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
                                  disabled={promptInput.trim() === ''}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="cf-cancel-button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingTaskId(null)
                                    setPromptInput('')
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="cf-task-prompt"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!isRunning) {
                                  startEdit(task)
                                }
                              }}
                              disabled={isRunning}
                            >
                              {task.user_prompt || (
                                <span className="cf-prompt-placeholder">
                                  {isRunning
                                    ? 'No requirement description'
                                    : 'Click to add requirement description...'}
                                </span>
                              )}
                            </button>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Draggable>

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
