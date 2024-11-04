"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { isAdmin, isCustomer, isDriver } from "@/utils/roleCheck";

export function useRoleProtection(requiredRole: "admin" | "driver" | "user") {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      let authorized = false;
      if (requiredRole === "admin") {
        authorized = await isAdmin();
      } else if (requiredRole === "driver") {
        authorized = await isDriver();
      }else if (requiredRole === "user") {
        authorized = await isCustomer();
      }
      setIsAuthorized(authorized);
      if (!authorized) {
        setTimeout(() => {
            router.push("/");
          }, 5000);
      }
    };

    checkRole();
  }, [requiredRole, router]);

  return isAuthorized;
}
