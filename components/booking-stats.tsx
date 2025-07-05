"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  Users, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Clock,
  DollarSign,
  Route as RouteIcon
} from "lucide-react";
import { Booking, Travel, Ticket as TicketType, Profile } from "@/types";
import {
  getProfileById,
  getTicketById,
  getTravelById,
  getRouteIdByTravelId,
  getRouteLocations,
  getLocationNameById,
  getBusIdByTravelId,
  getBusById,
} from "@/utils/supabase/queries";
import { useBookingDetails } from "@/hooks/useCachedData";

interface BookingDetails extends Booking {
  user_profile: Profile;
  ticket: TicketType;
  travel: Travel;
  bus_plate: string;
  departure_name: string;
  arrival_name: string;
  travel_date: string;
  seat_number: number;
  price: number;
}

interface BookingStatsProps {
  bookings: Booking[];
}

type Period = "1w" | "1m" | "3m" | "6m" | "1y" | "lifetime";

const periods: { value: Period; label: string; days: number }[] = [
  { value: "1w", label: "1 Week", days: 7 },
  { value: "1m", label: "1 Month", days: 30 },
  { value: "3m", label: "3 Months", days: 90 },
  { value: "6m", label: "6 Months", days: 180 },
  { value: "1y", label: "1 Year", days: 365 },
  { value: "lifetime", label: "Lifetime", days: Infinity },
];

