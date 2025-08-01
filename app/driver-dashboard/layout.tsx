"use client";

import { useRoleProtection } from "@/hooks/useRoleProtection";
import { supabase } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  Bus,
  Navigation,
  Calendar,
  MapPin
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

export default function DriverDashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const isAuthorized = useRoleProtection("driver");
  const pathname = usePathname();

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
        description: "You will be redirected to login page",
      });
      router.push("/auth/login");
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <div>
      <p>Not Authorized</p>
      <p>You will be redirected to home page</p>
    </div>;
  }

  const navlinks = [
    {
      title: 'Dashboard',
      href: '',
      icon: <Navigation className="h-6 w-6" />,
    },
    {
      title: 'My Schedule',
      href: 'schedule',
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      title: 'My Routes',
      href: 'routes',
      icon: <MapPin className="h-6 w-6" />,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/driver-dashboard" className="mr-6 flex items-center space-x-2">
              <Bus className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Driver Dashboard
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navlinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/driver-dashboard/${link.href}`}
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname === `/driver-dashboard/${link.href}` ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pl-1 pr-0">
              <div className="px-2 py-6">
                <Link href="/driver-dashboard" className="flex items-center">
                  <Bus className="mr-2 h-4 w-4" />
                  <span className="font-bold">Driver Dashboard</span>
                </Link>
              </div>
              <nav className="grid items-start px-4 text-sm font-medium">
                {navlinks.map((link, index) => (
                  <Link
                    key={index}
                    href={`/driver-dashboard/${link.href}`}
                    className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                      pathname === `/driver-dashboard/${link.href}` ? "bg-accent" : "transparent"
                    }`}
                  >
                    {link.icon}
                    <span className="ml-2">{link.title}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="ml-auto flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <CircleUser className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Driver</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      driver@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex w-full flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
