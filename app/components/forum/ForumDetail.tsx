"use client"
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useUser } from '@/app/contexts/UserContext';
import Image from 'next/image';
import { Spinner } from '../../components/spinners/Spinner';
import { createForumNotification } from '@/app/utils/forumNotifications';

interface Forum {
  id: string;
  title: string;
  description: string;
  userId: string;
  username: string;
  userAvatar: string;
  postCount: number;
  viewCount: number;
  createdAt: Timestamp;
  lastPost?: {
    userId: string;
    username: string;
    timestamp: Timestamp;
    content: string;
  };
}

interface Post {
  id: string;
  content: string;
  userId: string;
  createdAt: Timestamp;
  username: string;
  userAvatar: string;
  replyTo?: {
    postId: string;
    username: string;
    userId: string;
  };
}

interface ForumDetailProps {
  forumId: string;
  onClose: () => void;
}

export default function ForumDetail({ forumId, onClose }: ForumDetailProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [replyingTo, setReplyingTo] = useState<Post | null>(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [forumExists, setForumExists] = useState(true);
  const [forumData, setForumData] = useState<Forum | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    // Don't fetch posts if forum doesn't exist
    if (!forumExists) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, "posts"), 
        where("forumId", "==", forumId)
      );
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      const sortedPosts = postsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateA - dateB;
      });
      
      setPosts(sortedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load forum posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [forumId, forumExists]);

  useEffect(() => {
    const checkForumExists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if forum exists
        const forumRef = doc(db, "forums", forumId);
        const forumSnapshot = await getDoc(forumRef);
        
        if (!forumSnapshot.exists()) {
          setForumExists(false);
          setError("Forum not found. It may have been deleted or you have an invalid link.");
          return;
        }
        
        // Forum exists, store its data
        const data = forumSnapshot.data();
        if (data) {
          setForumData({
            id: forumId,
            title: data.title || '',
            description: data.description || '',
            userId: data.userId || '',
            username: data.username || 'Anonymous',
            userAvatar: data.userAvatar || '/default-avatar.png',
            postCount: data.postCount || 0,
            viewCount: data.viewCount || 0,
            createdAt: data.createdAt || Timestamp.now(),
            lastPost: data.lastPost || null
          });
        }
        setForumExists(true);
        
        // Now fetch the posts
        fetchPosts();
      } catch (error) {
        console.error("Error checking forum:", error);
        setError("An error occurred while loading the forum. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    checkForumExists();
  }, [forumId, fetchPosts]);

  const handleCreatePost = async () => {
    if (!user || !newPost.trim() || !forumExists) return;
    
    // Clear any previous errors
    setError(null);

    try {
      const post = {
        content: newPost,
        userId: user.uid,
        username: user.username || 'Anonymous',
        userAvatar: user.avatar || '/default-avatar.png',
        forumId,
        createdAt: Timestamp.now(),
        ...(replyingTo && {
          replyTo: {
            postId: replyingTo.id,
            username: replyingTo.username,
            userId: replyingTo.userId
          }
        })
      };

      // Add the new post
      await addDoc(collection(db, "posts"), post);

      // Update the forum's post count
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);
      const forumData = forumDoc.data();
      
      await updateDoc(forumRef, {
        postCount: increment(1),
        lastPost: {
          userId: user.uid,
          username: user.username || 'Anonymous',
          timestamp: Timestamp.now(),
          content: newPost.substring(0, 100)
        }
      });

      // Create notification for forum reply
      if (replyingTo && replyingTo.userId !== user.uid) {
        await createForumNotification({
          type: 'forum_reply',
          message: `${user.username || 'Anonymous'} replied to your comment: "${newPost.substring(0, 50)}${newPost.length > 50 ? '...' : ''}"`,
          userId: replyingTo.userId,
          senderId: user.uid,
          senderName: user.username || 'Anonymous',
          forumId,
          forumTitle: forumData?.title
        });
      } else if (!replyingTo && forumData?.userId !== user.uid) {
        // Create notification for new forum comment
        await createForumNotification({
          type: 'forum_comment',
          message: `${user.username || 'Anonymous'} commented on the forum: "${newPost.substring(0, 50)}${newPost.length > 50 ? '...' : ''}"`,
          userId: forumData?.userId,
          senderId: user.uid,
          senderName: user.username || 'Anonymous',
          forumId,
          forumTitle: forumData?.title
        });
      }

      setNewPost('');
      setReplyingTo(null);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
      
          <>
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{forumData?.title || 'Forum Discussion'}</h2>
              <button onClick={onClose} className="text-zinc-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {loading ? (
              <div className='mx-auto p-8'><Spinner /></div>
            ) : error ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-zinc-800/50 rounded-lg p-6 max-w-md">
                  <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-xl font-medium text-white mb-2">Error</h3>
                  <p className="text-zinc-300 mb-4">{error}</p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={post.userAvatar}
                      alt={post.username}
                      width={40}
                      height={40}
                      className="rounded-full w-10 h-10"
                    />
                    <div>
                      <div className="font-medium text-white">{post.username}</div>
                      <div className="text-sm text-zinc-400">
                        {new Date(post.createdAt.seconds * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {post.replyTo && (
                    <div className="mb-2 pl-4 border-l-2 border-zinc-700">
                      <span className="text-sm text-zinc-400">
                        Replying to @{post.replyTo.username}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-zinc-300">{post.content}</p>
                  
                  {user && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => setReplyingTo(post)}
                        className="text-sm text-zinc-400 hover:text-white flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}
            {user && (
              <div className="p-4 border-t border-zinc-800">
                {replyingTo && (
                  <div className="mb-3 flex items-center justify-between bg-zinc-800/50 p-2 rounded">
                    <span className="text-sm text-zinc-400">
                      Replying to @{replyingTo.username}
                    </span>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {replyingTo ? 'Post Reply' : 'Post'}
                  </button>
                </div>
              </div>
            )}
          </>
        
      </div>
    </div>
  );
}