export default function BookingStats({ bookings }: BookingStatsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("1m");
  const [loading, setLoading] = useState(false);
  const [detailedBookings, setDetailedBookings] = useState<BookingDetails[]>([]);

  // Use cached data for better performance
  const { profiles, travels, tickets, buses, locations, routes } = useBookingDetails(bookings);

  // Fetch detailed booking data with cached data
  React.useEffect(() => {
    const fetchDetailedBookings = async () => {
      // Don't wait for all data to be loaded, process what we have
      if (!bookings || bookings.length === 0) {
        setDetailedBookings([]);
        return;
      }

      setLoading(true);
      try {
        const bookingsWithDetails = await Promise.all(
          bookings.map(async (booking) => {
            // Use cached data when available, fallback to API calls
            const user_profile = profiles?.find(p => p.id === booking.user_id) || 
              (await getProfileById(booking.user_id)) as Profile;
            
            const ticket = tickets?.find(t => t.ticket_id === booking.ticket_id) || 
              (await getTicketById(booking.ticket_id)) as TicketType;
            
            const travel = travels?.find(t => t.travel_id === ticket.travel_id) || 
              (await getTravelById(ticket.travel_id)) as Travel;
            
            const busId = await getBusIdByTravelId(travel.travel_id);
            const bus = buses?.find(b => b.bus_id === busId) || 
              (busId ? (await getBusById(busId)) as any : null);
            const bus_plate = bus?.plate_number || "N/A";
            
            const routeId = await getRouteIdByTravelId(travel.travel_id);
            const route = routes?.find(r => r.route_id === routeId);
            const routeLocations = routeId ? await getRouteLocations(routeId) : null;
            
            const departure_name = routeLocations?.startLocationId 
              ? locations?.find(l => l.location_id === routeLocations.startLocationId)?.location_name || 
                (await getLocationNameById(routeLocations.startLocationId)) as string
              : "N/A";
            const arrival_name = routeLocations?.endLocationId 
              ? locations?.find(l => l.location_id === routeLocations.endLocationId)?.location_name || 
                (await getLocationNameById(routeLocations.endLocationId)) as string
              : "N/A";

            return {
              ...booking,
              user_profile,
              ticket,
              travel,
              bus_plate,
              departure_name,
              arrival_name,
              travel_date: travel.travel_date,
              seat_number: ticket.seat_number,
              price: travel.price,
            };
          })
        );
        setDetailedBookings(bookingsWithDetails);
      } catch (error) {
        console.error("Error fetching detailed bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedBookings();
  }, [bookings, profiles, travels, tickets, buses, locations, routes]);

  const filteredBookings = useMemo(() => {
    if (!detailedBookings.length) return [];
    
    const period = periods.find(p => p.value === selectedPeriod);
    if (!period || period.days === Infinity) return detailedBookings;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period.days);

    return detailedBookings.filter(booking => {
      if (!booking.booking_date) return false;
      const bookingDate = new Date(booking.booking_date);
      return bookingDate >= cutoffDate;
    });
  }, [detailedBookings, selectedPeriod]);

  const stats = useMemo(() => {
    if (!filteredBookings.length) {
      return {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingsPerDay: 0,
        averageRevenuePerBooking: 0,
        mostPopularDeparture: { location: "N/A", count: 0 },
        mostPopularArrival: { location: "N/A", count: 0 },
        mostPopularRoute: { route: "N/A", count: 0 },
        recentBookings: 0,
        averageDailyRevenue: 0,
      };
    }

    // Calculate basic stats
    const totalBookings = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);
    const averageRevenuePerBooking = totalRevenue / totalBookings;

    // Calculate period days for daily averages
    const period = periods.find(p => p.value === selectedPeriod);
    const periodDays = period?.days === Infinity ? 
      Math.max(1, Math.ceil((Date.now() - new Date(filteredBookings[0]?.booking_date || Date.now()).getTime()) / (1000 * 60 * 60 * 24))) : 
      period?.days || 30;

    const averageBookingsPerDay = totalBookings / periodDays;
    const averageDailyRevenue = totalRevenue / periodDays;

    // Calculate recent bookings (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentBookings = filteredBookings.filter(booking => {
      if (!booking.booking_date) return false;
      const bookingDate = new Date(booking.booking_date);
      return bookingDate >= weekAgo;
    }).length;

    // Calculate popular locations and routes
    const departureCounts: Record<string, number> = {};
    const arrivalCounts: Record<string, number> = {};
    const routeCounts: Record<string, number> = {};

    filteredBookings.forEach(booking => {
      const departure = booking.departure_name;
      const arrival = booking.arrival_name;
      const route = `${departure} → ${arrival}`;

      departureCounts[departure] = (departureCounts[departure] || 0) + 1;
      arrivalCounts[arrival] = (arrivalCounts[arrival] || 0) + 1;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    const mostPopularDeparture = Object.entries(departureCounts)
      .sort(([,a], [,b]) => b - a)[0] || ["N/A", 0];
    const mostPopularArrival = Object.entries(arrivalCounts)
      .sort(([,a], [,b]) => b - a)[0] || ["N/A", 0];
    const mostPopularRoute = Object.entries(routeCounts)
      .sort(([,a], [,b]) => b - a)[0] || ["N/A", 0];

    return {
      totalBookings,
      totalRevenue,
      averageBookingsPerDay: Math.round(averageBookingsPerDay * 100) / 100,
      averageRevenuePerBooking: Math.round(averageRevenuePerBooking),
      mostPopularDeparture: { location: mostPopularDeparture[0], count: mostPopularDeparture[1] },
      mostPopularArrival: { location: mostPopularArrival[0], count: mostPopularArrival[1] },
      mostPopularRoute: { route: mostPopularRoute[0], count: mostPopularRoute[1] },
      recentBookings,
      averageDailyRevenue: Math.round(averageDailyRevenue),
    };
  }, [filteredBookings, selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Booking Statistics</h2>
        <div className="flex items-center gap-2">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings */}
        <Card className="hover:bg-indigo-50 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground group-hover:text-indigo-800 transition-all duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{stats.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedPeriod === "lifetime" ? "All time" : `Last ${periods.find(p => p.value === selectedPeriod)?.label.toLowerCase()}`}
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="hover:bg-emerald-50 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-emerald-800 transition-all duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{stats.totalRevenue.toLocaleString()} XOF</div>
            <p className="text-xs text-muted-foreground">
              Avg: {stats.averageRevenuePerBooking.toLocaleString()} XOF per booking
            </p>
          </CardContent>
        </Card>

        {/* Average Daily Bookings */}
        <Card className="hover:bg-blue-50 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-blue-800 transition-all duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.averageBookingsPerDay}</div>
            <p className="text-xs text-muted-foreground">
              Bookings per day
            </p>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="hover:bg-green-50 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-green-800 transition-all duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.recentBookings}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Routes Section */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Most Popular Departure */}
        <Card className="hover:bg-sky-50 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-600" />
              Most Popular Departure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-sky-700">{stats.mostPopularDeparture.location}</div>
            <p className="text-sm text-muted-foreground">
              {stats.mostPopularDeparture.count} bookings
            </p>
          </CardContent>
        </Card>

        {/* Most Popular Arrival */}
        <Card className="hover:bg-orange-50 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              Most Popular Arrival
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-orange-700">{stats.mostPopularArrival.location}</div>
            <p className="text-sm text-muted-foreground">
              {stats.mostPopularArrival.count} bookings
            </p>
          </CardContent>
        </Card>

        {/* Most Popular Route */}
        <Card className="hover:bg-purple-50 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-purple-600" />
              Most Popular Route
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-purple-700">{stats.mostPopularRoute.route}</div>
            <p className="text-sm text-muted-foreground">
              {stats.mostPopularRoute.count} bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Daily Average Revenue:</span>
              <span className="font-semibold">{stats.averageDailyRevenue.toLocaleString()} XOF</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average per Booking:</span>
              <span className="font-semibold">{stats.averageRevenuePerBooking.toLocaleString()} XOF</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Booking Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Period:</span>
              <Badge variant="secondary">
                {periods.find(p => p.value === selectedPeriod)?.label}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Days:</span>
              <span className="font-semibold">
                {selectedPeriod === "lifetime" ? "All time" : periods.find(p => p.value === selectedPeriod)?.days}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 