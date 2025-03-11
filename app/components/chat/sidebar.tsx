"use client"

import { useState } from "react"
import Image from "next/image"
import type { User, Chat } from "../../types/chat"

interface SidebarProps {
  chats: Chat[]
  currentUser: User
  activeChat: string
  onChatSelect: (chatId: string) => void
}

export default function Sidebar({ chats, currentUser, activeChat, onChatSelect }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [newChatName, setNewChatName] = useState("")

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getOtherUser = (chat: Chat) => {
    return chat.users.find((user) => user.id !== currentUser.id) || chat.users[0]
  }

  const formatTime = (date?: string) => {
    if (!date) return ""
    return date
  }

  const handleCreateChat = () => {
    // In a real app, you would create a new chat here
    setShowNewChat(false)
    setNewChatName("")
  }

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-zinc-500"
      default:
        return "bg-zinc-500"
    }
  }

  return (
    <div className="w-80 h-full bg-[#111] border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white/70 focus:outline-none"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => {
          const otherUser = getOtherUser(chat)
          return (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors ${
                activeChat === chat.id ? "bg-zinc-800" : ""
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={otherUser.avatar || "/placeholder.svg"}
                    alt={otherUser.username}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${getStatusColor(otherUser.status)}`}
                ></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-medium truncate text-white/80">{otherUser.username}</p>
                  <span className="text-xs text-zinc-400">{formatTime(chat.lastMessageTime)}</span>
                </div>
                <p className="text-sm text-zinc-500 truncate text-start w-full">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-zinc-800">
        {showNewChat ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter username"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewChat(false)}
                className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChat}
                className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewChat(true)}
            className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <span>New Chat</span>
          </button>
        )}
      </div>
    </div>
  )
}

