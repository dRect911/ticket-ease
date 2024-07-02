"use client";

import { useRoleProtection } from "@/hooks/useRoleProtection";
import { supabase } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";

export default function AdminDashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const isAuthorized = useRoleProtection(supabase, "admin");
  const pathname = usePathname();

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }


  if (!isAuthorized) {
    // further use toaster
    return <div>
      <p>Not Authorized</p>
      <p>You will be redirected to home page</p>
      </div>;
  }

  return (
    <main className="h-screen w-screen flex justify-center items-center" >
      {children}
    </main>
  );
}
