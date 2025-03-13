"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/navigation/Navbar';
import Sidebar from '@/app/components/navigation/Sidebar';
import Spinner from '@/app/components/spinners/Spinner';

interface Screenshot {
    id: number;
    image: string;
}

// Update the GameDetails interface
interface GameDetails {
    id: number;
    name: string;
    background_image: string;
    description_raw: string;
    released: string;
    rating: number;
    metacritic: number;
    genres: Array<{ name: string }>;
    platforms: Array<{ platform: { name: string } }>;
    screenshots: Screenshot[];
    developers: Array<{ name: string }>;
    publishers: Array<{ name: string }>;
    esrb_rating: { name: string };
    tags: Array<{ name: string }>;
    ratings: Array<{ title: string; percent: number }>;
    added_by_status: {
        playing: number;
        owned: number;
        beaten: number;
    };
}

export default function GamePage() {
    const params = useParams();
    const [game, setGame] = useState<GameDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;

    useEffect(() => {
        const fetchGameDetails = async () => {
            try {
                // Fetch game details
                const response = await fetch(
                    `https://api.rawg.io/api/games/${params.id}?key=${RAWG_API_KEY}`
                );
                const gameData = await response.json();

                // Fetch screenshots
                const screenshotsResponse = await fetch(
                    `https://api.rawg.io/api/games/${params.id}/screenshots?key=${RAWG_API_KEY}`
                );
                const screenshotsData = await screenshotsResponse.json();

                setGame({
                    ...gameData,
                    screenshots: screenshotsData.results
                });
                setActiveImage(gameData.background_image);
            } catch (error) {
                console.error('Error fetching game details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchGameDetails();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#111111] text-white">
                <Spinner />
            </div>
        );
    }

    if (!game) {
        return <div>Game not found</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-[#111111] text-white">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <div className="border-r border-white/5">
                    <Sidebar />
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="flex gap-6 max-w-[1600px] mx-auto">
                        {/* Main Content */}
                        <div className="flex-1 p-6">
                            {/* Main Image */}
                            <h1 className="text-5xl font-bold mb-4">{game.name}</h1>
                            <div className="flex items-center gap-4 mb-6">

                                <div className="flex items-center">
                                    {[...Array(5)].map((_, index) => (
                                        <svg
                                            key={index}
                                            className={`w-5 h-5 ${index < Math.round(game.rating)
                                                ? 'text-yellow-400'
                                                : 'text-gray-500'
                                                }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="ml-2 text-white/80 font-bold">{game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
                                </div>
                                <div className="flex gap-2">
                                    {game.genres?.slice(0, 3).map((genre) => (
                                        <span
                                            key={genre.name}
                                            className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-gray-300"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="relative aspect-video rounded-xl  overflow-hidden mb-8 w-full max-w-5xl">
                                <Image
                                    src={activeImage || game.background_image}
                                    alt={game.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Screenshots Gallery */}
                            <div className="flex gap-3 mb-10 overflow-x-auto pb-4 max-w-4xl">
                                <div
                                    className={`relative w-32 mt-1  aspect-video rounded-lg overflow-hidden cursor-pointer ${activeImage === game.background_image ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    onClick={() => setActiveImage(game.background_image)}
                                >
                                    <Image
                                        src={game.background_image}
                                        alt="main"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                {game.screenshots?.map((screenshot) => (
                                    <div
                                        key={screenshot.id}
                                        className={`relative w-36 mt-2 aspect-video rounded-lg overflow-hidden cursor-pointer ${activeImage === screenshot.image ? 'ring-1 ring-zinc-500' : ''
                                            }`}
                                        onClick={() => setActiveImage(screenshot.image)}
                                    >
                                        <Image
                                            src={screenshot.image}
                                            alt={`screenshot ${screenshot.id}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Game Info */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2">


                                    {/* Purchase Section */}


                                    <p className="text-gray-400 mb-8 leading-relaxed ">
                                        {game.description_raw
                                            ? `${game.description_raw.split(" ").slice(0, 60).join(" ")}...`
                                            : 'No description available'}
                                    </p>


                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-3">Release Date</h3>
                                            <p className="text-gray-400">{game.released}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold mb-3">Rating</h3>
                                            <p className="text-gray-400">{game.rating}/5</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold mb-3">Metacritic</h3>
                                            <p className="text-gray-400">{game.metacritic || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Panel - Fixed Width */}
                        <div className=" p-8 rounded-xl h-fit space-y-8 w-[35%] my-6 sticky top-6">

                            {/* Price and Buttons Section */}
                            <div className="space-y-4">
                                <p className="text-xl font-bold">${59.99}</p>
                                <p className="text-xl font-bold">Base Game</p>
                                <p className="text-sm text-gray-400">May include In-app purchases</p>
                                <div className="space-y-3">
                                    <button className="w-full bg-[#00A8E8] hover:bg-[#0096D1] text-white font-semibold py-4 rounded transition-colors">
                                        Get
                                    </button>
                                    <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 rounded transition-colors">
                                        Add To Cart
                                    </button>
                                    <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 rounded transition-colors">
                                        Add to Wishlist
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Developer</h3>
                                    <p className="font-semibold">{game.developers?.[0]?.name}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Publisher</h3>
                                    <p className="font-semibold">{game.publishers?.[0]?.name}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Release Date</h3>
                                    <p className="font-semibold">
                                        {new Date(game.released).toLocaleDateString('en-US', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Platform</h3>
                                    <div className="flex items-center">
                                        {game.platforms?.some(p => p.platform.name.includes('Windows')) && (
                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ESRB Rating if available */}
                            {game.esrb_rating && (
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-2">ESRB Rating</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1.5 bg-zinc-800 rounded text-xs">
                                            {game.esrb_rating.name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Genres */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Genres</h3>
                                <div className="flex flex-wrap gap-2">
                                    {game.genres?.map((genre) => (
                                        <span
                                            key={genre.name}
                                            className="px-4 py-1.5 bg-zinc-800 rounded-full text-sm"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Platforms */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Platforms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {game.platforms?.map((platform) => (
                                        <span
                                            key={platform.platform.name}
                                            className="px-4 py-1.5 bg-zinc-800 rounded-full text-sm"
                                        >
                                            {platform.platform.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Developers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Developers</h3>
                                <p className="text-gray-400">
                                    {game.developers?.map((dev) => dev.name).join(', ')}
                                </p>
                            </div>

                            {/* Publishers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Publishers</h3>
                                <p className="text-gray-400">
                                    {game.publishers?.map((pub) => pub.name).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}