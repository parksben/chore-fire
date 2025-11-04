import type { FC } from 'react'
import './App.scss'
import ChoreFireUI from './ChoreFireUI'
import DemoPage from './pages/Demo'
import './components/TaskList/internal.scss'
import './components/TaskList/external.scss'

const App: FC = () => {
  return (
    <>
      <DemoPage />
      <ChoreFireUI />
    </>
  )
}

export default App
