"use client";

import { usePathname } from "next/navigation";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Children } from "react";

export default function AuthLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="h-screen w-screen flex justify-center items-center" >
      <Card className="mx-auto my-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            {pathname === "/auth/register" ? "Sign Up" : "Sign in"}
          </CardTitle>
          <CardDescription>
            {pathname === "/auth/register"
              ? "Enter your information to create an account"
              : "Enter your credentials to login"}
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
