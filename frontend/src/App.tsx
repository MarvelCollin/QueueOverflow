import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/Header'
import Questions from './pages/Questions'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto pt-20 px-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <div className="hidden md:block col-span-2">
            <nav className="sticky top-20">
              <a href="#" className="block py-2 text-gray-600 hover:text-orange-500">Home</a>
              <a href="#" className="block py-2 text-gray-600 hover:text-orange-500">Questions</a>
              <a href="#" className="block py-2 text-gray-600 hover:text-orange-500">Tags</a>
              <a href="#" className="block py-2 text-gray-600 hover:text-orange-500">Users</a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-7">
            <Questions />
          </div>

          {/* Right Sidebar */}
          <div className="hidden md:block col-span-3">
            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
              <h2 className="font-bold mb-2">The QueueOverflow Blog</h2>
              <p className="text-sm text-gray-600">Coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
