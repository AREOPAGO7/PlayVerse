"use client"

import { useState, useEffect, useRef } from "react"
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
  increment,
  Timestamp,
  setDoc,
} from "firebase/firestore"
import { useUser } from "@/app/contexts/UserContext"

export function useChat(activeChatId: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  // Use a ref instead of state to avoid triggering re-renders
  const processedMessagesRef = useRef<Record<string, boolean>>({})

  // Fetch user's chats
  useEffect(() => {
    if (!user?.uid) return

    const chatsRef = collection(db, "chats")
    const q = query(chatsRef, where("participantIds", "array-contains", user.uid))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatData: any[] = []

        snapshot.forEach((doc) => {
          const data = doc.data()
          
          // Transform unreadCounts object to unread count for current user
          let unreadCount = 0;
          if (data.unreadCounts && data.unreadCounts[user.uid]) {
            // Only show unread count if this is not the active chat
            unreadCount = doc.id === activeChatId ? 0 : data.unreadCounts[user.uid];
          }
          
          chatData.push({
            id: doc.id,
            ...data,
            unread: unreadCount // Override with user-specific unread count, zeroed if active
          })
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
  }, [user, activeChatId]) // Added activeChatId as dependency to re-fetch when active chat changes

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChatId || !user?.uid) {
      setMessages([])
      return
    }

    const messagesRef = collection(db, "chats", activeChatId, "messages")
    const q = query(messagesRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData: any[] = []

      snapshot.forEach((doc) => {
        messageData.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      // Sort messages by timestamp
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
    
    // Process each chat separately
    chats.forEach(chat => {
      if (chat.id === activeChatId) return // Skip active chat
      
      const messagesRef = collection(db, "chats", chat.id, "messages")
      const q = query(messagesRef)
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        let newMessageCount = 0
        
        // Only process added messages that we haven't seen before
        snapshot.docChanges().forEach(change => {
          if (change.type === "added") {
            const messageData = change.doc.data()
            const messageId = change.doc.id
            
            // Skip messages from the current user - don't count these as unread
            if (messageData.userId === user.uid) {
              processedMessagesRef.current[messageId] = true
              return
            }
            
            // Skip already processed messages using the message ID
            if (processedMessagesRef.current[messageId]) return
            
            // Skip old messages (those created more than 10 seconds ago)
            if (messageData.timestamp) {
              const messageTime = messageData.timestamp.toDate?.() || new Date()
              const now = new Date()
              const messageAge = (now.getTime() - messageTime.getTime()) / 1000
              
              if (messageAge > 10) {
                // Still mark as processed even if it's old
                processedMessagesRef.current[messageId] = true
                return
              }
            }
            
            // This is a new message that needs to be counted
            newMessageCount++
            processedMessagesRef.current[messageId] = true
          }
        })
        
        // Update the unread count in Firestore only if we have new messages
        if (newMessageCount > 0) {
          try {
            const chatRef = doc(db, "chats", chat.id)
            const chatSnap = await getDoc(chatRef)
            
            if (chatSnap.exists()) {
              const chatData = chatSnap.data();
              // Initialize or update the unreadCounts field
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
  useEffect(() => {
    if (activeChatId && user?.uid) {
      markChatAsRead(activeChatId).catch(error => 
        console.error("Error marking chat as read on activation:", error)
      )
    }
  }, [activeChatId, user?.uid])

  // Function to mark a chat as read
  const markChatAsRead = async (chatId: string) => {
    if (!chatId || !user?.uid) return
    
    try {
      const chatRef = doc(db, "chats", chatId)
      const chatSnap = await getDoc(chatRef)
      
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        // Initialize or update the unreadCounts field
        const unreadCounts = chatData.unreadCounts || {};
        
        // Only update if there are unread messages
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
  }

  // Function to send a message
  const sendMessage = async (content: string, files: File[] = []) => {
    if (!activeChatId || !user?.uid || (!content.trim() && files.length === 0)) return

    try {
      // Upload files if any
      const attachments: never[] = []
      
      // Get the chat document first to find the other participant
      const chatRef = doc(db, "chats", activeChatId)
      const chatSnap = await getDoc(chatRef)
      
      if (!chatSnap.exists()) {
        console.error("Chat not found")
        return
      }
      
      const chatData = chatSnap.data()
      const otherParticipantId = chatData.participantIds.find((id: string) => id !== user.uid)
      
      // Prepare unread counts update - only increment for the receiver
      const unreadCounts = chatData.unreadCounts || {};
      if (otherParticipantId) {
        unreadCounts[otherParticipantId] = (unreadCounts[otherParticipantId] || 0) + 1;
      }
      
      // Update the chat document
      await updateDoc(chatRef, {
        lastMessage: content || "Sent an attachment",
        lastMessageTime: serverTimestamp(),
        lastMessageUserId: user.uid,
        unreadCounts: unreadCounts
      })

      // Then add the message
      const messagesRef = collection(db, "chats", activeChatId, "messages")
      await addDoc(messagesRef, {
        content,
        userId: user.uid,
        timestamp: serverTimestamp(),
        attachments,
      })
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Function to create a new chat
  const createChat = async (otherUserId: string) => {
    if (!user?.uid || !otherUserId) return ""

    try {
      // Check if chat already exists
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

      // Get other user data
      const otherUserRef = doc(db, "users", otherUserId)
      const otherUserSnap = await getDoc(otherUserRef)

      if (!otherUserSnap.exists()) {
        throw new Error("User not found")
      }

      const otherUserData = otherUserSnap.data()

      // Create new chat with user-specific unread counters
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
        unreadCounts: unreadCounts  // Initialize unread counts per user
      })

      return newChatRef.id
    } catch (error) {
      console.error("Error creating chat:", error)
      return ""
    }
  }

  return { messages, chats, loading, sendMessage, createChat, markChatAsRead }
}