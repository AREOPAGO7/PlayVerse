import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// User type definition
interface UserData {
  uid: string
  email: string
  username: string
  avatar: string
  banner: string
  joinDate: string
  status : string
  bio: string
  location: string
  country: string
  level: number
  xp: number
  totalPlaytime: number
  favoriteGame: string
  friendCount: number
  rank: string
}

/**
 * Creates a user in Firestore with optional default values.
 */
export async function createUserInFirestore(
  userId: string,
  username: string = "Anonymous",
  email: string = "unknown@example.com",
  avatar: string = "https://github.com/shadcn.png",
  bio: string = "No bio available"
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);

    const userData: UserData = {
      username,
      email,
      avatar,
      bio,
      joinDate: new Date().toLocaleDateString(),
      status: "offline",
      banner: "",
      location: "",
      country: "",
      level: 0,
      xp: 0,
      totalPlaytime: 0,
      favoriteGame: "",
      friendCount: 0,
      rank: "Rookie",
      uid: userId

    };

    await setDoc(userRef, userData);
    console.log("User created successfully!");
  } catch (error) {
    console.error("Error creating user:", error);
  }
}
