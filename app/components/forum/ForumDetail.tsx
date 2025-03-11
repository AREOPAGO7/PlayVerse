"use client"
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useUser } from '@/app/contexts/UserContext';
import Image from 'next/image';

interface Post {
  id: string;
  content: string;
  userId: string;
  createdAt: any;
  username: string;
  userAvatar: string;
  replyTo?: {
    postId: string;
    username: string;
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

  useEffect(() => {
    fetchPosts();
  }, [forumId]);

  const fetchPosts = async () => {
    try {
      // Simple query without orderBy
      const q = query(
        collection(db, "posts"), 
        where("forumId", "==", forumId)
      );
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      // Sort posts by creation date in ascending order
      const sortedPosts = postsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateA - dateB;
      });
      
      setPosts(sortedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.trim()) return;

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
            username: replyingTo.username
          }
        })
      };

      // Add the new post
      await addDoc(collection(db, "posts"), post);

      // Update the forum's post count
      const forumRef = doc(db, "forums", forumId);
      await updateDoc(forumRef, {
        postCount: increment(1),
        lastPost: {
          userId: user.uid,
          username: user.username || 'Anonymous',
          timestamp: Timestamp.now(),
          content: newPost.substring(0, 100)
        }
      });

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
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Forum Discussion</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={post.userAvatar}
                  alt={post.username}
                  width={40}
                  height={40}
                  className="rounded-full"
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
              className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replyingTo ? 'Post Reply' : 'Post'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}