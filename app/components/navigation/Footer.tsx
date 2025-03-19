import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400 py-4 border-t border-white/5 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Logo and Copyright */}
          <div>
            <p className="text-sm">© {new Date().getFullYear()} PlayVerse</p>
          </div>

          {/* Essential Links */}
          <div className="flex space-x-4">
            <Link href="#" className="text-sm hover:text-white transition-colors">
              About
            </Link>
            <Link href="#" className="text-sm hover:text-white transition-colors">
              Games
            </Link>
            <Link href="#" className="text-sm hover:text-white transition-colors">
              Support
            </Link>
            <Link href="#" className="text-sm hover:text-white transition-colors">
              Privacy
            </Link>
          </div>

          {/* Minimal Social Icons */}
          <div className="flex space-x-3">
            <Link href="#" className="hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Instagram className="w-4 h-4" />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;