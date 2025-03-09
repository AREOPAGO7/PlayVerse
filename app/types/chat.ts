export interface User {
    id: string
    username: string
    avatar: string
    status: "online" | "away" | "offline" | "playing"
    game?: string
  }
  
  export interface Chat {
    id: string
    name: string
    lastMessage?: string
    lastMessageTime?: string  // Changed from Date to string
    unread: number
    users: User[]
    type?: "channel" | "direct"
    icon?: string
    members?: User[]
  }
  
  export interface Attachment {
    type: "image" | "video" | "clip"
    url: string
    thumbnail?: string
    title?: string
  }
  
  export interface Message {
    id: string
    userId: string
    content: string
    // to be fixed  111
    timestamp: string
    attachments?: Attachment[]
  }
  
  export interface Channel {
    id: string
    name: string
    type: "channel" | "direct"
    icon?: string
    members?: User[]
    unread: number
  }
  
  export interface Reaction {
    emoji: string
    count: number
    userIds: string[]
  }
  
  