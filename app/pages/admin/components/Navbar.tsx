"use client"
import { FC } from "react"

interface NavbarProps {
  darkMode: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
}

const Navbar: FC<NavbarProps> = ({ darkMode, toggleTheme, toggleSidebar }) => {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-30 ${
        darkMode ? "bg-[#111111] text-white" : "bg-white text-zinc-800"
      } border-b ${darkMode ? "border-zinc-800" : "border-zinc-200"} shadow-sm`}
    >
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-md ${
              darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
            } mr-2`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="flex items-center">
        
            <span className="font-bold text-lg">Dashboard</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`relative hidden md:block ${darkMode ? "text-zinc-300" : "text-zinc-600"}`}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search games..."
              className={`py-1.5 pl-8 pr-2 rounded-md ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700 focus:bg-zinc-700"
                  : "bg-zinc-100 border-zinc-200 focus:bg-white"
              } border focus:outline-none focus:ring-1 focus:ring-green-500 w-48 lg:w-64`}
            />
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              darkMode ? "bg-zinc-800 text-yellow-300" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar