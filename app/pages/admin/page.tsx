"use client"
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Image from 'next/image';

export default function AdminPanel() {
  const [gameData, setGameData] = useState({
    title: '',
    subtitle: '',
    new: false,
    bannerDescription: '',
    status: '',
    price: '',
  });
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [gamePreview, setGamePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'game' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'game') {
        setGameFile(file);
        setGamePreview(reader.result as string);
      } else {
        setBannerFile(file);
        setBannerPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'upload_preset'); // Update this with your preset name

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary Error:', errorData);
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameFile || !bannerFile) {
      setMessage('Please upload both images');
      return;
    }

    setLoading(true);
    try {
      // Upload images to Cloudinary
      const [gameImageUrl, bannerImageUrl] = await Promise.all([
        uploadToCloudinary(gameFile),
        uploadToCloudinary(bannerFile)
      ]);

      // Add to Firestore
      await addDoc(collection(db, "games"), {
        ...gameData,
        img: gameImageUrl,
        banner: bannerImageUrl,
        createdAt: new Date(),
      });
      
      // Reset form
      setGameData({
        title: '',
        subtitle: '',
        new: false,
        bannerDescription: '',
        status: '',
        price: '',
      });
      setGameFile(null);
      setBannerFile(null);
      setGamePreview(null);
      setBannerPreview(null);
      setMessage('Game added successfully!');
    } catch (error) {
      setMessage('Error adding game');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] p-8">
      <div className="max-w-2xl mx-auto bg-zinc-900 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Add New Game</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Game Title"
              value={gameData.title}
              onChange={(e) => setGameData({ ...gameData, title: e.target.value })}
              className="w-full p-3 rounded-lg bg-zinc-800 text-white"
              required
            />
            
            <input
              type="text"
              placeholder="Subtitle"
              value={gameData.subtitle}
              onChange={(e) => setGameData({ ...gameData, subtitle: e.target.value })}
              className="w-full p-3 rounded-lg bg-zinc-800 text-white"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={gameData.new}
                onChange={(e) => setGameData({ ...gameData, new: e.target.checked })}
                className="rounded bg-zinc-800"
              />
              <label className="text-white">New Release</label>
            </div>

            <textarea
              placeholder="Banner Description"
              value={gameData.bannerDescription}
              onChange={(e) => setGameData({ ...gameData, bannerDescription: e.target.value })}
              className="w-full p-3 rounded-lg bg-zinc-800 text-white min-h-[100px]"
              required
            />

            <input
              type="text"
              placeholder="Status (e.g., BEST SELLER)"
              value={gameData.status}
              onChange={(e) => setGameData({ ...gameData, status: e.target.value })}
              className="w-full p-3 rounded-lg bg-zinc-800 text-white"
            />

            <input
              type="text"
              placeholder="Price (e.g., $49.99)"
              value={gameData.price}
              onChange={(e) => setGameData({ ...gameData, price: e.target.value })}
              className="w-full p-3 rounded-lg bg-zinc-800 text-white"
              required
            />

            <div className="space-y-2">
              <label className="block text-white">Game Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'game')}
                className="text-white"
                required
              />
              {gamePreview && (
                <div className="relative w-32 h-32">
                  <Image
                    src={gamePreview}
                    alt="Game preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-white">Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'banner')}
                className="text-white"
                required
              />
              {bannerPreview && (
                <div className="relative w-full h-40">
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-500' : 'bg-green-500'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding Game...' : 'Add Game'}
          </button>
        </form>
      </div>
    </div>
  );
}