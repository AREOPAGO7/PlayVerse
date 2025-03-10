'use client'

import Image from "next/image"
import type { Message as MessageType, User } from "../../types/chat"

interface MessageProps {
  message: MessageType
  user: User | undefined
  isCurrentUser: boolean
  showHeader: boolean
}

export default function Message({ message, user, isCurrentUser, showHeader }: MessageProps) {
  const formatTime = (timestamp: string) => {
    return timestamp;
  }

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
        {showHeader && !isCurrentUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={user?.avatar || "/placeholder.svg"}
                alt={user?.username || "User"}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <span className="font-medium text-sm">{user?.username}</span>
          </div>
        )}

        <div
          className={`rounded-lg p-3 ${
            isCurrentUser ? "bg-green-600 text-white rounded-tr-none text-sm" : "bg-zinc-800 text-white/90 text-sm rounded-tl-none"
          }`}
        >
          <p className="whitespace-pre-wrap font-medium ">{message.content}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={attachment.thumbnail || attachment.url}
                      alt="Attachment"
                      fill
                      className="object-cover"
                    />
                    {attachment.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black bg-opacity-60 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={`text-xs mt-1 ${isCurrentUser ? "text-green-200" : "text-zinc-400"}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  )
}

