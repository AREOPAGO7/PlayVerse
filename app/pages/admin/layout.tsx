"use client"
import AdminAuthWrapper from "./components/AdminAuthWrapper"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthWrapper>{children}</AdminAuthWrapper>
}