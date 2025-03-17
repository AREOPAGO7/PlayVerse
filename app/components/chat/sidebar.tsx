"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { db } from "@/app/firebase/config"
import { collection, query, where, getDocs } from "firebase/firestore"

interface SidebarProps {
  chats: any[]
  currentUser: any
  activeChat: string
  onChatSelect: (chatId: string) => void
  onCreateChat: (userId: string) => Promise<string>
}

export default function Sidebar({ chats, currentUser, activeChat, onChatSelect, onCreateChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [newChatName, setNewChatName] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])

  useEffect(() => {
    if (showNewChat && newChatName) {
      searchUsers(newChatName)
    } else {
      setSearchResults([])
    }
  }, [newChatName, showNewChat])

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm) {
      setSearchResults([])
      return
    }

    const usersRef = collection(db, "users")
    // Convert search term to lowercase for case-insensitive comparison
    const searchTermLower = searchTerm.toLowerCase()

    try {
      const querySnapshot = await getDocs(usersRef)
      const users = querySnapshot.docs
        .map(doc => ({
          uid: doc.id,
          username: doc.data().username,
          profilePictureUrl: doc.data().profilePictureUrl,
          status: doc.data().status || "offline",
          bio: doc.data().bio,
          ...doc.data(),
        }))
        .filter(user => 
          user.uid !== currentUser.uid && 
          user.username.toLowerCase().includes(searchTermLower)
        )
      setSearchResults(users)
    } catch (error) {
      console.error("Error searching users:", error)
      setSearchResults([])
    }
  }

  const getOtherUser = (chat: any) => {
    // Check if chat exists
    if (!chat)
      return {
        username: "Unknown User",
        profilePictureUrl: "/placeholder.svg?height=48&width=48",
        status: "offline",
      }

    // Handle different data structures that might come from Firestore
    if (chat.participants) {
      const otherParticipant = chat.participants.find((participant: any) => participant.uid !== currentUser.uid)

      return (
        otherParticipant || {
          username: "Unknown User",
          profilePictureUrl: "/placeholder.svg?height=48&width=48",
          status: "offline",
        }
      )
    } else if (chat.users) {
      const otherUser = chat.users.find((user: any) => user.uid !== currentUser.uid || user.id !== currentUser.uid)

      return (
        otherUser || {
          username: "Unknown User",
          profilePictureUrl: "/placeholder.svg?height=48&width=48",
          status: "offline",
        }
      )
    }

    // If no participants or users array is found, try to use direct properties
    if (chat.username && chat.uid !== currentUser.uid) {
      return chat
    }

    // Default fallback
    return {
      username: "Unknown User",
      profilePictureUrl: "/placeholder.svg?height=48&width=48",
      status: "offline",
    }
  }

  const filteredChats = chats.filter((chat) => {
    // If there's no search query, show all chats
    if (!searchQuery) return true

    const otherUser = getOtherUser(chat)
    // Check if username exists and contains the search query
    return otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  })

  const formatTime = (date?: any) => {
    if (!date) return "";

    try {
      // Handle Firestore Timestamp
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      // Handle regular date strings
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };
  const handleChatSelect = (chatId: string) => {
    // First trigger the parent's onChatSelect
    onChatSelect(chatId);
    
    // Log for debugging
    console.log("Selected chat:", chatId);
    console.log("Chat unread status:", chats.find(chat => chat.id === chatId)?.unread);
  };
  
  const handleCreateChat = async (userId: string) => {
    const chatId = await onCreateChat(userId)
    if (chatId) {
      onChatSelect(chatId)
      setShowNewChat(false)
      setNewChatName("")
      setSearchResults([])
    }
  }

  const getStatusColor = (status: string) => {
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

  useEffect(() => {
    console.log("Chats received in sidebar:", chats)
  }, [chats])

  return (
    <div className="w-80 h-full bg-[#111] border-r border-zinc-800 light:border-zinc-400 flex flex-col light:bg-light">
      <div className="p-4 border-b border-zinc-800 light:border-zinc-400">
        <div className="relative">
          <input
            type="text"
            placeholder={showNewChat ? "Search users..." : "Search chats"}
            value={showNewChat ? newChatName : searchQuery}
            onChange={(e) => (showNewChat ? setNewChatName(e.target.value) : setSearchQuery(e.target.value))}
            className="w-full bg-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white/70 focus:outline-none light:bg-zinc-200 light:text-zinc-800"
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
        {!showNewChat ? (
          filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const otherUser = getOtherUser(chat)
              return (
                // In the filteredChats.map section:
                <button
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors ${
                  activeChat === chat.id 
                    ? "bg-zinc-800 light:bg-zinc-200" 
                    : chat.unread && chat.unread > 0
                      ? "bg-green-900/30 border-l-4 border-green-500" // Enhanced highlight with border
                      : ""
                }`}
              >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={otherUser.profilePictureUrl || "/placeholder.svg?height=48&width=48"}
                        alt={otherUser.username}
                        width={48}
                        height={60}
                        className="object-cover"
                      />
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${getStatusColor(otherUser.status)}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`font-medium truncate ${
                        chat.unread > 0 
                          ? 'text-green-400 font-bold' 
                          : 'text-white/80 light:text-zinc-800'
                      }`}>
                        {otherUser.username}
                      </p>
                      <span className={`text-xs ${
                        chat.unread > 0 
                          ? 'text-green-400' 
                          : 'text-zinc-400 light:text-zinc-800'
                      }`}>
                        {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ""}
                      </span>
                    </div>
                    <p className={`text-sm truncate text-start w-full ${
                      chat.unread > 0 
                        ? 'text-green-400' 
                        : 'text-zinc-500 light:text-zinc-800'
                    }`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread}
                    </div>
                  )}
                </button>
              )
            })
          ) : (
            <div className="flex items-center justify-center h-32 text-zinc-500">No chats found</div>
          )
        ) : searchResults.length > 0 ? (
          searchResults.map((user) => (
            <button
              key={user.uid}
              onClick={() => handleCreateChat(user.uid)}
              className="w-full p-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors light:hover:bg-zinc-200 light:text-zinc-800"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={user.avatar || "/placeholder.svg?height=48&width=48"}
                    alt={user.username}
                    width={48}
                    height={60}
                    className="object-cover"
                  />
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${getStatusColor(user.status)}`}
                />
              </div>
              <div className=" min-w-0">
                <p className="font-medium truncate text-white/80 light:text-zinc-800 mr-14">{user.username}</p>
                {user.bio && (
                  <p className="text-sm text-zinc-500 truncate text-start w-full light:text-zinc-800">
                    {user.bio !== "none" ? user.bio : ""}
                  </p>
                )}
              </div>
            </button>
          ))
        ) : newChatName ? (
          <div className="flex items-center justify-center h-32 text-zinc-500">No users found</div>
        ) : null}
      </div>

      <div className="p-4 border-t border-zinc-800 light:border-zinc-400">
        {showNewChat ? (
          <button
            onClick={() => {
              setShowNewChat(false)
              setNewChatName("")
              setSearchResults([])
            }}
            className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors light:bg-zinc-200 light:text-zinc-800 light:hover:bg-zinc-300"
          >
            Cancel
          </button>
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

