"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { isAdmin, isDriver } from "@/utils/roleCheck";

export function useRoleProtection(supabase: SupabaseClient, requiredRole: "admin" | "driver") {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      let authorized = false;
      if (requiredRole === "admin") {
        authorized = await isAdmin(supabase);
      } else if (requiredRole === "driver") {
        authorized = await isDriver(supabase);
      }
      setIsAuthorized(authorized);
      if (!authorized) {
        setTimeout(() => {
            router.push("/");
          }, 5000);
      }
    };

    checkRole();
  }, [supabase, requiredRole, router]);

  return isAuthorized;
}
