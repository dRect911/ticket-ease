"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useLogout from "@/hooks/useLogout";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } else {
      toast({
        title: "Logout successful!",
        description: "You will be rdirected to home page",
      });
      router.push("/");
    }
  };

  

  useEffect(() => {
    const checkUser = async () => {
      const session = await supabase.auth.getSession();
      if (session.data) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkUser();

    
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <p className="text-4xl font-bold p-12">Welcome to Ticket Ease</p>
      <div className="w-1/3 flex items-center gap-10 justify-center">
        {isAuthenticated ? (
          <>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="outline">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get started</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
