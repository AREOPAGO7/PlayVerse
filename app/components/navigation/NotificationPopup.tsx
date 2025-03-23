'use client';

import React, { useState } from 'react';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useNotifications } from '@/app/contexts/NotificationContext';
import Link from 'next/link';

export default function NotificationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/70 hover:text-white focus:outline-none"
      >
        <IoNotificationsOutline className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-green-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] rounded-lg shadow-lg py-1 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
            <h3 className="text-sm font-medium text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-green-500 hover:text-green-400"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-zinc-400 p-4 text-center">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={`/pages/forums?id=${notification.forumId}`}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`block px-4 py-3 hover:bg-zinc-800 ${!notification.read ? 'bg-zinc-800/50' : ''}`}
                >
                  <p className="text-sm text-white mb-1">{notification.message}</p>
                  <p className="text-xs text-zinc-400">
                    {notification.senderName} • {new Date(notification.createdAt.seconds * 1000).toLocaleString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}