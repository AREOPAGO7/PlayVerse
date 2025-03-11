"use client"
import Image from 'next/image';
import { useRef, useEffect } from "react"
import Message from "./message"
import MessageInput from "./message-input"
import type { Message as MessageType, User, Chat } from "../../types/chat"

interface ChatAreaProps {
  messages: MessageType[]
  users: User[]
  currentUser: User
  activeChat: Chat
  onSendMessage: (content: string, attachments: File[]) => void
}

export default function ChatArea({ messages, users, currentUser, activeChat, onSendMessage }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id)
  }

  const getOtherUser = (chat: Chat) => {
    return chat.users.find((user) => user.id !== currentUser.id) || chat.users[0]
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src={getOtherUser(activeChat).avatar || "/placeholder.svg"}
            alt={getOtherUser(activeChat).username}
            className="w-full h-full object-cover"
            width={10}
            height={10}
          />
        </div>
        <div>
          <h2 className="font-medium">{getOtherUser(activeChat).username}</h2>
          <p className="text-sm text-zinc-400">
            {getOtherUser(activeChat).status === "online"
              ? "Online"
              : getOtherUser(activeChat).status === "away"
                ? "Away"
                : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => {
          const user = getUserById(message.userId)
          const isCurrentUser = message.userId === currentUser.id
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

