"use client"

import { useState, useEffect } from "react"
import Navbar from "@/app/components/navigation/Navbar"
import Sidebar from "@/app/components/chat/sidebar"
import ChatArea from "@/app/components/chat/chat-area"
import { useChat } from "@/app/hooks/useChat"
import { useUser } from "@/app/contexts/UserContext"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
// import { Chat } from "@/app/types/chat"

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState<string>("")
  const { user } = useUser()
  const { messages, chats, sendMessage, createChat } = useChat(activeChat)
  
  // Add debugging to see what chats are coming from useChat
  useEffect(() => {
    console.log("Chats from useChat:", chats)
  }, [chats])
  
  // Make sure we're handling the case where chats might be null or undefined
  const handleChatSelect = async (chatId: string) => {
    if (!chats) return
    
    if (chats.some((chat) => chat.id === chatId)) {
      setActiveChat(chatId)
      
      // Mark chat as read when selected
      const selectedChat = chats.find(chat => chat.id === chatId)
      if (selectedChat && selectedChat.unread && selectedChat.unread > 0) {
        try {
          // Update the chat document in Firestore to mark it as read
          const chatRef = doc(db, "chats", chatId)
          await updateDoc(chatRef, {
            unread: 0
          })
          console.log("Chat marked as read:", chatId)
        } catch (error) {
          console.error("Error marking chat as read:", error)
        }
      }
    }
  }
  
  const currentChat = chats?.find((chat) => chat.id === activeChat)
  
  const handleSendMessage = (content: string, files: File[]) => {
    if (activeChat) {
      sendMessage(content, files)
    }
  }
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen text-white">Please log in to access the chat.</div>
  }
  
  return (
    <div className="h-screen flex flex-col bg-[#111111] dark:bg-[#111111] light:bg-zinc-200">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex">
          <div className="flex-1 flex bg-[#111]">
            <Sidebar
              chats={chats || []}
              currentUser={user}
              activeChat={activeChat}
              onChatSelect={handleChatSelect}
              onCreateChat={createChat}
            />
            
            <div className="flex-1 flex flex-col light:bg-zinc-200">
              {activeChat && currentChat ? (
                <ChatArea
                  messages={messages}
                  currentUser={{...user, status: user.status as "offline" | "online" | "away"}}
                  activeChat={currentChat}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  Select a chat to start messaging
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ChatPage