'use client'; // Explicitly mark this component as a client-side component

import Image from 'next/image';
import { MdWidgets } from 'react-icons/md';
import { FaTag } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Correct hook for Next.js 13 App Directory

const Sidebar = () => {
  const pathname = usePathname(); // Get the current pathname

  return (
    <div className="w-[325px]  h-full bg-[#111111] hidden lg:block border-r border-white/5 ">
      <div className=" flex flex-col mt-2">
        <nav className="p-2">
          {/* Store link */}
          <Link
            href="/"
            className={`flex items-center p-3 rounded-md mb-1 ${pathname === '/' ? 'bg-[#303030]' : 'hover:bg-[#303030]'}`}
          >
            <FaTag className="mr-4 text-lg text-white/70" />
            <span className="font-medium text-white/80">Store</span>
          </Link>

          {/* Library link */}
          <Link
            href="/pages/library"
            className={`flex items-center p-3 rounded-md mb-1 ${pathname === '/library' ? 'bg-[#303030]' : 'hover:bg-[#303030]'}`}
          >
            <MdWidgets className="mr-4 text-lg text-white/70" />
            <span className="font-medium text-white/80">Library</span>
          </Link>

          {/* Messages link */}
          <Link href="/pages/chat" className="flex items-center p-3 rounded-md hover:bg-[#303030] mb-6">
            <div className="h-5 w-5 mr-3 flex items-center justify-center">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            </div>
            <span className="font-medium text-white/80">Messages</span>
          </Link>

          {/* Favourites section */}
          <div className="mb-4">
            <h3 className="text-xs font-medium text-white/70 px-3 mb-2">FAVOURITES</h3>
            <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#303030]">
              <Image src="/games/fortnite.png" width={30} height={50} alt="" className="mr-4 rounded-sm" />
              <span className="font-medium text-sm">Fortnite</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
