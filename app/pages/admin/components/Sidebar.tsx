"use client"
import { FC } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SidebarProps {
  darkMode: boolean
  sidebarOpen: boolean
}

const Sidebar: FC<SidebarProps> = ({ darkMode, sidebarOpen }) => {
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "adminEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    router.push("/pages/admin/login")
  }

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 w-64 ${
        darkMode ? "bg-[#111] text-white" : "bg-zinc-50 text-zinc-800"
      } border-r ${
        darkMode ? "border-zinc-800" : "border-zinc-200"
      } transition-all duration-300 ease-in-out z-20 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h3 className={`text-xs font-semibold uppercase ${darkMode ? "text-zinc-400" : "text-zinc-500"} tracking-wider`}>
              Main
            </h3>
            <ul className="mt-3 space-y-1">
              <li>
                <Link href="/pages/refresh" className={`flex items-center px-3 py-2 rounded-md ${
                  darkMode ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-zinc-100 text-zinc-700"
                } transition duration-300`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                    <path d="M23 4v6h-6"></path>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  Refresh Games
                </Link>
              </li>

              <li>
                <Link href="/pages/admin" className={`flex items-center px-3 py-2 rounded-md ${
                  darkMode ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-zinc-100 text-zinc-700"
                } transition duration-300`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                    <rect x="4" y="2" width="16" height="12" rx="2"></rect>
                    <path d="M6 6h.01"></path>
                    <path d="M10 6h.01"></path>
                    <path d="M14 6h.01"></path>
                    <path d="M18 6h.01"></path>
                    <rect x="6" y="14" width="4" height="8" rx="1"></rect>
                    <rect x="14" y="14" width="4" height="8" rx="1"></rect>
                  </svg>
                  Manage Games
                </Link>
              </li>

              <li>
                <Link href="/pages/admin/users" className={`flex items-center px-3 py-2 rounded-md ${
                  darkMode ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-zinc-100 text-zinc-700"
                } transition duration-300`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Manage Users
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className={`text-xs font-semibold uppercase ${
              darkMode ? "text-zinc-400" : "text-zinc-500"
            } tracking-wider`}>
              Settings
            </h3>
            <ul className="mt-3 space-y-1">
              <li>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center px-3 py-2 rounded-md ${
                    darkMode ? "text-red-400 hover:bg-zinc-800" : "text-red-500 hover:bg-zinc-100"
                  } transition duration-300`}
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
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
