
import { getUser, getProfileById } from "@/utils/supabase/queries";
// import { SupabaseClient } from "@supabase/supabase-js";

export async function hasRole(role: string): Promise<boolean> {
  try {
    const userId = (await getUser())?.id; 
    const userRole = (await getProfileById(userId as string))?.role

    return userRole === role;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

export async function isDriver(): Promise<boolean> {
  return hasRole("driver");
}
