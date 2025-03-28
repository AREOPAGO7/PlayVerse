"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import Spinner from "@/app/components/spinners/Spinner"

export default function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as { [key: string]: string })

        if (!cookies.adminAuth || !cookies.adminEmail) {
          setLoading(false)
          router.replace("/pages/admin/login")
          return
        }

        const adminDocRef = doc(db, "admin", "admin")
        const adminDoc = await getDoc(adminDocRef)
        
        if (!adminDoc.exists() || adminDoc.data().email !== decodeURIComponent(cookies.adminEmail)) {
          document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
          document.cookie = "adminEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
          setLoading(false)
          router.replace("/pages/admin/login")
          return
        }

        setLoading(false)
      } catch (error) {
        console.error("Admin verification error:", error)
        setLoading(false)
        router.replace("/pages/admin/login")
      }
    }
    
    checkAdminAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
      <Spinner/>
      </div>
    )
  }

  return <>{children}</>
}