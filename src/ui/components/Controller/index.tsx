import { useState } from 'react'
import { Task } from '../../../server/common/store'
import TaskList from '../TaskList'

export default function Controller() {
  const [data, setData] = useState<Task[]>([])

  return <TaskList data={data} onChange={setData} isRunning={false} />
}
