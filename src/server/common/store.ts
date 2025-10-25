export enum TaskStatus {
  TODO = 'todo',
  DOING = 'doing',
  DONE = 'done',
  CANCEL = 'cancel',
}

export interface Task {
  id: string
  page_url: string
  element_selector: string
  element_tag: string
  element_html: string
  element_screenshot_base64: string
  prompt: string
  status: TaskStatus
}

export type EventHandler = (data: Partial<Task>) => void

export const TASK_STORE_MAX_SIZE = 200

export const getTaskProperties = (data: Partial<Task>): Partial<Task> => ({
  id: data?.id,
  page_url: data?.page_url,
  element_selector: data?.element_selector,
  element_tag: data?.element_tag,
  element_html: data?.element_html,
  element_screenshot_base64: data?.element_screenshot_base64,
  prompt: data?.prompt,
  status: data?.status,
})

export class TaskStore {
  private queue: Task[]
  private map: Map<string, { record: Task; index: number }>
  private eventMap: Map<string, EventHandler[]>

  constructor(public readonly maxSize = TASK_STORE_MAX_SIZE) {
    this.queue = []
    this.map = new Map()
    this.eventMap = new Map()
  }

  add(task: Task) {
    while (this.queue.length > this.maxSize - 1) {
      const oldestTask = this.queue.shift()
      if (oldestTask?.id) {
        this.map.delete(oldestTask.id)
      }
    }

    this.queue.push(task)
    this.map.set(task.id, {
      record: task,
      index: this.queue.length - 1,
    })

    this.emit('add', task)
  }

  delete(taskId: string) {
    this.map.delete(taskId)
    this.emit('delete', { id: taskId })
  }

  get(taskId: string): Task | null {
    const entry = this.map.get(taskId)
    return entry ? entry.record : null
  }

  change({ id, status }: { id: string; status: TaskStatus }) {
    const task = this.map.get(id)
    if (task) {
      task.record = { ...task.record, status }
      this.queue[task.index] = task.record
      this.emit('change', task.record)
    }
  }

  list(): Task[] {
    return Array.from(this.map.values()).map((entry) => entry.record)
  }

  on(actionType: string, callback: EventHandler) {
    const listeners = this.eventMap.get(actionType) || []
    listeners.push(callback)
    this.eventMap.set(actionType, listeners)
  }

  off(actionType: string, callback: EventHandler) {
    const listeners = this.eventMap.get(actionType) || []
    const filteredListeners = listeners.filter((listener) => listener !== callback)
    this.eventMap.set(actionType, filteredListeners)
  }

  emit(actionType: string, data: Partial<Task>) {
    const listeners = this.eventMap.get(actionType) || []
    listeners.forEach((callback) => {
      callback(data)
    })
  }
}
