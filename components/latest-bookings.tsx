"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { formatCurrency } from "@/utils/format"; // Assume a helper function for formatting prices
import { getProfileById, getTravelById, getLatestBookings, getTicketById, getRouteIdByTravelId, getRouteLocations, getLocationNameById } from "@/utils/supabase/queries"; // Assume these query functions exist
import { Booking, Ticket, Travel } from "@/types";
import useSWR from "swr";

const RecentBookings = () => {
  const { data: bookings, error } = useSWR("recentBookings", () => getLatestBookings(5)); // Fetches recent bookings
  const [renderedBookings, setRenderedBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookingDetails = async (booking: Booking) => {
      const profile = await getProfileById(booking.user_id);
      const ticket = await getTicketById(booking.ticket_id) as Ticket; 
      const travel = await getTravelById(ticket.travel_id) as Travel;
      const routeId = await getRouteIdByTravelId(travel.travel_id);

      const locations = await getRouteLocations(routeId as string);

      const departure_location = await getLocationNameById(
        locations?.startLocationId as string
      );
      const arrival_location = await getLocationNameById(
        locations?.endLocationId as string
      );
      return {
        ...booking,
        profile,
        travel,
        departure_location,
        arrival_location
      };
    };

    const processBookings = async () => {
      if (bookings) {
        const detailedBookings = await Promise.all(
          bookings.map(fetchBookingDetails)
        );
        setRenderedBookings(detailedBookings);
      }
    };

    processBookings();
  }, [bookings]);

  function getInitials(name: string): string {
    if (!name) return "U"; // Default to "U" if no name is provided
  
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
  
    return (
      nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase()
    );
  }

  if (error) return <div>Error loading bookings.</div>;
  if (!bookings) return <div>Loading...</div>;

  return (
    <Card x-chunk="dashboard-01-chunk-5">
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {renderedBookings.map((booking) => (
          <div className="flex items-center gap-4" key={booking.booking_id}>
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src={booking.profile?.avatar_url || "/default-avatar.png"} alt="Avatar" />
              <AvatarFallback>
                {booking.profile?.initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {`${booking.profile?.first_name} ${booking.profile?.last_name}` || "Unknown User"}
              </p>
              <p className="text-sm text-muted-foreground">
                {booking.profile?.email || "No Email"}
              </p>
              <p className="text-xs text-muted-foreground">
                {`${booking.departure_location} to ${booking.arrival_location}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(booking.booking_date).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
            </div>
            <div className="ml-auto font-medium">
              {booking.travel?.price || 4000} XOF
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentBookings;
