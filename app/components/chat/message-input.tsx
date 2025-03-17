"use client"

import { useState, useRef } from "react"

interface MessageInputProps {
  onSendMessage: (content: string, attachments: File[]) => void
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments)
      setMessage("")
      setAttachments([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  return (
    <div className="p-4 border-t border-zinc-800 light:border-zinc-400">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="bg-zinc-800 rounded-lg px-3 py-1 flex items-center gap-2 light:bg-zinc-200">
              <span className="text-sm truncate max-w-[150px]">{file.name}</span>
              <button
                onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                className="text-zinc-400 hover:text-white light:text-zinc-800 light:hover:text-zinc-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors light:hover:bg-zinc-200 light:text-zinc-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*"
            multiple
          />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-zinc-800 rounded-lg pl-4 -mb-3 pr-10 py-3 text-white focus:outline-none resize-none light:bg-zinc-200 light:text-zinc-800"
            rows={1}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() && attachments.length === 0}
          className={`p-3 rounded-full -mb-1 ${
            !message.trim() && attachments.length === 0
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed light:bg-zinc-200 light:text-zinc-800"
              : "bg-green-600 text-white hover:bg-green-500 light:bg-green-600 light:text-white light:hover:bg-green-500"
          } transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  )
}
