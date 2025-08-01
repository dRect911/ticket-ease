"use client";

import { useRoleProtection } from "@/hooks/useRoleProtection";
import { supabase } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";


import Link from "next/link"
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
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast";


export default function AdminDashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const isAuthorized = useRoleProtection("user");
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
        description: "You will be rdirected to login page",
      });
      router.push("/auth/login");
    }
  };

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

  const navlinks = [
    {
      title: 'Dashboard',
      href: '',
      icon: <CircleUser className="h-6 w-6" />,
    },
    {
      title: 'Book a travel',
      href: 'bookings',
      icon: <CircleUser className="h-6 w-6" />,
    },
    /* {
      title: 'Tickets',
      href: 'tickets',
      icon: <CircleUser className="h-6 w-6" />,
    }, */
    {
      title: 'My bookings',
      href: 'my-bookings',
      icon: <CircleUser className="h-6 w-6" />,
    },
    /* {
      title: 'Buses',
      href: 'buses',
      icon: <CircleUser className="h-6 w-6" />,
    },
    {
      title: 'Routes',
      href: 'routes',
      icon: <CircleUser className="h-6 w-6" />,
    },
    {
      title: 'Locations',
      href: 'locations',
      icon: <CircleUser className="h-6 w-6" />,
    },
    {
      title: 'Users',
      href: 'users',
      icon: <CircleUser className="h-6 w-6" />,
    }, */
  ]

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Package2 className="h-6 w-6" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          {
            navlinks.map((link) => (
              <Link
                key={link.href}
                href={`/dashboard/${link.href}`}
                className={`flex items-center shrink-0 ${
                  pathname === `/dashboard/${link.href}`? "text-foreground" : "text-muted-foreground"
                } hover:text-foreground`}
              >
                {/* {link.icon} */}
                {/* <span className="sr-only">{link.title}</span> */}
                {link.title}
              </Link>
            ))
          }
          {/* <Link
            href="/"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link> */}
          
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Acme Inc</span>
              </Link>
              <Link href="#" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Customers
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Analytics
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} >Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {children}
    </div>
  );
}
