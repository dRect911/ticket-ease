import type { Metadata } from "next";
import ReactQueryClientProvider from "@/components/react-query/client-provider"
import CacheProvider from "@/components/react-query/cache-provider"
import { Inter as FontSans } from "next/font/google";
import "../styles/globals.css";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ticket Ease",
  description: "Manage your tickets with ease.",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <CacheProvider>
          {children}
          <Toaster />
        </CacheProvider>
      </body>
    </html>
  );
}
