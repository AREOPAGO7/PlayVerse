import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"

export class AdminAuthService {
  static async login(email: string, password: string) {
    try {
      const adminDocRef = doc(db, "admin", "admin")
      const adminDoc = await getDoc(adminDocRef)
      
      if (!adminDoc.exists()) {
        throw new Error("Admin configuration not found")
      }

      const adminData = adminDoc.data()
      if (adminData.email !== email || adminData.password !== password) {
        throw new Error("Invalid credentials")
      }
      
      // Store admin session
      localStorage.setItem("adminAuth", "true")
      localStorage.setItem("adminEmail", email)
      
      return true
    } catch (error) {
      localStorage.removeItem("adminAuth")
      localStorage.removeItem("adminEmail")
      throw error
    }
  }

  static logout() {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminEmail")
  }

  static isAdminAuthenticated() {
    return localStorage.getItem("adminAuth") === "true"
  }

  static getAdminEmail() {
    return localStorage.getItem("adminEmail")
  }
}