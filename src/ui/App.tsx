import React from 'react'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Chore Fire UI</h1>
        <p>React + TypeScript UI for Chore Fire</p>
      </header>
      <main className="app-main">
        <div className="card">
          <h2>Welcome to Chore Fire</h2>
          <p>
            A powerful graphical tool for web developers that quickly submits large amounts of
            modification requirements in web UI to your AI coding assistant.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
