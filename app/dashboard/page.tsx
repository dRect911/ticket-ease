"use client";
import { getUserData } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import withAuth from "@/lib/withAuth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserMetadata } from "@supabase/supabase-js";
import { getUser } from "@/utils/supabase/queries";
import { supabase } from "@/utils/supabase/client";


function Dashboard() {
  const [userData, setUserData] = useState<UserMetadata | null | undefined>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUser(supabase);
      setUserData(data?.user_metadata);
    };

    fetchUserData();
  }, []);

  
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col justify-center mx-auto text-center">
      {userData && (
          <>
            <p className="text-5xl font-bold p-4">Welcome {userData.first_name} </p>
            <p className="text-3xl font-bold p-4">Your role is {userData.role}</p>
            <p className="text-3xl font-bold p-4">If you got here you are logged in</p>
            <Button asChild>
              <Link href="/">Back to home page</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

export default withAuth(Dashboard);
