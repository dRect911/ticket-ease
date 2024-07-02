
import { getUserRole } from "@/utils/supabase/queries";
import { SupabaseClient } from "@supabase/supabase-js";

export async function hasRole(supabase: SupabaseClient, role: string): Promise<boolean> {
  try {
    const userRole = await getUserRole(supabase);
    return userRole === role;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}

export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  return hasRole(supabase, "admin");
}

export async function isDriver(supabase: SupabaseClient): Promise<boolean> {
  return hasRole(supabase, "driver");
}
