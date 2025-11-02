import { nanoid } from 'nanoid'

export enum TaskStatus {
  TODO = 'todo',
  DOING = 'doing',
  DONE = 'done',
  CANCEL = 'cancel',
}

export enum TaskActionType {
  ADD = 'add',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS = 'status',
  WRITE_ALL = 'write_all',
  CLEAR_ALL = 'clear_all',
  START_ALL = 'start_all',
  FINISH_ALL = 'finish_all',
}

export interface Task {
  id: string
  page_url: string
  element_selector: string
  element_tag: string
  element_html: string
  element_screenshot: string
  source_location: string
  user_prompt: string
  status: TaskStatus
}

export interface EventPayload {
  messageId: string
  data?: any
}

export type EventHandler = (payload: EventPayload) => void

export const TASK_STORE_MAX_SIZE = 200

export class TaskStore {
  private queue: Task[]
  private map: Map<string, { record: Task; index: number }>
  private eventMap: Map<string, EventHandler[]>

  constructor(public readonly maxSize = TASK_STORE_MAX_SIZE) {
    this.queue = []
    this.map = new Map()
    this.eventMap = new Map()
  }

  get size() {
    return this.map.size
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

    this.emit(TaskActionType.ADD, { messageId: nanoid(), data: task })
  }

  delete(taskId: string) {
    this.map.delete(taskId)
    this.emit(TaskActionType.DELETE, { messageId: nanoid(), data: { id: taskId } })
  }

  get(taskId: string): Task | null {
    const entry = this.map.get(taskId)
    return entry ? entry.record : null
  }

  update({ id, ...rest }: Partial<Task> & { id: string }) {
    const task = this.map.get(id)
    if (task) {
      task.record = { ...task.record, ...rest }
      this.queue[task.index] = task.record
      this.emit(TaskActionType.UPDATE, { messageId: nanoid(), data: task.record })
    }
  }

  status({ id, status }: { id: string; status: TaskStatus }) {
    const task = this.map.get(id)
    if (task) {
      task.record = { ...task.record, status }
      this.queue[task.index] = task.record
      this.emit(TaskActionType.STATUS, { messageId: nanoid(), data: task.record })
    }
  }

  list(): Task[] {
    return Array.from(this.map.values()).map((entry) => entry.record)
  }

  write(tasks: Task[]) {
    this.queue = [...tasks]
    this.map.clear()
    this.queue.forEach((task, index) => {
      this.map.set(task.id, {
        record: task,
        index,
      })
    })
    this.emit(TaskActionType.WRITE_ALL, { messageId: nanoid() })
  }

  clear() {
    this.queue = []
    this.map.clear()
    this.emit(TaskActionType.CLEAR_ALL, { messageId: nanoid() })
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

  emit(actionType: string, payload: EventPayload) {
    const listeners = this.eventMap.get(actionType) || []
    listeners.forEach((callback) => {
      callback(payload)
    })
  }
}
