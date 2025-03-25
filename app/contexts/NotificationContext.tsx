'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useUser } from './UserContext';

interface Notification {
  id: string;
  type: 'forum_comment' | 'forum_reply' | 'new_forum';
  message: string;
  read: boolean;
  createdAt: Timestamp;
  forumId: string;
  forumTitle?: string;
  senderId: string;
  senderName: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')  
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    const batch = writeBatch(db);

    unreadNotifications.forEach((notification) => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, { read: true });
    });

    await batch.commit();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}