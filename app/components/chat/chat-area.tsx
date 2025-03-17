"use client"

import Image from 'next/image'
import { useRef, useEffect } from "react"
import Message from "./message"
import MessageInput from "./message-input"
import type { Message as MessageType, User, Chat } from "@/app/types/chat"

interface ChatAreaProps {
  messages: MessageType[]
  currentUser: User
  activeChat: Chat
  onSendMessage: (content: string, files: File[]) => void
}

export default function ChatArea({ messages, currentUser, activeChat, onSendMessage }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getUserById = (id: string) => {
    return activeChat?.participants?.find((user: { uid: string }) => user.uid === id) || {
      uid: id,
      username: 'Unknown User',
      profilePictureUrl: '/placeholder.svg?height=40&width=40',
      status: 'offline'
    }
  }

  const getOtherUser = () => {
    if (!activeChat?.participants) {
      return {
        username: 'Unknown User',
        profilePictureUrl: '/placeholder.svg?height=40&width=40',
        status: 'offline'
      }
    }
    
    const otherParticipant = activeChat.participants.find(
      (participant) => participant.uid !== currentUser.uid
    ) || activeChat.participants[0]
    
    return {
      username: otherParticipant?.username || 'Unknown User',
      profilePictureUrl: otherParticipant?.profilePictureUrl || '/placeholder.svg?height=40&width=40',
      status: otherParticipant?.status || 'offline'
    }
  }

  const otherUser = getOtherUser()

  return (
    <div className="flex-1 flex flex-col h-full light:bg-light">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3 light:border-zinc-400">
        <div className="w-10 h-10 rounded-full overflow-hidden light:border-zinc-400">
          <Image
            src={otherUser.profilePictureUrl || "/placeholder.svg"}
            alt={otherUser.username || 'alt'}
            className="w-full h-full object-cover"
            width={40}
            height={40}
          />
        </div>
        <div>
          <h2 className="font-medium light:text-zinc-800">{otherUser.username}</h2>
          <p className="text-sm text-zinc-400 light:text-zinc-800">
            {otherUser.status === "online"
              ? "Online"
              : otherUser.status === "away"
                ? "Away"
                : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 light:bg-light">
        {messages.map((message, index) => {
          const user = getUserById(message.userId)
          const isCurrentUser = message.userId === currentUser.uid
          const prevMessage = index > 0 ? messages[index - 1] : null
          const showHeader = !prevMessage || prevMessage.userId !== message.userId

          return (
            <Message
              key={message.id}
              message={message}
              user={user}
              isCurrentUser={isCurrentUser}
              showHeader={showHeader}
            />
          )
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  )
}
