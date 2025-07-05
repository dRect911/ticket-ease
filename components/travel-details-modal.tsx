"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bus, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Ticket,
  Route as RouteIcon,
  Car
} from "lucide-react";
import { Travel, Bus as BusType, Profile, Ticket as TicketType, Booking } from "@/types";
import {
  getBusById,
  getBusIdByTravelId,
  getRouteIdByTravelId,
  getRouteLocations,
  getLocationNameById,
  getTicketsByTravelId,
  getProfileById,
  getDriverIdByBusId,
  getBookingsByTicketId,
} from "@/utils/supabase/queries";

interface TravelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  travel: Travel;
  travelDetails: {
    bus_plate: string;
    departure_name: string;
    arrival_name: string;
    places_amount: number;
  };
}

interface TravelInfo {
  bus: BusType | null;
  driver: Profile | null;
  tickets: TicketType[];
  bookings: Booking[];
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  totalRevenue: number;
}

export default function TravelDetailsModal({
  isOpen,
  onClose,
  travel,
  travelDetails,
}: TravelDetailsModalProps) {
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravelDetails = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // Get bus details
        const busId = await getBusIdByTravelId(travel.travel_id);
        const bus = busId ? await getBusById(busId) : null;

        // Get driver details
        let driver = null;
        if (bus?.driver_id) {
          driver = await getProfileById(bus.driver_id);
        }

        // Get tickets for this travel
        const tickets = await getTicketsByTravelId(travel.travel_id) || [];
        
        // Get bookings for this travel (through tickets)
        const bookings: Booking[] = [];
        for (const ticket of tickets) {
          const ticketBookings = await getBookingsByTicketId(ticket.ticket_id);
          bookings.push(...ticketBookings);
        }

        // Calculate seat statistics
        const totalSeats = bus?.capacity || 0;
        const bookedSeats = tickets.filter(t => t.status === "booked").length;
        const availableSeats = totalSeats - bookedSeats;
        const totalRevenue = tickets
          .filter(t => t.status === "booked")
          .reduce((sum, ticket) => sum + travel.price, 0);

        setTravelInfo({
          bus,
          driver,
          tickets,
          bookings,
          totalSeats,
          bookedSeats,
          availableSeats,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching travel details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelDetails();
  }, [isOpen, travel.travel_id, travel.price]);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Travel Details</DialogTitle>
            <DialogDescription>Loading travel information...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading travel details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5" />
            Travel Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information about this travel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Travel Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Travel Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {new Date(travel.travel_date).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">Travel Date</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {travel.price.toLocaleString()} XOF
                </div>
                <div className="text-sm text-muted-foreground">Ticket Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {travelInfo?.totalRevenue.toLocaleString()} XOF
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {travelInfo?.bookedSeats || 0}
                </div>
                <div className="text-sm text-muted-foreground">Booked Seats</div>
              </div>
            </CardContent>
          </Card>

          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-sky-600">
                      {travelDetails.departure_name}
                    </div>
                    <div className="text-sm text-muted-foreground">Departure</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RouteIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">to</span>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">
                      {travelDetails.arrival_name}
                    </div>
                    <div className="text-sm text-muted-foreground">Arrival</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bus and Driver Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Bus Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plate Number:</span>
                  <span className="font-semibold">{travelDetails.bus_plate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Capacity:</span>
                  <span className="font-semibold">{travelInfo?.totalSeats} seats</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available:</span>
                  <Badge variant={travelInfo?.availableSeats === 0 ? "destructive" : "secondary"}>
                    {travelInfo?.availableSeats} seats
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Driver Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {travelInfo?.driver ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={travelInfo.driver.avatar_url || ""} />
                      <AvatarFallback>
                        {`${travelInfo.driver.first_name?.[0] || ""}${travelInfo.driver.last_name?.[0] || ""}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {`${travelInfo.driver.first_name} ${travelInfo.driver.last_name}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {travelInfo.driver.email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No driver assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Seat Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Seat Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {travelInfo?.totalSeats || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Seats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {travelInfo?.bookedSeats || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Booked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {travelInfo?.availableSeats || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
              </div>
              
              {/* Seat Occupancy Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-600 h-4 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${travelInfo ? (travelInfo.bookedSeats / travelInfo.totalSeats) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="text-center text-sm text-muted-foreground mt-2">
                {travelInfo ? Math.round((travelInfo.bookedSeats / travelInfo.totalSeats) * 100) : 0}% Occupied
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Bookings
              </CardTitle>
              <CardDescription>
                Latest bookings for this travel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {travelInfo?.bookings.length > 0 ? (
                <div className="space-y-3">
                  {travelInfo.bookings
                    .slice(0, 5) // Show only first 5
                    .map((booking, index) => (
                      <div key={booking.booking_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold">Booking #{booking.booking_id.slice(0, 8)}...</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="default">Confirmed</Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No bookings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 