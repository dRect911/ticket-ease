"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const withAuth = (WrappedComponent: any) => {
  return (props: any) => {
    const router = useRouter();

    useEffect(() => {
      const checkUser = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (!data || !data.session) {
          router.push("/auth/login"); // Redirect to login page if not authenticated
        }
      };
      checkUser();
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
