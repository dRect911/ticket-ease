"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Bus, 
  Ticket as TicketIcon,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { getUser, getProfileById, getAllBookings, getTicketById, getTravelById, getRouteIdByTravelId, getRouteLocations, getLocationNameById, getBusIdByTravelId, getBusById } from "@/utils/supabase/queries";
import { Booking, Travel, Ticket, Profile } from "@/types";

interface BookingWithDetails extends Booking {
  ticket: Ticket;
  travel: Travel;
  departure_name: string;
  arrival_name: string;
  bus_plate: string;
  travel_date: string;
  price: number;
  seat_number: number;
}

export default function MyBookings() {
  const [userBookings, setUserBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userId = (await getUser())?.id;
        if (!userId) {
          console.error("No user found");
          return;
        }

        // Get user profile
        const profile = await getProfileById(userId);
        setUserProfile(profile);

        // Get all bookings
        const allBookings = await getAllBookings();
        
        // Filter user's bookings
        const userBookings = allBookings.filter(booking => booking.user_id === userId);

        // Fetch detailed information for each booking
        const bookingsWithDetails = await Promise.all(
          userBookings.map(async (booking) => {
            try {
              const ticket = await getTicketById(booking.ticket_id) as Ticket;
              const travel = await getTravelById(ticket.travel_id) as Travel;
              
              // Get route and location information
              const routeId = await getRouteIdByTravelId(travel.travel_id);
              const routeLocations = routeId ? await getRouteLocations(routeId) : null;
              
              const departure_name = routeLocations?.startLocationId 
                ? await getLocationNameById(routeLocations.startLocationId) as string
                : "Unknown";
              const arrival_name = routeLocations?.endLocationId 
                ? await getLocationNameById(routeLocations.endLocationId) as string
                : "Unknown";

              // Get bus information
              const busId = await getBusIdByTravelId(travel.travel_id);
              const bus = busId ? await getBusById(busId) : null;
              const bus_plate = bus?.plate_number || "N/A";

              return {
                ...booking,
                ticket,
                travel,
                departure_name,
                arrival_name,
                bus_plate,
                travel_date: String(travel.travel_date),
                price: travel.price,
                seat_number: ticket.seat_number,
              };
            } catch (error) {
              console.error(`Error fetching details for booking ${booking.booking_id}:`, error);
              return null;
            }
          })
        );

        // Filter out any null results and sort by travel date (upcoming first)
        const validBookings = bookingsWithDetails.filter(booking => booking !== null) as BookingWithDetails[];
        validBookings.sort((a, b) => new Date(a.travel_date).getTime() - new Date(b.travel_date).getTime());
        
        setUserBookings(validBookings);
      } catch (error) {
        console.error("Error fetching user bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  const getBookingStatus = (booking: BookingWithDetails) => {
    const travelDate = new Date(booking.travel_date);
    const now = new Date();
    
    if (travelDate < now) {
      return { status: "completed", label: "Completed", icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-100 text-green-800" };
    } else if (travelDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { status: "upcoming", label: "Today", icon: <AlertCircle className="h-4 w-4" />, color: "bg-orange-100 text-orange-800" };
    } else {
      return { status: "upcoming", label: "Upcoming", icon: <Clock className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" };
    }
  };

  const upcomingBookings = userBookings.filter(booking => {
    const travelDate = new Date(booking.travel_date);
    return travelDate >= new Date();
  });

  const pastBookings = userBookings.filter(booking => {
    const travelDate = new Date(booking.travel_date);
    return travelDate < new Date();
  });

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading your bookings...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-lg md:text-2xl">My Bookings</h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.first_name || "User"}! Here are your travel bookings.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/bookings">
            Book New Travel
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Travels</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Future journeys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pastBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Past travels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Travels */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Upcoming Travels
            </CardTitle>
            <CardDescription>
              Your upcoming journeys and travel details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => {
                const status = getBookingStatus(booking);
                return (
                  <div
                    key={booking.booking_id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {new Date(booking.travel_date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 text-sky-600" />
                          <span className="text-sky-600 font-medium">{booking.departure_name}</span>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          <MapPin className="h-3 w-3 text-orange-600" />
                          <span className="text-orange-600 font-medium">{booking.arrival_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Bus className="h-3 w-3" />
                            {booking.bus_plate}
                          </span>
                          <span className="flex items-center gap-1">
                            <TicketIcon className="h-3 w-3" />
                            Seat {booking.seat_number}
                          </span>
                          <span>
                            {new Date(booking.travel_date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 mb-2">
                        {booking.price.toLocaleString()} XOF
                      </div>
                      <Badge className={status.color}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Past Travels
            </CardTitle>
            <CardDescription>
              Your completed journeys and travel history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.map((booking) => {
                const status = getBookingStatus(booking);
                return (
                  <div
                    key={booking.booking_id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-200 hover:bg-green-50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {new Date(booking.travel_date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 text-sky-600" />
                          <span className="text-sky-600 font-medium">{booking.departure_name}</span>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          <MapPin className="h-3 w-3 text-orange-600" />
                          <span className="text-orange-600 font-medium">{booking.arrival_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Bus className="h-3 w-3" />
                            {booking.bus_plate}
                          </span>
                          <span className="flex items-center gap-1">
                            <TicketIcon className="h-3 w-3" />
                            Seat {booking.seat_number}
                          </span>
                          <span>
                            Booked on {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 mb-2">
                        {booking.price.toLocaleString()} XOF
                      </div>
                      <Badge className={status.color}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {userBookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TicketIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't made any bookings yet. Start your journey by booking your first travel!
            </p>
            <Button asChild>
              <Link href="/dashboard/bookings">
                Book Your First Travel
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
} 