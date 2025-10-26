import React from 'react'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="chore-fire-ui cf-text-center cf-max-w-4xl cf-mx-auto cf-p-5">
      <header className="cf-bg-gray-800 cf-p-5 cf-text-white cf-rounded-lg cf-mb-5">
        <h1 className="cf-text-4xl cf-font-bold cf-mb-2">Chore Fire UI</h1>
        <p className="cf-text-xl cf-opacity-80">React + TypeScript UI for Chore Fire</p>
      </header>
      <main className="cf-py-5">
        <div className="cf-bg-white cf-rounded-lg cf-p-8 cf-shadow-lg cf-border cf-border-gray-200">
          <h2 className="cf-text-3xl cf-font-semibold cf-text-gray-800 cf-mb-5">
            Welcome to Chore Fire
          </h2>
          <p className="cf-text-gray-600 cf-leading-relaxed cf-text-lg">
            A powerful graphical tool for web developers that quickly submits large amounts of
            modification requirements in web UI to your AI coding assistant.
          </p>
          <div className="cf-mt-6 cf-flex cf-gap-4 cf-justify-center">
            <button
              type="button"
              className="cf-bg-blue-500 hover:cf-bg-blue-600 cf-text-white cf-px-6 cf-py-2 cf-rounded-md cf-font-medium cf-transition-colors"
            >
              Get Started
            </button>
            <button
              type="button"
              className="cf-bg-gray-200 hover:cf-bg-gray-300 cf-text-gray-800 cf-px-6 cf-py-2 cf-rounded-md cf-font-medium cf-transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
