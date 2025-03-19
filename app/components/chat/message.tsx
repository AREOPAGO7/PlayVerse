'use client'

import Image from "next/image"
import { Message as MessageType, FirestoreTimestamp } from "@/app/types/chat"

interface MessageProps {
  message: MessageType
  user: {
    profilePictureUrl?: string;
    username?: string;
  }
  isCurrentUser: boolean
  showHeader: boolean
}

export default function Message({ message, user, isCurrentUser, showHeader }: MessageProps) {
  const formatTime = (timestamp: string | number | Date | FirestoreTimestamp) => {
    if (!timestamp) return "";
    
    try {
      // Handle Firestore Timestamp objects
      if (typeof timestamp === 'object' && 'seconds' in timestamp) {
        const firestoreTimestamp = timestamp as FirestoreTimestamp;
        return new Date(firestoreTimestamp.seconds * 1000).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
      
      // Handle regular dates, timestamps, and strings
      const date = new Date(timestamp as string | number | Date);
      if (isNaN(date.getTime())) {
        return "Invalid time";
      }
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid time";
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4 light:bg-light`}>
      <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
        {showHeader && !isCurrentUser && (
          <div className="flex items-center gap-2 mb-1 light:bg-light">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={user?.profilePictureUrl || "/placeholder.svg?height=32&width=32"}
                alt={user?.username || "User"}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <span className="font-medium text-sm light:text-black/90">{user?.username}</span>
          </div>
        )}

        <div
          className={`rounded-lg p-3 ${
            isCurrentUser ? "bg-green-600 text-white rounded-tr-none text-sm" : "bg-zinc-800 text-white/90 text-sm rounded-tl-none light:bg-zinc-200 light:text-zinc-800"
          }`}
        >
          <p className="whitespace-pre-wrap font-medium">{message.content}</p>

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