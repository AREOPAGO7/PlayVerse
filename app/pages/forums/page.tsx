"use client"
import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import TopicCard from "@/app/components/forum/TopicCard";
import { ForumTopic } from "@/app/types/forum";
import Navbar from "@/app/components/navigation/Navbar";
import Sidebar from "@/app/components/navigation/Sidebar";
import ForumDetail from '../../components/forum/ForumDetail';
import { useUser } from '../../contexts/UserContext';
import { doc, updateDoc, increment } from "firebase/firestore";
import { IoIosAttach } from "react-icons/io";
import Spinner from "../../components/spinners/Spinner";

export default function ForumsPage() {
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showNewTopicForm, setShowNewTopicForm] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState("");
    const [newTopicDescription, setNewTopicDescription] = useState("");
    const [selectedForumId, setSelectedForumId] = useState<string | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useUser();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedCategory1, setSelectedCategory1] = useState<string>('all');
    const [categories] = useState([
        { id: 'general', name: 'General Discussion' },
        { id: 'gaming', name: 'Gaming' },
        { id: 'tech', name: 'Technology' },
        { id: 'offtopic', name: 'Off Topic' }
    ]);

    useEffect(() => {
        fetchTopics();
    }, []);

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            alert('File size too large. Please select a file under 100MB.');
            return;
        }

        setMediaFile(file);
        const previewUrl = URL.createObjectURL(file);
        setMediaPreview(previewUrl);
    };

    const fetchTopics = async () => {
        try {
            setLoading(true);
            setError(null);
            const querySnapshot = await getDocs(collection(db, "forums"));
            const topicsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || '',
                    description: data.description || '',
                    category: data.category || 'general',
                    createdAt: data.createdAt || Timestamp.now(),
                    postCount: typeof data.postCount === 'number' ? data.postCount : 0,
                    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
                    userId: data.userId || '',
                    username: data.username || 'Anonymous',
                    userAvatar: data.userAvatar || '/default-avatar.png',
                    lastPost: data.lastPost || null,
                    mediaUrl: data.mediaUrl || '',
                    mediaType: data.mediaType || ''
                } as ForumTopic;
            });
            setTopics(topicsData);
        } catch (err) {
            console.error("Error fetching topics:", err);
            setError("Failed to load forums. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async () => {
        if (!user) {
            console.log('No user found');
            setError("Please login to create a topic");
            return;
        }

        if (!newTopicTitle.trim() || !newTopicDescription.trim()) {
            console.log('Missing title or description');
            setError("Please fill in all required fields");
            return;
        }

        try {
            setIsUploading(true);
            console.log('Starting topic creation...');
            let mediaUrl = '';
            let mediaType = '';
    
            if (mediaFile) {
                console.log('Uploading media...');
                const formData = new FormData();
                formData.append('file', mediaFile);
                formData.append('upload_preset', 'upload_preset');
    
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );
    
                if (!response.ok) {
                    console.error('Upload failed:', await response.text());
                    throw new Error('Failed to upload media');
                }
    
                const data = await response.json();
                console.log('Upload response:', data);
                mediaUrl = data.secure_url;
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
            }
    
            const newTopic = {
                title: newTopicTitle.trim(),
                description: newTopicDescription.trim(),
                postCount: 0,
                viewCount: 0,
                category: selectedCategory1 === 'all' ? 'general' : selectedCategory1,
                createdAt: Timestamp.now(),
                userId: user.uid,
                username: user.username || 'Anonymous',
                userAvatar: user.avatar || '/default-avatar.png',
                mediaUrl,
                mediaType,
            };
    
            console.log('Creating topic:', newTopic);
            await addDoc(collection(db, "forums"), newTopic);
            console.log('Topic created successfully');
            
            setNewTopicTitle("");
            setNewTopicDescription("");
            setMediaFile(null);
            setMediaPreview(null);
            setShowNewTopicForm(false);
            setError(null);
            await fetchTopics();
        } catch (err) {
            console.error("Error creating topic:", err);
            setError("Failed to create topic. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Add this near the top of your component with other state declarations
    const [isLoadingTopic, setIsLoadingTopic] = useState(false);
    
    // Update the handleTopicClick function
    const handleTopicClick = async (topicId: string) => {
        try {
            setIsLoadingTopic(true);
            const topicRef = doc(db, "forums", topicId);
            await updateDoc(topicRef, {
                viewCount: increment(1)
            });
    
            setTopics(prevTopics => 
                prevTopics.map(topic => 
                    topic.id === topicId 
                        ? { ...topic, viewCount: (topic.viewCount || 0) + 1 }
                        : topic
                )
            );
    
            setSelectedForumId(topicId);
        } catch (err) {
            console.error("Error updating view count:", err);
        } finally {
            setIsLoadingTopic(false);
        }
    };
    
    // Update the topics grid section
    <div className="grid gap-4 md:gap-6">
        {loading ? (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
            topics
                .filter(topic => selectedCategory === 'all' || topic.category === selectedCategory)
                .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
                .map(topic => (
                    <div 
                        key={topic.id} 
                        onClick={() => handleTopicClick(topic.id)}
                        className={`cursor-pointer transition-opacity ${isLoadingTopic ? 'opacity-50' : 'opacity-100'}`}
                    >
                        <TopicCard
                            topic={topic}
                            onClick={() => handleTopicClick(topic.id)}
                        />
                    </div>
                ))
        )}
    </div>
    
    {/* Update the create topic button */}
    // Remove the duplicate button section and update the header section
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Forums</h1>
        <div className="flex flex-wrap gap-2 md:gap-4">
            <button
                onClick={() => setShowNewTopicForm(true)}
                className="bg-zinc-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base"
                disabled={isUploading}
            >
                {isUploading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        <span>Creating...</span>
                    </div>
                ) : (
                    'New Topic'
                )}
            </button>
        </div>
    </div>

    return (
        <div className="font-medium bg-[#111111] min-h-screen">
            <div className="fixed top-0 w-full z-50">
                <Navbar />
            </div>
            <div className="flex flex-col md:flex-row">
                <div className="fixed left-0 h-screen hidden 2xl:block pt-[72.5px]">
                    <Sidebar />
                </div>
                <main className="flex-1 p-4 md:p-8 2xl:ml-64 pt-16 overflow-y-auto w-full">
                    <div className="max-w-[90%] mx-auto">
                        {/* Header with New Topic button */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 ">
                            <h1 className="text-2xl md:text-3xl font-bold text-white ">Forums</h1>
                            <div className="flex flex-wrap gap-2 md:gap-4">
                                <button
                                    onClick={() => setShowNewTopicForm(true)}
                                    className="bg-zinc-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base"
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                                            <span>Creating...</span>
                                        </div>
                                    ) : (
                                        'New Topic'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* New Topic Form */}
                        {showNewTopicForm && (
                            <div className="mb-8 border border-white/10 p-6 rounded-lg">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <h2 className="text-xl font-semibold text-white">Create New Topic</h2>
                                    <select
                                        value={selectedCategory1}
                                        onChange={(e) => setSelectedCategory1(e.target.value)}
                                        className="w-48 p-2 rounded-lg border bg-[#111] border-white/10 text-white text-sm"
                                    >
                                        <option value="general">General Discussion</option>
                                        <option value="gaming">Gaming</option>
                                        <option value="tech">Technology</option>
                                        <option value="offtopic">Off Topic</option>
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    value={newTopicTitle}
                                    onChange={(e) => setNewTopicTitle(e.target.value)}
                                    placeholder="Topic Title"
                                    className="w-full p-3 mb-4 rounded-lg border bg-[#111] border-white/10 text-white placeholder:text-zinc-400"
                                />
                                <textarea
                                    value={newTopicDescription}
                                    onChange={(e) => setNewTopicDescription(e.target.value)}
                                    placeholder="Topic Description"
                                    className="w-full p-3 mb-4 rounded-lg border bg-[#111] border-white/10 text-white placeholder:text-zinc-400 min-h-[100px]"
                                />
                                // Update the media preview section in the form
                                <div className="mb-4">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleMediaSelect}
                                        accept="image/*,video/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 border border-white/10 text-white rounded-lg hover:bg-zinc-600 transition-colors flex items-center gap-2"
                                    >
                                        <IoIosAttach className="text-2xl text-zinc-400"/>
                                        <span className="text-zinc-400">Attach Media</span>
                                    </button>
                                    {mediaPreview && (
                                        <div className="mt-4 relative w-full">
                                            <div className="relative aspect-video w-full max-w-2xl mx-auto bg-black/20 rounded-lg overflow-hidden">
                                                {mediaFile?.type.startsWith('video') ? (
                                                    <video 
                                                        src={mediaPreview} 
                                                        className="w-full h-full object-contain" 
                                                        controls 
                                                    />
                                                ) : (
                                                    <img 
                                                        src={mediaPreview} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-contain" 
                                                    />
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setMediaFile(null);
                                                        setMediaPreview(null);
                                                    }}
                                                    className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => setShowNewTopicForm(false)}
                                        className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateTopic}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        disabled={isUploading}
                                    >
                                        Create Topic
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Categories and Topics sections remain unchanged */}
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors whitespace-nowrap text-sm md:text-base ${
                                    selectedCategory === 'all'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                    }`}
                            >
                                All Topics
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors whitespace-nowrap text-sm md:text-base ${
                                        selectedCategory === cat.id
                                            ? 'bg-green-600 text-white'
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                       
                      
                        <div className="grid gap-4 md:gap-6">
                            {loading ? (
                              <div className="mx-auto mt-20">
                                <Spinner />
                              </div>
                              
                            ) : error ? (
                                <div className="text-red-500 text-center py-8">{error}</div>
                            ) : (
                                topics
                                    .filter(topic => selectedCategory === 'all' || topic.category === selectedCategory)
                                    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
                                    .map(topic => (
                                        <div 
                                            key={topic.id} 
                                            className={`cursor-pointer transition-opacity ${isLoadingTopic ? 'opacity-50' : 'opacity-100'}`}
                                        >
                                            <TopicCard
                                                topic={topic}
                                                onClick={() => handleTopicClick(topic.id)}
                                            />
                                        </div>
                                    ))
                            )}
                        </div>

                        {selectedForumId && (
                            <ForumDetail
                                forumId={selectedForumId}
                                onClose={() => setSelectedForumId(null)}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}