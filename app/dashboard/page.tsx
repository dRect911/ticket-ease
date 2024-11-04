"use client";
import { getUserData } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import withAuth from "@/lib/withAuth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserMetadata } from "@supabase/supabase-js";
import { getProfileById, getUser } from "@/utils/supabase/queries";
import { supabase } from "@/utils/supabase/client";
import { Profile } from "@/types";
import useSWR from "swr";
import {
  Luggage,
  RefreshCw,
  Ticket as TicketIcon,
  Bus as BusIcon,
  Route as RouteIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Travel, Bus, Ticket, Booking, Location, Route } from "@/types";
import {
  getAllBookings,
  getAllBuses,
  getAllLocations,
  getAllRoutes,
  getAllTickets,
  getAllTravels,
  getLatestTravels,
} from "@/utils/supabase/queries";
import LatestTravelsTable from "@/components/latest-travels-table";



function Dashboard() {
  const [userData, setUserData] = useState<Profile | null | undefined>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = (await getUser())?.id; 
    const userProfile = (await getProfileById(userId as string))
    setUserData(userProfile);
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

// export default withAuth(Dashboard);
export default Dashboard;
