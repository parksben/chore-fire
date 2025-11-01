/** biome-ignore-all lint/suspicious/noExplicitAny: window global */
import localforage from 'localforage'
import { nanoid } from 'nanoid'
import { useEffect, useRef, useState } from 'react'
import { type Task, TaskActionType, TaskStatus } from '../server/common/store'
import TaskList from './components/TaskList'

const { PROJECT_NAMESPACE = `chore-fire_${nanoid(4)}` } =
  (window as any).CHORE_FIRE_RUNTIME_INFO || {}

const STORAGE_KEY = `CHORE_FIRE_DATA:${PROJECT_NAMESPACE}`

export default function ChoreFireUI() {
  const isReady = useRef(false)

  const [data, setData] = useState<Task[]>([])
  const [running, setRunning] = useState(false)

  // use local data on mount
  useEffect(() => {
    localforage
      .getItem<Task[]>(STORAGE_KEY)
      .then((storedTasks) => {
        const localList = storedTasks || []
        if (localList.some((task) => task.status !== TaskStatus.TODO)) {
          setRunning(true)
        }
        setData(localList)
      })
      .finally(() => {
        isReady.current = true
      })
  }, [])

  // save data on change
  useEffect(() => {
    if (!isReady.current) return

    // save to localforage
    localforage.setItem(STORAGE_KEY, data)

    // save to server
    fetch('/chore-fire/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch((error) => {
      console.error('[ChoreFire] Failed to sync tasks to MCP server:', error)
    })
  }, [data])

  // setup SSE to listen for task updates
  useEffect(() => {
    const eventSource = new EventSource('/chore-fire/sse')

    eventSource.onmessage = (event) => {
      const { event: action, data } = JSON.parse(event.data) as {
        event: TaskActionType
        data: Partial<Task>
      }

      if (action === TaskActionType.STATUS) {
        setData((prev) => {
          const nextList = prev.map((task) => {
            if (task.id === data.id && data.status) {
              return { ...task, status: data.status }
            }
            return task
          })
          localforage.setItem(STORAGE_KEY, nextList)
          return nextList
        })
        if (data.status !== TaskStatus.TODO) {
          setRunning(true)
        }
        return
      }

      if (action === TaskActionType.CLEAR) {
        setData([])
        localforage.removeItem(STORAGE_KEY)
        setRunning(false)
        return
      }
    }

    eventSource.onerror = (error) => {
      console.error('[ChoreFire] SSE connection error:', error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return <TaskList data={data} onChange={setData} isRunning={running} />
}
