"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { db } from "@/app/firebase/config"
import { collection, getDocs } from "firebase/firestore"
import { Timestamp } from "firebase/firestore"
import { useOnlineUsers } from '@/app/hooks/useOnlineUsers'

interface User {
  uid: string
  username: string
  profilePictureUrl?: string
  avatar?: string
  status?: string
  bio?: string
  // Replace [key: string]: any with specific optional properties
  id?: string
  email?: string
  createdAt?: string | Date
  updatedAt?: string | Date
  displayName?: string
  phoneNumber?: string
  lastSeen?: string | Date
  preferences?: {
    notifications?: boolean
    theme?: string
    language?: string
    [key: string]: boolean | string | undefined
  }
}

interface ChatParticipant {
  uid: string
  username: string
  profilePictureUrl?: string
  status?: string
}

interface Chat {
  profilePictureUrl?: string
  id: string
  participants?: ChatParticipant[]
  users?: User[]
  lastMessage?: string
  lastMessageTime?: Timestamp | Date | string
  unread?: number
  username?: string
  uid?: string
  bio?: string
  avatar?: string
  status?: string
  createdAt?: Timestamp | Date | string
  updatedAt?: Timestamp | Date | string
  metadata?: {
    type?: string
    isGroupChat?: boolean
    customData?: Record<string, string | number | boolean>
  }
  participantIds?: string[]
}

interface SidebarProps {
  chats: Chat[]
  currentUser: User
  activeChat: string
  onChatSelect: (chatId: string) => void
  onCreateChat: (userId: string) => Promise<string>
}

export default function Sidebar({ chats, currentUser, activeChat, onChatSelect, onCreateChat }: SidebarProps) {
  const onlineUsers = useOnlineUsers();
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [newChatName, setNewChatName] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])

  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm) {
      setSearchResults([])
      return
    }

    const usersRef = collection(db, "users")
    const searchTermLower = searchTerm.toLowerCase()

    try {
      const querySnapshot = await getDocs(usersRef)
      const users = querySnapshot.docs
        .map(doc => ({
          uid: doc.id,
          username: doc.data().username,
          profilePictureUrl: doc.data().profilePictureUrl || doc.data().avatar, // Try both fields
          avatar: doc.data().avatar,
          bio: doc.data().bio,
          ...doc.data(),
        } as User))
        .filter(user => 
          user.uid !== currentUser.uid && 
          user.username.toLowerCase().includes(searchTermLower)
        )
      setSearchResults(users)
    } catch (error) {
      console.error("Error searching users:", error)
      setSearchResults([])
    }
  }, [currentUser.uid])

  useEffect(() => {
    if (showNewChat && newChatName) {
      searchUsers(newChatName)
    } else {
      setSearchResults([])
    }
  }, [newChatName, showNewChat, searchUsers])

  const getOtherUser = (chat: Chat): ChatParticipant => {
    if (!chat) {
      return {
        uid: "",
        username: "Unknown User",
        profilePictureUrl: "/placeholder.svg?height=48&width=48",
        status: "offline",
      }
    }

    const otherParticipantId = chat.participantIds?.find(id => id !== currentUser.uid);
    const isOnline = onlineUsers.includes(otherParticipantId || '');

    if (chat.participants) {
      const otherParticipant = chat.participants.find((participant) => participant.uid !== currentUser.uid)
      return {
        ...(otherParticipant || {
          uid: "",
          username: "Unknown User",
          profilePictureUrl: "/placeholder.svg?height=48&width=48",
        }),
        status: isOnline ? "online" : "offline"
      }
    }

    if (chat.users) {
      const otherUser = chat.users.find((user) => user.uid !== currentUser.uid)
      return {
        ...(otherUser || {
          uid: "",
          username: "Unknown User",
          profilePictureUrl: "/placeholder.svg?height=48&width=48",
        }),
        status: isOnline ? "online" : "offline"
      }
    }

    return {
      uid: chat.uid || "",
      username: chat.username || "Unknown User",
      profilePictureUrl: chat.profilePictureUrl || "/placeholder.svg?height=48&width=48",
      status: isOnline ? "online" : "offline"
    }
  }

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true
    const otherUser = getOtherUser(chat)
    return otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  })

  const formatTime = (date?: Timestamp | Date | string): string => {
    if (!date) return "";
    try {
      if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      return new Date(date as string | number).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleCreateChat = async (userId: string) => {
    try {
      const chatId = await onCreateChat(userId);
      if (chatId) {
        onChatSelect(chatId);
        setShowNewChat(false);
        setNewChatName("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  // Update the return statement
  return (
    <div className="w-80 h-full bg-[#111] border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full p-2 pl-8 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <svg
            className="absolute left-2.5 top-3 h-4 w-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={() => setShowNewChat(!showNewChat)}
          className="w-full mt-4 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {showNewChat ? "Back to Chats" : "New Chat"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!showNewChat ? (
          filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const otherUser = getOtherUser(chat)
              const otherParticipantId = chat.participantIds?.find(id => id !== currentUser.uid) || '';
              const isOnline = onlineUsers.includes(otherParticipantId);

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
                        src={otherUser.profilePictureUrl || "/placeholder.svg"}
                        alt={otherUser.username}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-zinc-900 ${
                        isOnline ? "bg-green-500" : "bg-zinc-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-white truncate">{otherUser.username}</h3>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-zinc-500">{formatTime(chat.lastMessageTime)}</span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-zinc-400 truncate text-left w-full">{chat.lastMessage}</p>
                    )}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="flex items-center justify-center h-32 text-zinc-500">
              No chats found
            </div>
          )
        ) : (
          <div className="p-4">
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Search users..."
              className="w-full p-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="mt-4 space-y-2">
              {searchResults.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => handleCreateChat(user.uid)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={user.profilePictureUrl || user.avatar || "/placeholder.svg"}
                      alt={user.username}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{user.username}</h3>
                    {user.bio && <p className="text-sm text-zinc-400 truncate">{user.bio}</p>}
                  </div>
                </button>
              ))}
              {newChatName && searchResults.length === 0 && (
                <p className="text-center text-zinc-500">No users found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}