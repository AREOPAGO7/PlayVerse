import { ForumTopic } from "@/app/types/forum";
import Image from 'next/image';
import { formatDistanceToNow } from "date-fns";
import { FaReply } from "react-icons/fa";

const formatCount = (count: number) => {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(0)}M`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
};

export default function TopicCard({ topic, onClick }: { topic: ForumTopic; onClick: (id: string) => void }) {
    return (
        <div 
            onClick={() => onClick(topic.id)}
            className="bg-zinc-800/50 rounded-lg p-4 md:p-6 hover:bg-zinc-800 transition-colors cursor-pointer light:bg-light light:hover:bg-zinc-200
            light:border light:border-black/10"
        >
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                {topic.mediaUrl && (
                    <div className="lg:w-1/3 h-full">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                            {topic.mediaType === 'video' ? (
                                <video 
                                    src={topic.mediaUrl} 
                                    className="w-full h-full object-cover" 
                                    controls
                                />
                            ) : topic.mediaType === 'image' && (
                                <Image
                                    src={topic.mediaUrl} 
                                    alt={topic.title}
                                    className="w-full h-full object-cover"
                                    width={400}
                                    height={400}
                                />
                            )}
                        </div>
                    </div>
                )}
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={topic.userAvatar} alt={topic.username} className="w-full h-full object-cover" width={100} height={100} />
                        </div>
                        <span className="text-zinc-400 truncate light:text-black/80">{topic.username}</span>
                        <span className="text-zinc-500 text-[12px] ml-auto flex-shrink-0 light:text-black/80">
                            {formatDistanceToNow(new Date(topic.createdAt.seconds * 1000), { addSuffix: true })}
                        </span>
                    </div>
                    
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 light:text-black/80">{topic.title}</h3>
                        <p className="text-zinc-400 text-base leading-relaxed line-clamp-3 light:text-black/80">{topic.description}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            {topic.lastPost && (
                                <div className="text-sm text-zinc-500 flex items-center gap-2 truncate">
                                    <span className="truncate">Last reply by {topic.lastPost.username}</span>
                                    <span className="flex-shrink-0">•</span>
                                    <span className="flex-shrink-0">{formatDistanceToNow(new Date(topic.lastPost.timestamp.seconds * 1000), { addSuffix: true })}</span>
                                    <FaReply className="flex-shrink-0 ml-2"/>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-400 flex-shrink-0">
                            <div className="flex items-center gap-2 light:text-black/80">
                                <svg className="w-5 h-5 text-zinc-400 light:text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{formatCount(topic.viewCount)}</span>
                            </div>
                            <div className="flex items-center gap-2 light:text-black/80">
                                <svg className="w-5 h-5 text-zinc-400 light:text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{formatCount(topic.postCount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}