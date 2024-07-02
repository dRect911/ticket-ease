"use client";

import { usePathname } from "next/navigation";

export default function DriverDashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="h-screen w-screen flex justify-center items-center" >
      {children}
    </main>
  );
}
