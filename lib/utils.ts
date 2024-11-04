import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

// now deprecated
// see @/utils/index.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// see @/utils/supabase/client.ts
export async function getUserData(){
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata; // Directly return user_metadata
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Handle the error here (e.g., return null or throw a new error)
    return null; // Example: return null on error
  }
}