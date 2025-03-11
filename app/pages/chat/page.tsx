'use client'

import Navbar from '@/app/components/navigation/Navbar';
import { useState } from "react"
import Sidebar from "../../components/chat/sidebar"
import ChatArea from "../../components/chat/chat-area"
import type { User, Chat, Message, Attachment } from "../../types/chat"

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState<string>("chat1")

  const currentUser: User = {
    id: "current-user",
    username: "You",
    avatar: "https://github.com/shadcn.png",
    status: "online",
  }

  const users: User[] = [
    currentUser,
    {
      id: "user1",
      username: "Alex Johnson",
      avatar: "https://github.com/shadcn.png",
      status: "online",
    },
    {
      id: "user2",
      username: "Sam Wilson",
      avatar: "https://github.com/shadcn.png",
      status: "away",
    },
    {
      id: "user3",
      username: "Taylor Smith",
      avatar: "https://github.com/shadcn.png",
      status: "offline",
    },
  ]

  const [chats, setChats] = useState<Chat[]>([
    {
      id: "chat1",
      name: "Alex Johnson",
      lastMessage: "See you tomorrow!",
      lastMessageTime: "Jul 17",
      unread: 0,
      users: [currentUser, users[1]],
    },
    {
      id: "chat2",
      name: "Sam Wilson",
      lastMessage: "Can you send me that file?",
      lastMessageTime: "Jul 17",
      unread: 3,
      users: [currentUser, users[2]],
    },
    {
      id: "chat3",
      name: "Taylor Smith",
      lastMessage: "Thanks for your help!",
      lastMessageTime: "Jul 17",
      unread: 0,
      users: [currentUser, users[3]],
    },
  ])

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    chat1: [
      {
        id: "msg1",
        userId: "user1",
        content: "Hey there! How's it going?",
        timestamp: "Jul 17",
      },
      {
        id: "msg2",
        userId: "current-user",
        content: "I'm doing well, thanks for asking! Just working on some projects.",
        timestamp: 'Jul 17',
      },
      {
        id: "msg3",
        userId: "user1",
        content: "That sounds interesting! What kind of projects?",
        timestamp: 'Jul 17',
      },
      {
        id: "msg4",
        userId: "current-user",
        content: "Mostly web development stuff. I'm building a chat application right now!",
        timestamp: 'Jul 17',
      },
      {
        id: "msg5",
        userId: "user1",
        content: "That's awesome! I'd love to see it when it's ready.",
        timestamp: 'Jul 17',
      },
      {
        id: "msg6",
        userId: "user1",
        content: "By the way, check out this cool photo I took yesterday!",
        timestamp: 'Jul 17',
        attachments: [
          {
            type: "image",
            url: "/games/banners/reddead.png",
          },
        ],
      },
      {
        id: "msg7",
        userId: "current-user",
        content: "Wow, that looks great! Where was that taken?",
        timestamp: 'Jul 17',
      },
    ],
    chat2: [
      {
        id: "msg1",
        userId: "user2",
        content: "Hi there! Do you have the presentation files?",
        timestamp: 'Jul 17',
      },
      {
        id: "msg2",
        userId: "current-user",
        content: "Yes, I'll send them over in a minute.",
        timestamp: 'Jul 17',
      },
      {
        id: "msg3",
        userId: "user2",
        content: "Great, thanks! Also, can you send me that document we discussed?",
        timestamp: 'Jul 17',
      },
      {
        id: "msg4",
        userId: "user2",
        content: "And don't forget about the meeting tomorrow at 10 AM.",
        timestamp: 'Jul 17',
      },
      {
        id: "msg5",
        userId: "user2",
        content: "Can you send me that file?",
        timestamp: 'Jul 17',
      },
    ],
    chat3: [
      {
        id: "msg1",
        userId: "current-user",
        content: "Hey Taylor, I was wondering if you could help me with something?",
        timestamp: 'Jul 17',
      },
      {
        id: "msg2",
        userId: "user3",
        content: "Sure, what do you need?",
        timestamp: 'Jul 17',
      },
      {
        id: "msg3",
        userId: "current-user",
        content: "I'm trying to figure out how to implement this feature...",
        timestamp: 'Jul 17',
      },
      {
        id: "msg4",
        userId: "user3",
        content: "I see. Let me show you how to do it.",
        timestamp: 'Jul 17',
        attachments: [
          {
            type: "image",
            url: "/placeholder.svg?height=400&width=600",
          },
        ],
      },
      {
        id: "msg5",
        userId: "current-user",
        content: "That makes sense now. Thanks for your help!",
        timestamp: 'Jul 17',
      },
      {
        id: "msg6",
        userId: "user3",
        content: "No problem! Let me know if you need anything else.",
        timestamp: 'Jul 17',
      },
      {
        id: "msg7",
        userId: "current-user",
        content: "Will do, thanks again!",
        timestamp: 'Jul 17',
      },
      {
        id: "msg8",
        userId: "user3",
        content: "Thanks for your help!",
        timestamp: 'Jul 17',
      },
    ],
  })

  const handleSendMessage = (content: string, files: File[]) => {
    // In a real app, you would upload files to a server and get URLs back
    const attachments: Attachment[] = files.map((file) => ({
      type: file.type.startsWith("image/") ? "image" : "video",
      url: URL.createObjectURL(file),
    }))

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      content,
      timestamp: 'Jul 17',
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    // Update messages
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage],
    }))

    // Update chat preview
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              lastMessage: content || "Sent an attachment",
              lastMessageTime: "Jul 17",
              unread: 0,
            }
          : chat,
      ),
    )
  }

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)

    // Mark as read
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, unread: 0 } : chat)))
  }

  const getActiveChatObject = () => {
    return chats.find((chat) => chat.id === activeChat) || chats[0]
  }

  return (
    <div className="h-screen flex flex-col bg-[#111111]">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex">
          {/* Chat Container */}
          <div className="flex-1 flex bg-[#111]">
            {/* Chat Sidebar */}
            <Sidebar 
              chats={chats} 
              currentUser={currentUser} 
              activeChat={activeChat} 
              onChatSelect={handleChatSelect} 
            />

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              <ChatArea
                messages={messages[activeChat] || []}
                users={users}
                currentUser={currentUser}
                activeChat={getActiveChatObject()}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;