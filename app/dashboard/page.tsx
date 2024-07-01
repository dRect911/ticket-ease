"use client";
import { Button } from "@/components/ui/button";
import withAuth from "@/lib/withAuth";
import Link from "next/link";

function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col justify-center mx-auto text-center">
        <p className="text-5xl font-bold">This will be the dashboard</p>
        <p className="text-3xl font-medium mb-8">
          If you got here you are logged in
        </p>
        <Button asChild>
          <Link href="/">Back to home page</Link>
        </Button>
      </div>
    </main>
  );
}

export default withAuth(Dashboard);
