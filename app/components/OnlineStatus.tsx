'use client'
import { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useUser } from '../contexts/UserContext'

export default function OnlineStatus() {
  const { user } = useUser()

  useEffect(() => {
    if (!user?.uid) return;

    const updateOnlineStatus = async () => {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        status: "online",
        lastSeen: new Date().toISOString()
      });
    };

    const handleOffline = async () => {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        status: "offline",
        lastSeen: new Date().toISOString()
      });
    };

    updateOnlineStatus();

    window.addEventListener('beforeunload', handleOffline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeunload', handleOffline);
      window.removeEventListener('offline', handleOffline);
      handleOffline();
    };
  }, [user?.uid]);

  return null;
}