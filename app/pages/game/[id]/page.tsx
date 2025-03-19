"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/navigation/Navbar';
import Sidebar from '@/app/components/navigation/Sidebar';
import Spinner from '@/app/components/spinners/Spinner';
import { GameDetails } from '../../../types/games';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export default function GamePage() {
    const params = useParams();
    const [game, setGame] = useState<GameDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [price, setPrice] = useState<number | null>(null);
    const [discount, setDiscount] = useState<number | null>(null);

    // Calculate discounted price
    const discountedPrice = discount !== null && price !== null ? price * (1 - discount / 100) : null;

    useEffect(() => {
        const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY; // Move inside useEffect

        const fetchGameDetails = async () => {
            try {
                // Fetch game details from RAWG API
                const response = await fetch(
                    `https://api.rawg.io/api/games/${params.id}?key=${RAWG_API_KEY}`
                );
                const gameData = await response.json();

                // Fetch screenshots from RAWG API
                const screenshotsResponse = await fetch(
                    `https://api.rawg.io/api/games/${params.id}/screenshots?key=${RAWG_API_KEY}`
                );
                const screenshotsData = await screenshotsResponse.json();

                // Fetch price and discount from Firestore
                const gameDocRef = doc(db, 'games', params.id as string);
                const gameDocSnap = await getDoc(gameDocRef);

                if (gameDocSnap.exists()) {
                    const firestoreData = gameDocSnap.data();
                    setPrice(firestoreData.price);
                    setDiscount(firestoreData.discount);
                }

                setGame({
                    ...gameData,
                    screenshots: screenshotsData.results,
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
    }, [params.id]); // No need to add RAWG_API_KEY to the dependency array

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
        <div className="flex flex-col h-screen bg-[#111111] light:bg-zinc-100 text-white">
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
                            <h1 className="text-3xl font-bold mb-4 light:text-black/80">{game.name}</h1>
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
                                    <span className="ml-2 text-white/80 font-bold light:text-black/80">{game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
                                </div>
                                <div className="flex gap-2">
                                    {game.genres?.slice(0, 3).map((genre) => (
                                        <span
                                            key={genre.name}
                                            className="px-3 py-1 bg-zinc-800 light:bg-zinc-300 font-semibold rounded-full text-sm text-gray-300 light:text-black/80"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden mb-8 w-full max-w-3xl">
                                <Image
                                    src={activeImage || game.background_image}
                                    alt={game.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Screenshots Gallery */}
                            <div className="flex gap-3 mb-10 overflow-x-auto pb-4 max-w-2xl">
                                <div
                                    className={`relative w-32 mt-1 aspect-video rounded-lg overflow-hidden cursor-pointer ${activeImage === game.background_image ? '' : ''
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
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 light:text-black/80">
                                <div className="lg:col-span-2">
                                    <p className="text-gray-400 mb-8 leading-relaxed light:text-black/80">
                                        {game.description_raw
                                            ? `${game.description_raw.split(" ").slice(0, 60).join(" ")}...`
                                            : 'No description available'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-3">Release Date</h3>
                                            <p className="text-gray-400 light:text-black/80">{game.released}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold mb-3">Rating</h3>
                                            <p className="text-gray-400 light:text-black/80">{game.rating}/5</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold mb-3">Metacritic</h3>
                                            <p className="text-gray-400 light:text-black/80">{game.metacritic || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Panel - Fixed Width */}
                        <div className="p-8 rounded-xl h-fit space-y-8 w-[35%] my-6 sticky top-6">
                            {/* Price and Buttons Section */}
                            <div className="space-y-4">
                                {price !== null && (
                                    <div className='flex'>
                                        {discount !== 0 && (
                                            <span className="bg-green-500 text-white text-xs px-2 p-1 h-6 font-bold rounded-xl mt-[0.20rem] mr-2">
                                                -{discount}%
                                            </span>
                                        )}
                                        <p className="text-xl font-bold light:text-black/80">
                                            {discountedPrice !== null ? (
                                                <>
                                                    <span className="line-through text-gray-500 text-[18px]">${price}</span>{" "}
                                                    <span className="text-white light:text-black">${discountedPrice.toFixed(2)}</span>
                                                </>
                                            ) : (
                                                `$${price}`
                                            )}
                                        </p>
                                    </div>
                                )}
                                <p className="text-xl font-bold light:text-black/80">Base Game</p>
                                <p className="text-sm text-gray-400 light:text-black/80">May include In-app purchases</p>
                                <div className="space-y-3">
                                    <button className="w-full bg-green-500 hover:bg-[#0096D1] text-white font-semibold py-4 rounded transition-colors">
                                        Get
                                    </button>
                                    <button className="w-full bg-zinc-800 light:bg-zinc-300 light:text-black/80 hover:bg-zinc-700 text-white font-semibold py-4 rounded transition-colors">
                                        Add To Cart
                                    </button>
                                    <button className="w-full bg-zinc-800 light:bg-zinc-300 light:text-black/80 hover:bg-zinc-700 text-white font-semibold py-4 rounded transition-colors">
                                        Add to Wishlist
                                    </button>
                                </div>
                            </div>

                            {/* Developers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 light:text-black/80">Developers</h3>
                                <p className="text-gray-400 light:text-black/80">
                                    {game.developers?.map((dev) => dev.name).join(', ')}
                                </p>
                            </div>

                            {/* Publishers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 light:text-black/80">Publishers</h3>
                                <p className="text-gray-400 light:text-black/80">
                                    {game.publishers?.map((pub) => pub.name).join(', ')}
                                </p>
                            </div>

                            {/* Platforms */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 light:text-black/80">Platforms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {game.platforms?.map((platform) => (
                                        <span
                                            key={platform.platform.name}
                                            className="px-4 py-1.5 bg-zinc-800 light:bg-zinc-300 rounded-full text-sm light:text-black/80"
                                        >
                                            {platform.platform.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* ESRB Rating */}
                            {game.esrb_rating && (
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-2 light:text-black/80">ESRB Rating</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1.5 bg-zinc-800 light:bg-zinc-300 rounded text-xs light:text-black/80">
                                            {game.esrb_rating.name}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}