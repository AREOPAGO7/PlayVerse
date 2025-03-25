"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../contexts/UserContext";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Check, Percent } from "lucide-react";
import { Poppins } from 'next/font/google';


const poppins = Poppins({
  subsets: ['latin'],
  weight: '600',
});


interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

interface GameDetails {
  id: number;
  name: string;
  price: number;
  image: string;
}

const PaymentPage = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser(); // Destructure user and loading from useUser
  const params = useParams();
  
  // Convert the id parameter to a number
  const [gameId, setGameId] = useState<number | null>(null);
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fidelityPoints, setFidelityPoints] = useState<number | null>(null); // State to store fidelity points
  const [isCouponApplied, setIsCouponApplied] = useState(false); // State to track if the coupon is applied
  
  // Card details state
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: ""
  });

  // RAWG API Key
  const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;

  // Initialize gameId from URL params on component mount
  useEffect(() => {
    if (params.id) {
      const parsedId = parseInt(params.id as string, 10);
      if (!isNaN(parsedId)) {
        setGameId(parsedId);
      } else {
        setError("Invalid game ID");
        setLoading(false);
      }
    } else {
      setError("Game ID is missing");
      setLoading(false);
    }
  }, [params.id]);

  // Fetch game details when gameId is available
  useEffect(() => {
    if (gameId !== null) {
      fetchGameDetails(gameId);
    }
  }, [gameId]);

  // Fetch user's fidelity points when user is available
  useEffect(() => {
    if (user?.uid) {
      fetchFidelityPoints(user.uid);
    }
  }, [user]);

  const fetchFidelityPoints = async (userId: string) => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFidelityPoints(userData.fidelityPoints || 0); // Set fidelity points
      } else {
        setError("User data not found");
      }
    } catch (error) {
      console.error("Error fetching fidelity points:", error);
      setError("Failed to load user data");
    }
  };

  const fetchGameDetails = useCallback(async (id: number) => {
    try {
      if (!RAWG_API_KEY) {
        throw new Error("API key is missing");
      }
      
      // Fetch game details from RAWG API
      const response = await axios.get(
        `https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`
      );
      
      // For a real app, you would fetch the price from your own API/database
      // RAWG doesn't provide pricing information
      const gameData = {
        id: response.data.id,
        name: response.data.name,
        price: 59.99, // Example price - in a real app this would come from your database
        image: response.data.background_image || "/placeholder.svg"
      };
      
      setGameDetails(gameData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching game details:", error);
      setError("Failed to load game details");
      setLoading(false);
    }
  }, [RAWG_API_KEY, setGameDetails, setLoading, setError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces every 4 digits
    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
      
      setCardDetails({
        ...cardDetails,
        [name]: formattedValue
      });
      return;
    }
    
    // Format expiry date as MM/YY
    if (name === "expiryDate") {
      const cleanValue = value.replace(/\D/g, "");
      let formattedValue = cleanValue;
      
      if (cleanValue.length > 2) {
        formattedValue = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
      }
      
      setCardDetails({
        ...cardDetails,
        [name]: formattedValue
      });
      return;
    }
    
    // CVV - limit to 3 or 4 digits
    if (name === "cvv") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 4);
      setCardDetails({
        ...cardDetails,
        [name]: cleanValue
      });
      return;
    }
    
    // Regular input handling
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };

  const validateCardDetails = (): boolean => {
    // Card number validation (Luhn algorithm)
    const cardNumber = cardDetails.cardNumber.replace(/\s/g, "");
    if (cardNumber.length < 15 || cardNumber.length > 16) {
      setError("Invalid card number length");
      return false;
    }
    
    // Check if card number contains only digits
    if (!/^\d+$/.test(cardNumber)) {
      setError("Card number must contain only digits");
      return false;
    }
    
    // Simple Luhn algorithm implementation for card validation
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    if (sum % 10 !== 0) {
      setError("Invalid card number");
      return false;
    }
    
    // Card holder validation
    if (cardDetails.cardHolder.trim().length < 3) {
      setError("Please enter a valid cardholder name");
      return false;
    }
    
    // Expiry date validation
    const expiryParts = cardDetails.expiryDate.split("/");
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      setError("Invalid expiry date format (MM/YY)");
      return false;
    }
    
    const month = parseInt(expiryParts[0]);
    if (month < 1 || month > 12) {
      setError("Invalid month in expiry date");
      return false;
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits of current year
    const currentMonth = currentDate.getMonth() + 1; // January is 0
    
    const year = parseInt(expiryParts[1]);
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setError("Card has expired");
      return false;
    }
    
    // CVV validation
    if (cardDetails.cvv.length < 3) {
      setError("Invalid CVV");
      return false;
    }
    
    return true;
  };

  const handleApplyCoupon = () => {
    if (fidelityPoints !== null && fidelityPoints >= 600 && gameDetails?.price <= 69.99) {
      setIsCouponApplied(true);
      setError(null); // Clear any previous errors
    } else {
      setError("You do not have enough fidelity points or the game price exceeds $69.99");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Check if the game and user are loaded
    if (!gameDetails || !user?.uid) { // Check user.uid directly
      setError("Missing game or user information");
      return;
    }
    
    // Validate card details
    if (!validateCardDetails()) {
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      // Simulate a payment process (remove in production)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get Firestore instance
      const db = getFirestore();
      
      // Reference to the user document
      const userDocRef = doc(db, "users", user.uid); // Use user.uid directly
      
      // Check if user already owns the game
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().ownedGames?.includes(gameId)) {
        setError("You already own this game");
        setProcessingPayment(false);
        return;
      }
      
      // Update the user document to add the game to ownedGames
      await updateDoc(userDocRef, {
        ownedGames: arrayUnion(gameId),
        fidelityPoints: isCouponApplied ? increment(-600) : increment(0) // Deduct 600 points if coupon is applied
      });
      
      // Set success and redirect after a delay
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } catch (error) {
      console.error("Payment processing error:", error);
      setError("Failed to process payment. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="font-medium bg-[#111111] light:bg-light min-h-screen flex flex-col items-center justify-center text-white light:text-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        <p className="mt-4">Loading payment details...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="font-medium bg-[#111111] light:bg-light min-h-screen flex flex-col items-center justify-center text-white light:text-black p-6">
        <div className="bg-green-500 rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-center mb-4">
          {isCouponApplied
            ? "You've used 600 fidelity points to purchase this game."
            : "Your purchase was successful."}
        </p>
        <p className="text-gray-400 light:text-gray-600">Redirecting to store...</p>
      </div>
    );
  }

  return (
    <div className="font-medium bg-[#111111] light:bg-light min-h-screen flex flex-col items-center justify-center text-white light:text-black p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={`text-2xl font-bold ${poppins.className}`}>Complete Your Purchase</h1>
          <p className="text-gray-400 light:text-gray-600 mt-2">
            Secure payment processing
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 light:bg-red-200 border border-red-800 light:border-red-300 text-white light:text-red-800 p-3 mb-6 rounded-md">
            {error}
          </div>
        )}

        {gameDetails && (
          <div className="bg-zinc-800 light:bg-zinc-200 rounded-lg p-4 mb-6 flex items-center shadow-lg">
            <div className="w-16 h-20 relative rounded overflow-hidden flex-shrink-0">
              <Image
                src={gameDetails.image}
                alt={gameDetails.name}
               fill={true}
                className=" object-cover"
                priority
              />
            </div>
            <div className="ml-4 flex">
              <div>
              <h2 className={`font-medium ${poppins.className}`}>{gameDetails.name}</h2>
              <p className="text-xl font-bold mt-1">
                {isCouponApplied ? "$0.00" : `$${gameDetails.price.toFixed(2)}`}
              </p>
              </div>
              {isCouponApplied && (
                <div className="mt-2 p-3 flex  border border-white/40 rounded-md ml-6">
                  <Check className="w-4 h-4 mt-[2px] mr-2" /> 
                  <p className={` text-[13px]  ${poppins.className}`}> cupon applied!</p>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${poppins.className}`}>Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={cardDetails.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-3 bg-zinc-800 light:bg-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              maxLength={19}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${poppins.className}`}>Cardholder Name</label>
            <input
              type="text"
              name="cardHolder"
              value={cardDetails.cardHolder}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-zinc-800 light:bg-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${poppins.className}`}>Expiry Date</label>
              <input
                type="text"
                name="expiryDate"
                value={cardDetails.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className="w-full px-4 py-3 bg-zinc-800 light:bg-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                maxLength={5}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${poppins.className}`}>CVV</label>
              <input
                type="text"
                name="cvv"
                value={cardDetails.cvv}
                onChange={handleInputChange}
                placeholder="123"
                className="w-full px-4 py-3 bg-zinc-800 light:bg-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                maxLength={4}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={processingPayment || !gameDetails || !user?.uid}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${poppins.className} ${
                processingPayment || !gameDetails || !user?.uid
                  ? "bg-green-700 cursor-not-allowed opacity-70"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {processingPayment ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay ${isCouponApplied ? "$0.00" : `$${gameDetails?.price.toFixed(2) || "0.00"}`}`
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 light:text-gray-600 mt-4">
            <p className={`${poppins.className} text-[12px]`}>Your payment information is secure and encrypted</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className={`text-green-500 hover:text-green-400 mt-2 ${poppins.className} `}
            >
              Cancel and return to store
            </button>
          </div>
        </form>

        {/* Fidelity Coupon Button */}
        {fidelityPoints !== null && fidelityPoints >= 600 && gameDetails?.price <= 69.99 && (
            <div className="mt-4 w-full max-w-md mx-auto px-2">
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isCouponApplied}
              className={`
                w-full 
                relative 
                border-2
                border-white/80
                rounded-xl 
                overflow-hidden 
                transition-all 
                duration-300 
                ease-out
                bg-
                shadow-[0_0_20px_rgba(255,255,255,0.1)]
                hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]
                backdrop-blur-sm
                ${isCouponApplied ? "opacity-75 cursor-not-allowed border-white/50" : "hover:border-white"}
              `}
            >
              {/* Dotted Line Separator */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px border-l-2 border-dashed border-white/70 transform -translate-x-1/2 z-10"></div>
      
              {/* Circle cutouts */}
              <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-black border border-white/30 transform -translate-x-1/2"></div>
              <div className="absolute -bottom-1.5 left-1/2 w-3 h-3 rounded-full bg-black border border-white/30 transform -translate-x-1/2"></div>
      
              {/* Coupon Content */}
              <div className="flex items-center relative z-20">
                {/* Discount Symbol Container */}
                <div className="w-1/4 flex items-center justify-center p-4">
                  <div
                    className={`
                    bg- 
                    border-2
                    border-white/80
                    text-white
                    w-12 
                    h-12 
                    rounded-full 
                    flex 
                    items-center 
                    justify-center
                    shadow-[0_0_15px_rgba(255,255,255,0.1)]
                    transition-all
                    duration-300
                  `}
                  >
                    {isCouponApplied ? <Check className="w-6 h-6" /> : <Percent className="w-6 h-6" />}
                  </div>
                </div>
      
                {/* Button Text */}
                <div className="flex-grow text-left py-4 pl-2 pr-4">
                  <div className={`font-bold  text-base text-white ${poppins.className}`}>
                    {isCouponApplied ? "Discount Applied" : "Gaming Discount"}
                  </div>
                  <div className={`text-sm font-normal text-white/80 ${poppins.className}`}>
                    {isCouponApplied ? "100% off your purchase" : "Save 100% on your order"}
                  </div>
                  <div className={`text-xs mt-0.5 text-green-500 ${poppins.className}`}>
                    {isCouponApplied ? "Savings activated" : "600 points required"}
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;