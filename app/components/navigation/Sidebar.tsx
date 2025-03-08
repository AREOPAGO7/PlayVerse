import Image from 'next/image'
import { MdWidgets } from "react-icons/md";
import { FaTag } from "react-icons/fa6";
const Sidebar = () => {


    return (
        <div className="w-[225px] bg-[#111111] hidden lg:block border-r border-[#2a2a2a]">
        <div className="h-full flex flex-col overflow-auto mt-4">
          <nav className="p-2">
            <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#303030] mb-1 bg-[#303030]">
            <FaTag className='mr-4 text-lg text-white/70'/>

              <span className="font-medium text-white/80">Store</span>
            </a>
            <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#303030] mb-1">
            <MdWidgets className='mr-4 text-lg text-white/70'/>

              <span className="font-medium text-white/80">Library</span>
            </a>
            <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#303030] mb-6">
              <div className="h-5 w-5 mr-3 flex items-center justify-center">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              </div>
              <span className="font-medium text-white/80">Messages</span>
            </a>

            <div className="mb-4">
              <h3 className="text-xs font-medium text-white/70 px-3 mb-2">FAVOURITS</h3>
              <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#303030]">
               <Image src='/games/fortnite.png' width={30} height={50} alt='' className='mr-4 rounded-sm'></Image>
                <span className="font-medium text-sm">Fortnite</span>
              </a>
            </div>
          </nav>

         
        </div>
      </div>
    )
}

export default Sidebar;