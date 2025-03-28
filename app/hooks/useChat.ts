"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { db } from "@/app/firebase/config"
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  getDocs,
  DocumentData,
  Timestamp,
  QuerySnapshot
} from "firebase/firestore"
import { useUser } from "@/app/contexts/UserContext"

// First, update the ChatMessage interface
interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  timestamp: Timestamp;
  attachments: Array<{
    url: string;
    type: string;
    name: string;
    size: number;
  }>;
}

interface ChatData {
  id: string;
  participantIds: string[];
  participants: { 
    uid: string;
    username: string;
    profilePictureUrl?: string;
    avatar?: string;
    status?: string;
  }[];
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  lastMessageUserId?: string;
  unreadCounts?: Record<string, number>;
  unread?: number;
  createdAt?: Timestamp;
}

export function useChat(activeChatId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chats, setChats] = useState<ChatData[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const processedMessagesRef = useRef<Record<string, boolean>>({})

  // Fetch user's chats
  useEffect(() => {
    if (!user?.uid) return

    const chatsRef = collection(db, "chats")
    const q = query(chatsRef, where("participantIds", "array-contains", user.uid))

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const chatData: ChatData[] = []

        snapshot.forEach((doc) => {
          const data = doc.data() as DocumentData
          
          let unreadCount = 0;
          if (data.unreadCounts && data.unreadCounts[user.uid]) {
            unreadCount = doc.id === activeChatId ? 0 : data.unreadCounts[user.uid];
          }
          
          chatData.push({
            id: doc.id,
            ...data,
            unread: unreadCount
          } as ChatData)
        })

        console.log("Chats from Firestore:", chatData)
        setChats(chatData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching chats:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user, activeChatId])

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChatId || !user?.uid) {
      setMessages([])
      return
    }

    const messagesRef = collection(db, "chats", activeChatId, "messages")
    const q = query(messagesRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData: ChatMessage[] = []

      snapshot.forEach((doc) => {
        messageData.push({
          id: doc.id,
          ...doc.data(),
        } as ChatMessage)
      })

      messageData.sort((a, b) => {
        if (!a.timestamp) return 1
        if (!b.timestamp) return -1
        return a.timestamp.seconds - b.timestamp.seconds
      })

      setMessages(messageData)
    })

    return () => unsubscribe()
  }, [activeChatId, user?.uid])

  // Listen for new messages in other chats
  useEffect(() => {
    if (!user?.uid) return
    
    const unsubscribes: (() => void)[] = []
    
    chats.forEach(chat => {
      if (chat.id === activeChatId) return
      
      const messagesRef = collection(db, "chats", chat.id, "messages")
      const q = query(messagesRef)
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        let newMessageCount = 0
        
        snapshot.docChanges().forEach(change => {
          if (change.type === "added") {
            const messageData = change.doc.data()
            const messageId = change.doc.id
            
            if (messageData.userId === user.uid) {
              processedMessagesRef.current[messageId] = true
              return
            }
            
            if (processedMessagesRef.current[messageId]) return
            
            if (messageData.timestamp) {
              const messageTime = messageData.timestamp.toDate?.() || new Date()
              const now = new Date()
              const messageAge = (now.getTime() - messageTime.getTime()) / 1000
              
              if (messageAge > 10) {
                processedMessagesRef.current[messageId] = true
                return
              }
            }
            
            newMessageCount++
            processedMessagesRef.current[messageId] = true
          }
        })
        
        if (newMessageCount > 0) {
          try {
            const chatRef = doc(db, "chats", chat.id)
            const chatSnap = await getDoc(chatRef)
            
            if (chatSnap.exists()) {
              const chatData = chatSnap.data();
              const unreadCounts = chatData.unreadCounts || {};
              unreadCounts[user.uid] = (unreadCounts[user.uid] || 0) + newMessageCount;
              
              await updateDoc(chatRef, {
                unreadCounts: unreadCounts
              });
            }
          } catch (error) {
            console.error("Error updating unread count:", error)
          }
        }
      })
      
      unsubscribes.push(unsubscribe)
    })
    
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [chats, user?.uid, activeChatId])
  
  // Reset unread count when a chat becomes active
  const markChatAsRead = useCallback(async (chatId: string) => {
    if (!chatId || !user?.uid) return
    
    try {
      const chatRef = doc(db, "chats", chatId)
      const chatSnap = await getDoc(chatRef)
      
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        const unreadCounts = chatData.unreadCounts || {};
        
        if (unreadCounts[user.uid]) {
          unreadCounts[user.uid] = 0;
          await updateDoc(chatRef, {
            unreadCounts: unreadCounts
          });
        }
      }
    } catch (error) {
      console.error("Error marking chat as read:", error)
      throw error
    }
  }, [user?.uid])

  useEffect(() => {
    if (activeChatId && user?.uid) {
      markChatAsRead(activeChatId).catch(error => 
        console.error("Error marking chat as read on activation:", error)
      )
    }
  }, [activeChatId, user?.uid, markChatAsRead]) // Add markChatAsRead to the dependency array

  // Function to send a message
  const sendMessage = async (content: string, files: File[] = []) => {
    if (!activeChatId || !user?.uid || (!content.trim() && files.length === 0)) return;

    try {
      const attachments: never[] = []
      
      const chatRef = doc(db, "chats", activeChatId)
      const chatSnap = await getDoc(chatRef)
      
      if (!chatSnap.exists()) {
        console.error("Chat not found")
        return
      }
      
      const chatData = chatSnap.data()
      const otherParticipantId = chatData.participantIds.find((id: string) => id !== user.uid)
      
      const unreadCounts = chatData.unreadCounts || {};
      if (otherParticipantId) {
        unreadCounts[otherParticipantId] = (unreadCounts[otherParticipantId] || 0) + 1;
      }
      
      await updateDoc(chatRef, {
        lastMessage: content || "Sent an attachment",
        lastMessageTime: serverTimestamp(),
        lastMessageUserId: user.uid,
        unreadCounts: unreadCounts
      })

      const messagesRef = collection(db, "chats", activeChatId, "messages")
      await addDoc(messagesRef, {
        content,
        userId: user.uid,
        timestamp: serverTimestamp(),
        attachments,
      })
    // Create notification for the recipient
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      type: 'chat_message',
      userId: otherParticipantId,
      senderId: user.uid,
      senderName: user.displayName || 'User',
      message: `New message: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`,
      chatId: activeChatId,
      read: false,
      createdAt: serverTimestamp(),
    });

  } catch (error) {
    console.error("Error sending message:", error);
  }
};

  // Function to create a new chat
  const createChat = async (otherUserId: string) => {
    if (!user?.uid || !otherUserId) return ""

    try {
      const chatsRef = collection(db, "chats")
      const q = query(chatsRef, where("participantIds", "array-contains", user.uid))

      const querySnapshot = await getDocs(q)
      let existingChatId = ""

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.participantIds.includes(otherUserId)) {
          existingChatId = doc.id
        }
      })

      if (existingChatId) {
        return existingChatId
      }

      const otherUserRef = doc(db, "users", otherUserId)
      const otherUserSnap = await getDoc(otherUserRef)

      if (!otherUserSnap.exists()) {
        throw new Error("User not found")
      }

      const otherUserData = otherUserSnap.data()

      const unreadCounts: Record<string, number> = {};
      unreadCounts[user.uid] = 0;
      unreadCounts[otherUserId] = 0;
      
      const newChatRef = await addDoc(collection(db, "chats"), {
        participantIds: [user.uid, otherUserId],
        participants: [
          {
            uid: user.uid,
            username: user.username,
            profilePictureUrl: user.avatar,
            status: user.status || "offline",
          },
          {
            uid: otherUserId,
            username: otherUserData.username,
            profilePictureUrl: otherUserData.avatar,
            status: otherUserData.status || "offline",
          },
        ],
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        unreadCounts: unreadCounts
      })

      return newChatRef.id
    } catch (error) {
      console.error("Error creating chat:", error)
      return ""
    }
  }

  return { messages, chats, loading, sendMessage, createChat, markChatAsRead }
}