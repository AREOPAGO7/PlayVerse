export interface User {
  uid: string
  username: string
  profilePictureUrl?: string
  status?: "online" | "offline" | "away"
  bio?: string
}

export interface Message {
  id: string
  content: string
  userId: string
  timestamp: string
  attachments?: Array<{
    url: string
    type: "image" | "video"
    thumbnail?: string
  }>
}

export interface Chat {
  id: string
  participants: User[]
  lastMessage?: string
  lastMessageTime?: string
  unread?: number
}