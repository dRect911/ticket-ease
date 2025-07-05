"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Bus as BusIcon,
  Route as RouteIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  getAllBuses,
  getAllRoutes,
  getAllBookings,
} from "@/utils/supabase/queries";
import LatestTravelsTable from "@/components/latest-travels-table";
import RecentBookings from "@/components/latest-bookings";
import RevenueChart from "@/components/revenue-chart";

/* const fetcher = (queryFunction: () => Promise<any>) =>
  queryFunction().catch((err) => {
    console.error("Error fetching data:", err);
    throw err;
  }); */

type Props = {};

const Home = ({}: Props) => {
  const { data: buses, error: busesError } = useSWR("buses", getAllBuses);
  const { data: routes, error: routesError } = useSWR("routes", getAllRoutes);
  const { data: bookings, error: bookingsError } = useSWR("bookings", getAllBookings);

  if (!buses || !routes || !bookings) return <div>Loading...</div>;

  if (busesError || routesError || bookingsError) return <div>Error loading data</div>;

  const stats = {
    totalBuses: buses.length,
    totalRoutes: routes.length,
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Main Content Area - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-5 xl:grid-cols-8">
        {/* Left Column - Stats and Latest Travels */}
        <div className="lg:col-span-3 xl:col-span-5 space-y-6">
          {/* Stats Cards - Buses and Routes */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:bg-indigo-50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Total Buses</CardTitle>
                <BusIcon className="h-6 w-6 text-muted-foreground group-hover:text-indigo-800 transition-all duration-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700">{stats.totalBuses}</div>
                <p className="text-xs text-muted-foreground">
                  Available buses
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-indigo-50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Total Routes</CardTitle>
                <RouteIcon className="h-6 w-6 text-muted-foreground group-hover:text-indigo-800 transition-all duration-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700">{stats.totalRoutes}</div>
                <p className="text-xs text-muted-foreground">
                  Active routes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Latest Travels Table */}
          <LatestTravelsTable />
        </div>

        {/* Right Column - Recent Bookings */}
        <div className="lg:col-span-2 xl:col-span-3">
          <RecentBookings />
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart bookings={bookings} />
    </main>
  );
};

export default memo(Home);

/* const [travels, setTravels] = useState<Travel[]>([]);
  const [latestTravels, setLatestTravels] = useState<Travel[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);


  useEffect(() => {
    const fetchTravels = async () => {
      const tr = await getAllTravels();
      setTravels(tr);
    };

    const fetchLatestTravels = async () => {
      const l = await getLatestTravels(5);
      setLatestTravels(l);
    };

    const fetchBuses = async () => {
      const b = await getAllBuses();
      setBuses(b);
    };

    const fetchTickets = async () => {
      const t = await getAllTickets();
      setTickets(t);
    };

    const fetchBookings = async () => {
      const bo = await getAllBookings();
      setBookings(bo);
    };

    const fetchLocations = async () => {
      const l = await getAllLocations();
      setLocations(l);
    };

    const fetchRoutes = async () => {
      const r = await getAllRoutes();
      setRoutes(r);
    };
    
  
    fetchTravels();
    fetchBuses();
    fetchTickets();
    fetchBookings();
    fetchLocations();
    fetchRoutes();
    fetchLatestTravels();

  }, []) */
