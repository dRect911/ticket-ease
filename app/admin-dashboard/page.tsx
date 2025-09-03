"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Bus as BusIcon,
  Route as RouteIcon,
  AlertCircle,
  RefreshCw,
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
import { Skeleton } from "@/components/ui/skeleton";
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
  const { data: buses, error: busesError, isLoading: busesLoading } = useSWR("buses", getAllBuses);
  const { data: routes, error: routesError, isLoading: routesLoading } = useSWR("routes", getAllRoutes);
  const { data: bookings, error: bookingsError, isLoading: bookingsLoading } = useSWR("bookings", getAllBookings);

  const isLoading = busesLoading || routesLoading || bookingsLoading;
  const hasError = busesError || routesError || bookingsError;

  // Loading State
  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="grid gap-6 lg:grid-cols-5 xl:grid-cols-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-3 xl:col-span-5 space-y-6">
            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Latest Travels Table Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-2 xl:col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revenue Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </main>
    );
  }

  // Error State
  if (hasError) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Error Loading Dashboard Data
            </CardTitle>
            <CardDescription className="text-red-600">
              We encountered an issue while loading your dashboard data. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-red-700">
              {busesError && <p>• Failed to load buses data</p>}
              {routesError && <p>• Failed to load routes data</p>}
              {bookingsError && <p>• Failed to load bookings data</p>}
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Ensure we have data before proceeding
  if (!buses || !routes || !bookings) {
    return null; // This shouldn't happen since we handle loading above, but just in case
  }

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
            <Card className="hover:bg-slate-50 transition-all duration-300 group border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-slate-800">Total Buses</CardTitle>
                <BusIcon className="h-6 w-6 text-muted-foreground group-hover:text-slate-700 transition-all duration-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stats.totalBuses}</div>
                <p className="text-xs text-muted-foreground">
                  Available buses
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-slate-50 transition-all duration-300 group border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-slate-800">Total Routes</CardTitle>
                <RouteIcon className="h-6 w-6 text-muted-foreground group-hover:text-slate-700 transition-all duration-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stats.totalRoutes}</div>
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
