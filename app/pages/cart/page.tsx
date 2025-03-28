'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navigation/Navbar';
import Sidebar from '../../components/navigation/Sidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const removeItem = (itemId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <Navbar />
      <div className="flex h-[900px]">
        <Sidebar />
        <div className="flex-1  p-8">
          <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={45}
                    className="rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-green-500">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/pages/payment/${item.id}`)}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;