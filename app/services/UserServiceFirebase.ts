import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// User type definition
interface UserData {
    username: string
    email: string
    bio: string
    avatar: string
    joinDate: string
    postCount: number
    level?: number
}

/**
 * Creates a user in Firestore with optional default values.
 */
export async function createUserInFirestore(
  userId: string,
  username: string ,
  email: string = "unknown@example.com",
  avatar: string = "https://github.com/shadcn.png",
  bio: string = "No bio available",
  joinDate: string = serverTimestamp().toString(),
  postCount: number = 0,  
  level: number = 1 
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userData: UserData = {
      username,
      email,
      avatar,
      bio,
      joinDate,
      postCount,
      level,
    };

    await setDoc(userRef, userData);
    console.log("User created successfully!");
  } catch (error) {
    console.error("Error creating user:", error);
  }
}
