import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

interface NotificationData {
  type: 'forum_comment' | 'forum_reply' | 'new_forum';
  message: string;
  userId: string;
  senderId: string;
  senderName: string;
  forumId: string;
  forumTitle?: string;
  createdAt: Timestamp;
  read: boolean;
}

export async function createForumNotification({
  type,
  message,
  userId,
  senderId,
  senderName,
  forumId,
  forumTitle
}: Omit<NotificationData, 'createdAt' | 'read'>) {
  try {
    const notificationData: NotificationData = {
      type,
      message,
      userId,
      senderId,
      senderName,
      forumId,
      forumTitle,
      createdAt: Timestamp.now(),
      read: false
    };

    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error creating forum notification:', error);
  }
}