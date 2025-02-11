import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed w-full bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-orange-500">
              QueueOverflow
            </h1>
            <nav className="hidden md:block ml-6">
              <a href="#" className="text-gray-600 hover:bg-orange-100 px-3 py-2 rounded">Questions</a>
              <a href="#" className="text-gray-600 hover:bg-orange-100 px-3 py-2 rounded">Tags</a>
              <a href="#" className="text-gray-600 hover:bg-orange-100 px-3 py-2 rounded">Users</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Log in</button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">Sign up</button>
          </div>
        </div>
      </div>
    </header>
  )
}
