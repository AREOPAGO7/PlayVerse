

export interface ForumTopic {
 
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  postCount: number;
  viewCount: number;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  lastPost?: {
    userId: string;
    username: string;
    timestamp: {
      seconds: number;
      nanoseconds: number;
    };
    content: string;
  };
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  order: number;
}

