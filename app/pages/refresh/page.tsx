'use client';
import React, { useState } from 'react';
import { db } from '../../firebase/config'; // Adjust the import based on your Firebase setup
import { collection, doc, setDoc } from 'firebase/firestore';
import Navbar from '../admin/components/Navbar'; // Import your Navbar component
import Sidebar from '../admin/components/Sidebar'; // Import your Sidebar component
import  Image from 'next/image'; // Import your Image component

const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY; // Replace with your RAWG API key

const GameRefreshComponent = () => {
  const [loading, setLoading] = useState(false);
  const [newGames, setNewGames] = useState([]); // State to store fetched games
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch new releases from RAWG API
  const fetchNewReleasesFromRAWG = async () => {
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=2025-01-01,2025-12-31&ordering=-released`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map((game) => ({
        id: game.id, // RAWG game ID
        name: game.name, // Game name
        image: game.background_image, // Game cover art
      }));
    } catch (error) {
      console.error('Error fetching new releases from RAWG:', error);
      return [];
    }
  };

  // Toggle dark mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch game price and discount from CheapShark API
  const fetchGamePriceFromCheapShark = async (gameName) => {
    try {
      const response = await fetch(
        `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(gameName)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Use the first game in the response
      if (data.length > 0) {
        const firstGame = data[0];
        return {
          price: firstGame.cheapest, // The cheapest price available
          discount: firstGame.dealRating || 0, // Deal rating as a discount proxy
        };
      }

      return null; // No game found
    } catch (error) {
      console.error('Error fetching game price from CheapShark:', error);
      return null;
    }
  };

  // Fetch and display new games
  const fetchAndDisplayGames = async () => {
    setLoading(true);
    try {
      // Fetch new releases from RAWG
      const newReleases = await fetchNewReleasesFromRAWG();

      if (newReleases.length === 0) {
        alert('No new releases found or failed to fetch from RAWG.');
        return;
      }

      const gamesWithPrices = [];

      for (const game of newReleases) {
        // Fetch game price and discount from CheapShark
        const gamePrice = await fetchGamePriceFromCheapShark(game.name);

        if (gamePrice) {
          const gameData = {
            id: game.id,
            name: game.name,
            image: game.image, // Game cover art
            price: parseFloat(gamePrice.price) || 0, // Convert price to a number
            discount: parseFloat(gamePrice.discount) || 0, // Convert discount to a number
          };

          gamesWithPrices.push(gameData); // Add game to the list
        }
      }

      // Update state to display the fetched games
      setNewGames(gamesWithPrices);
      setShowRefreshButton(true); // Show the refresh button
    } catch (error) {
      console.error('Error fetching games:', error);
      alert('Failed to fetch games.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh games in Firestore
  const refreshDatabase = async () => {
    setLoading(true);
    try {
      // Store games in Firestore
      for (const game of newGames) {
        const gameRef = doc(collection(db, 'games'), game.id.toString()); // Use RAWG game ID as document ID
        await setDoc(gameRef, {
          ...game,
          price: parseFloat(game.price) || 0, // Ensure price is stored as a number
          discount: parseFloat(game.discount) || 0, // Ensure discount is stored as a number
        });
      }

      alert('Games database refreshed successfully!');
      setNewGames([]); // Clear the displayed games
      setShowRefreshButton(false); // Hide the refresh button
    } catch (error) {
      console.error('Error refreshing games:', error);
      alert('Failed to refresh games database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#111] text-white' : 'bg-zinc-100 text-black'}`}>
      {/* Navbar */}
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} toggleSidebar={toggleSidebar} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar darkMode={darkMode} sidebarOpen={sidebarOpen} />

        {/* Main Content */}
        <div
          className={`flex-1 p-8 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <h1 className="text-3xl font-bold mb-8">Game Refresh Dashboard</h1>

          {/* Fetch New Games Button */}
          <button
            onClick={fetchAndDisplayGames}
            disabled={loading}
            className={`${
              darkMode ? 'bg-zinc-600 hover:bg-zinc-700' : 'bg-zinc-500 hover:bg-zinc-600'
            } text-white px-6 py-2 rounded-lg transition duration-300`}
          >
            {loading ? 'Fetching Games...' : 'Fetch New Games'}
          </button>

          {/* Display the fetched games */}
          {newGames.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">New Games Fetched</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {newGames.map((game) => (
                  <div
                    key={game.id}
                    className={`${
                      darkMode ? 'bg-zinc-800' : 'bg-white'
                    } rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300`}
                  >
                    <Image
                      src={game.image}
                      alt={game.name}
                      className="w-full h-48 object-cover"
                      fill={true}
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                      <p className={darkMode ? 'text-zinc-300' : 'text-zinc-700'}>
                        Price: ${typeof game.price === 'number' ? game.price.toFixed(2) : 'N/A'}
                      </p>
                      <p className={darkMode ? 'text-zinc-300' : 'text-zinc-700'}>
                        Discount: {game.discount}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refresh Database Button */}
          {showRefreshButton && (
            <button
              onClick={refreshDatabase}
              disabled={loading}
              className={`mt-8 ${
                darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
              } text-white px-6 py-2 rounded-lg transition duration-300`}
            >
              {loading ? 'Refreshing Database...' : 'Refresh Database'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameRefreshComponent;