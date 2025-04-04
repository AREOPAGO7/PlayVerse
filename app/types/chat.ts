// import { Timestamp } from "firebase/firestore";

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

export interface User {
  uid: string;
  username: string;
  profilePictureUrl?: string;
  avatar?: string;
  status: string; // Make sure this is required
  bio?: string;
  id?: string;
  email?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  displayName?: string;
  phoneNumber?: string;
  lastSeen?: string | Date;
  preferences?: {
    notifications?: boolean;
    theme?: string;
    language?: string;
    [key: string]: boolean | string | undefined;
  };
}

export interface ChatParticipant {
  uid: string;
  username: string;
  profilePictureUrl?: string;
  status?: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  timestamp: FirestoreTimestamp | Date | string;
  attachments?: Array<{
    url: string;
    thumbnail?: string;
    type?: string;
  }>;
}

export interface Chat {
  id: string;
  profilePictureUrl?: string;
  participants?: ChatParticipant[];
  users?: User[];
  lastMessage?: string;
  lastMessageTime?: FirestoreTimestamp | Date | string;
  lastMessageUserId?: string;
  unread?: number;
  unreadCounts?: Record<string, number>;
  username?: string;
  uid?: string;
  bio?: string;
  avatar?: string;
  status?: string;
  createdAt?: FirestoreTimestamp | Date | string;
  updatedAt?: FirestoreTimestamp | Date | string;
  participantIds?: string[];
  metadata?: {
    type?: string;
    isGroupChat?: boolean;
    customData?: Record<string, string | number | boolean>;
  };
}