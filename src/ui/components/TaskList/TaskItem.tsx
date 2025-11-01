import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Copy,
  Loader2,
  LocateFixed,
  Pencil,
  Trash2,
} from 'lucide-react'
import { type FC, useCallback, useEffect, useState } from 'react'
import { Task, TaskStatus } from '../../../server/common/store'
import { highlightElement, screenshotElement } from './utils'

interface TaskItemProps {
  task: Task
  taskIndex: number
  totalTasks: number
  isRunning: boolean
  onDelete: (taskId: string) => void
  onDuplicate: (taskId: string) => void
  onMoveUp: (taskId: string) => void
  onMoveDown: (taskId: string) => void
  onMoveToTop: (taskId: string) => void
  onMoveToBottom: (taskId: string) => void
  onUpdatePrompt: (taskId: string, prompt: string) => void
  onUpdatePromptAndScreenshot: (taskId: string, prompt: string, screenshot: string) => void
  onEditingChange?: (taskId: string, isEditing: boolean) => void
}

const TaskItem: FC<TaskItemProps> = ({
  task,
  taskIndex,
  totalTasks,
  isRunning,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  onUpdatePrompt,
  onUpdatePromptAndScreenshot,
  onEditingChange,
}) => {
  // if no prompt, start in editing mode
  const [isEditing, setIsEditing] = useState(!task.user_prompt)
  const [promptInput, setPromptInput] = useState(task.user_prompt)
  const [isSaving, setIsSaving] = useState(false)

  // notify parent when editing state changes
  useEffect(() => {
    onEditingChange?.(task.id, isEditing)
  }, [task.id, isEditing, onEditingChange])

  // focus textarea when new task created
  useEffect(() => {
    if (!task.user_prompt) {
      requestAnimationFrame(() => {
        const textarea = document.querySelector(`[data-task-id="${task.id}"] .cf-task-textarea`)
        if (textarea instanceof HTMLTextAreaElement) {
          textarea.focus()
        }
      })
    }
  }, [task.id, task.user_prompt])

  const statusClass =
    task.status === TaskStatus.DOING
      ? 'cf-task-card-doing'
      : task.status === TaskStatus.DONE
        ? 'cf-task-card-done'
        : task.status === TaskStatus.CANCEL
          ? 'cf-task-card-cancel'
          : 'cf-task-card-todo'

  // start edit
  const startEdit = useCallback(() => {
    setIsEditing(true)
    setPromptInput(task.user_prompt)

    // focus textarea
    requestAnimationFrame(() => {
      const textarea = document.querySelector(`[data-task-id="${task.id}"] .cf-task-textarea`)
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus()
        textarea.setSelectionRange(0, textarea.value.length)
      }
    })
  }, [task.id, task.user_prompt])

  // save edit
  const saveEdit = useCallback(async () => {
    setIsSaving(true)

    try {
      // screenshot if first time saving (no screenshot yet)
      if (!task.element_screenshot) {
        const element = document.querySelector(task.element_selector)
        if (element instanceof HTMLElement) {
          const screenshot = await screenshotElement(element)
          // update both prompt and screenshot together
          onUpdatePromptAndScreenshot(task.id, promptInput, screenshot)
        } else {
          // element not found, just update prompt
          onUpdatePrompt(task.id, promptInput)
        }
      } else {
        // already has screenshot, just update prompt
        onUpdatePrompt(task.id, promptInput)
      }

      setIsEditing(false)
      setPromptInput('')
    } finally {
      setIsSaving(false)
    }
  }, [
    task.id,
    task.element_selector,
    task.element_screenshot,
    promptInput,
    onUpdatePrompt,
    onUpdatePromptAndScreenshot,
  ])

  // cancel edit
  const cancelEdit = useCallback(() => {
    if (!promptInput.trim() && !task.user_prompt) {
      onDelete(task.id)
    }
    setIsEditing(false)
    setPromptInput('')
  }, [task.id, task.user_prompt, promptInput, onDelete])

  return (
    <div
      key={task.id}
      data-task-id={task.id}
      className={`cf-task-card ${statusClass} ${isRunning ? 'cf-task-running' : ''}`}
    >
      <div className="cf-task-card-header">
        <span className="cf-task-tag">&lt;{task.element_tag}&gt;</span>
        <div className="cf-task-selector" title={task.element_selector}>
          {task.element_selector}
        </div>
        {isRunning ? (
          <div className="cf-task-status-badge">
            {task.status === TaskStatus.TODO && (
              <span className="cf-status-badge cf-status-todo">TODO</span>
            )}
            {task.status === TaskStatus.DOING && (
              <span className="cf-status-badge cf-status-doing">DOING</span>
            )}
            {task.status === TaskStatus.DONE && (
              <span className="cf-status-badge cf-status-done">DONE</span>
            )}
            {task.status === TaskStatus.CANCEL && (
              <span className="cf-status-badge cf-status-cancel">CANCELLED</span>
            )}
          </div>
        ) : (
          <div className="cf-task-actions">
            {!isEditing && (
              <>
                {taskIndex !== 0 && (
                  <button
                    type="button"
                    className="cf-move-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMoveToTop(task.id)
                    }}
                    title="Move to Top"
                  >
                    <ArrowUpToLine size="1em" />
                  </button>
                )}
                {taskIndex !== totalTasks - 1 && (
                  <button
                    type="button"
                    className="cf-move-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMoveToBottom(task.id)
                    }}
                    title="Move to Bottom"
                  >
                    <ArrowDownToLine size="1em" />
                  </button>
                )}
                {taskIndex !== 0 && (
                  <button
                    type="button"
                    className="cf-move-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMoveUp(task.id)
                    }}
                    title="Move Up"
                  >
                    <ArrowUp size="1em" />
                  </button>
                )}
                {taskIndex !== totalTasks - 1 && (
                  <button
                    type="button"
                    className="cf-move-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMoveDown(task.id)
                    }}
                    title="Move Down"
                  >
                    <ArrowDown size="1em" />
                  </button>
                )}
              </>
            )}
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
            {!isEditing && (
              <>
                <button
                  type="button"
                  className="cf-edit-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    startEdit()
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
                    onDuplicate(task.id)
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
                onDelete(task.id)
                if (isEditing) {
                  setIsEditing(false)
                  setPromptInput('')
                }
              }}
              title="Remove"
            >
              <Trash2 size="1em" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="cf-task-edit">
          <textarea
            className="cf-task-textarea"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Describe how to optimize or modify this element..."
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
              disabled={!promptInput.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size="1em" className="cf-spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save'
              )}
            </button>
            <button
              type="button"
              className="cf-cancel-button"
              onClick={(e) => {
                e.stopPropagation()
                cancelEdit()
              }}
              disabled={isSaving}
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
}

export default TaskItem
