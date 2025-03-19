"use client"
import { FC } from "react"

interface SidebarProps {
  darkMode: boolean
  sidebarOpen: boolean
}

const Sidebar: FC<SidebarProps> = ({ darkMode, sidebarOpen }) => {
  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 w-64 ${
        darkMode ? "bg-[#0D0D0D] text-white" : "bg-gray-50 text-gray-800"
      } border-r ${
        darkMode ? "border-gray-800" : "border-gray-200"
      } transition-all duration-300 ease-in-out z-20 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4">
        <div className="mb-6">
          <h3
            className={`text-xs font-semibold uppercase ${
              darkMode ? "text-gray-400" : "text-gray-500"
            } tracking-wider`}
          >
            Main
          </h3>
          <ul className="mt-3 space-y-1">
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-md ${
                  darkMode ? "bg-green-600 text-white" : "bg-green-50 text-green-700"
                }`}
              >
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
                  className="mr-3"
                >
                  <rect x="4" y="2" width="16" height="12" rx="2"></rect>
                  <path d="M6 6h.01"></path>
                  <path d="M10 6h.01"></path>
                  <path d="M14 6h.01"></path>
                  <path d="M18 6h.01"></path>
                  <rect x="6" y="14" width="4" height="8" rx="1"></rect>
                  <rect x="14" y="14" width="4" height="8" rx="1"></rect>
                </svg>
                Games
              </a>
            </li>
            {/* Add other menu items here */}
          </ul>
        </div>

        <div className="mb-6">
          <h3
            className={`text-xs font-semibold uppercase ${
              darkMode ? "text-gray-400" : "text-gray-500"
            } tracking-wider`}
          >
            Settings
          </h3>
          <ul className="mt-3 space-y-1">
            {/* Add settings menu items here */}
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar