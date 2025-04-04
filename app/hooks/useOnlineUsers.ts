import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const onlineQuery = query(usersRef, where('status', '==', 'online'));

    const unsubscribe = onSnapshot(onlineQuery, (snapshot) => {
      const onlineUserIds = snapshot.docs.map(doc => doc.id);
      setOnlineUsers(onlineUserIds);
    });

    return () => unsubscribe();
  }, []);

  return onlineUsers;
}