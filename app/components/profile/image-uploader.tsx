"use client"
import type React from "react"
import { useState } from "react"
import Image from "next/image"

interface ImageUploaderProps {
  onUpload: (url: string) => void
  currentImage?: string
  type: string
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, currentImage, type }) => {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    // Create form data for upload
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "upload_preset")

    try {
      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formData },
      )

      const data = await response.json()
      onUpload(data.secure_url)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative group">
      <div
        className={`${type === "avatar" ? "rounded-full" : "rounded-lg"} overflow-hidden ${type === "avatar" ? "h-28 w-28" : "h-48"} mb-2 border-2 border-zinc-800`}
      >
        {currentImage ? (
          <Image 
            src={currentImage || "/placeholder.svg"} 
            alt={`User ${type}`} 
            className="w-full h-full object-cover"
            width={type === "avatar" ? 112 : 192} // 28*4 for avatar, 48*4 for banner
            height={type === "avatar" ? 112 : 192}
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-zinc-800">
            <p className="text-zinc-400">No {type} uploaded</p>
          </div>
        )}
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${type === "avatar" ? "rounded-full" : "rounded-lg"}`}>
          <label className="cursor-pointer flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
              />
            </svg>
            <span className="text-white text-xs">Upload {type}</span>
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
          </label>
        </div>
      </div>
      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="h-2 w-24 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader

