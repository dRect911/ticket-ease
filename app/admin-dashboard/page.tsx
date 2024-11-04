"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Luggage,
  RefreshCw,
  Ticket as TicketIcon,
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
  getAllBookings,
  getAllBuses,
  getAllLocations,
  getAllRoutes,
  getAllTickets,
  getAllTravels,
  getLatestTravels,
} from "@/utils/supabase/queries";
import LatestTravelsTable from "@/components/latest-travels-table";
import RecentBookings from "@/components/latest-bookings";

/* const fetcher = (queryFunction: () => Promise<any>) =>
  queryFunction().catch((err) => {
    console.error("Error fetching data:", err);
    throw err;
  }); */

type Props = {};

const Home = ({}: Props) => {
  const { data: travels, error: travelsError } = useSWR(
    "travels",
    getAllTravels
  );
  const { data: buses, error: busesError } = useSWR("buses", getAllBuses);
  const { data: routes, error: routesError } = useSWR("routes", getAllRoutes);
  const { data: bookings, error: bookingsError } = useSWR(
    "bookings",
    getAllBookings
  );
  const { data: tickets, error: ticketsError } = useSWR(
    "tickets",
    getAllTickets
  );
  const { data: locations, error: locationsError } = useSWR(
    "locations",
    getAllLocations
  );

  if (!travels || !buses || !routes || !bookings || !tickets || !locations)
    return <div>Loading...</div>;

  if (
    travelsError ||
    busesError ||
    routesError ||
    bookingsError ||
    ticketsError ||
    locationsError
  )
    return <div>Error loading data</div>;

  const getStats = () => {
    return {
      totalTravels: travels.length,
      totalBuses: buses.length,
      totalRoutes: routes.length,
      // totalTickets: tickets.length,
      totalBookings: bookings.length,
    };
  };

  // const stats = useMemo(() => getStats(), [travels, buses, routes, bookings]);
  const stats = getStats();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Travels</CardTitle>
            <Luggage className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTravels}</div>
            <p className="text-xs text-muted-foreground">
              {/* +20.1% from last month */}
            </p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
            <BusIcon className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBuses}</div>
            <p className="text-xs text-muted-foreground">
              {/* +180.1% from last month */}
            </p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <RouteIcon className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoutes}</div>
            <p className="text-xs text-muted-foreground">
              {/* +19% from last month */}
            </p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <TicketIcon className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {/* +201 since last hour */}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <LatestTravelsTable />
        <RecentBookings />
        {/* <Card x-chunk="dashboard-01-chunk-5">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback>OM</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Olivia Martin
                </p>
                <p className="text-sm text-muted-foreground">
                  olivia.martin@email.com
                </p>
              </div>
              <div className="ml-auto font-medium">+$1,999.00</div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/02.png" alt="Avatar" />
                <AvatarFallback>JL</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Jackson Lee</p>
                <p className="text-sm text-muted-foreground">
                  jackson.lee@email.com
                </p>
              </div>
              <div className="ml-auto font-medium">+$39.00</div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/03.png" alt="Avatar" />
                <AvatarFallback>IN</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Isabella Nguyen
                </p>
                <p className="text-sm text-muted-foreground">
                  isabella.nguyen@email.com
                </p>
              </div>
              <div className="ml-auto font-medium">+$299.00</div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/04.png" alt="Avatar" />
                <AvatarFallback>WK</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">William Kim</p>
                <p className="text-sm text-muted-foreground">will@email.com</p>
              </div>
              <div className="ml-auto font-medium">+$99.00</div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/05.png" alt="Avatar" />
                <AvatarFallback>SD</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Sofia Davis</p>
                <p className="text-sm text-muted-foreground">
                  sofia.davis@email.com
                </p>
              </div>
              <div className="ml-auto font-medium">+$39.00</div>
            </div>
          </CardContent>
        </Card> */}
      </div>
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
