"use client"

import Image from 'next/image'
import { useRef, useEffect } from "react"
import Message from "./message"
import MessageInput from "./message-input"
import { Message as MessageType, User, Chat, ChatParticipant } from "@/app/types/chat"
import { useOnlineUsers } from '@/app/hooks/useOnlineUsers';

interface ChatAreaProps {
  messages: MessageType[]
  currentUser: User
  activeChat: Chat
  onSendMessage: (content: string, files: File[]) => void
}

export default function ChatArea({ messages, currentUser, activeChat, onSendMessage }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const onlineUsers = useOnlineUsers();
  
  const otherParticipantId = activeChat?.participantIds?.find(
    id => id !== currentUser.uid
  ) || activeChat?.participantIds?.[0] || '';
  
  // Use the hook at the component level

  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  const getUserById = (id: string): ChatParticipant => {
    return activeChat?.participants?.find((user: { uid: string }) => user.uid === id) || {
      uid: id,
      username: 'Unknown User',
      profilePictureUrl: '/placeholder.svg?height=40&width=40',
      status: 'offline'
    }
  }
  
  const getOtherUser = () => {
    if (!activeChat?.participantIds) {
      return {
        username: 'Unknown User',
        profilePictureUrl: '/placeholder.svg?height=40&width=40',
        status: 'offline'
      }
    }
    
    const otherParticipant = activeChat.participants?.find(
      p => p.uid === otherParticipantId
    );
    
    return {
      username: otherParticipant?.username || 'Unknown User',
      profilePictureUrl: otherParticipant?.profilePictureUrl || '/placeholder.svg?height=40&width=40',
      status: onlineUsers.includes(otherParticipantId) ? 'online' : 'offline'
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
          <h2 className="font-semibold  light:text-zinc-800">{otherUser.username}</h2>
          <p className={`text-sm font-semibold ${
            otherUser.status === "online" 
              ? "text-green-500" 
              : "text-zinc-400"
          } light:text-zinc-800`}>
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