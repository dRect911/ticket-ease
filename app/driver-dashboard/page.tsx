"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Bus, 
  Calendar, 
  Clock, 
  MapPin, 
  Route as RouteIcon,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Navigation,
  Car,
  User
} from "lucide-react";
import { 
  getUser, 
  getProfileById, 
  getBusByDriverId, 
  getTravelsByDriverId,
  getRouteIdByTravelId,
  getRouteLocations,
  getLocationNameById,
  getTicketsByTravelId,
  getBookingsByTicketId
} from "@/utils/supabase/queries";
import { Profile, Bus as BusType, Travel } from "@/types";

interface TravelWithDetails extends Travel {
  departure_name: string;
  arrival_name: string;
  booked_seats: number;
  total_seats: number;
}

interface PassengerDetails {
  booking_id: string;
  user_name: string;
  user_email: string;
  seat_number: number;
  booking_date: string;
}

export default function DriverDashboard() {
  const [driverProfile, setDriverProfile] = useState<Profile | null>(null);
  const [assignedBus, setAssignedBus] = useState<BusType | null>(null);
  const [driverTravels, setDriverTravels] = useState<TravelWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTravel, setSelectedTravel] = useState<TravelWithDetails | null>(null);
  const [isTravelDetailsModalOpen, setIsTravelDetailsModalOpen] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const user = await getUser();
        if (!user) {
          console.error("No user found");
          return;
        }

        // Get driver profile
        const profile = await getProfileById(user.id);
        setDriverProfile(profile);

        // Get assigned bus
        const bus = await getBusByDriverId(user.id);
        setAssignedBus(bus);

        // Get driver's travels
        const travels = await getTravelsByDriverId(user.id);
        
        // Get detailed information for each travel
        const travelsWithDetails = await Promise.all(
          travels.map(async (travel) => {
            try {
              // Get route and location information
              const routeId = await getRouteIdByTravelId(travel.travel_id);
              const routeLocations = routeId ? await getRouteLocations(routeId) : null;
              
              const departure_name = routeLocations?.startLocationId 
                ? await getLocationNameById(routeLocations.startLocationId) as string
                : "Unknown";
              const arrival_name = routeLocations?.endLocationId 
                ? await getLocationNameById(routeLocations.endLocationId) as string
                : "Unknown";

              // Get ticket information for seat count
              const tickets = await getTicketsByTravelId(travel.travel_id);
              const bookedSeats = tickets ? tickets.filter(ticket => ticket.status === "booked").length : 0;
              const totalSeats = assignedBus?.capacity || 30;

              return {
                ...travel,
                departure_name,
                arrival_name,
                booked_seats: bookedSeats,
                total_seats: totalSeats,
              };
            } catch (error) {
              console.error(`Error fetching details for travel ${travel.travel_id}:`, error);
              return {
                ...travel,
                departure_name: "Unknown",
                arrival_name: "Unknown",
                booked_seats: 0,
                total_seats: assignedBus?.capacity || 30,
              };
            }
          })
        );
        
        setDriverTravels(travelsWithDetails);
      } catch (error) {
        console.error("Error fetching driver data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [assignedBus?.capacity]);

  const getTravelStatus = (travel: TravelWithDetails) => {
    const travelDate = new Date(travel.travel_date);
    const now = new Date();
    
    if (travelDate < now) {
      return { status: "completed", label: "Completed", icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-100 text-green-800" };
    } else if (travelDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { status: "today", label: "Today", icon: <AlertCircle className="h-4 w-4" />, color: "bg-orange-100 text-orange-800" };
    } else {
      return { status: "upcoming", label: "Upcoming", icon: <Clock className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" };
    }
  };

  const upcomingTravels = driverTravels.filter(travel => {
    const travelDate = new Date(travel.travel_date);
    return travelDate >= new Date();
  });

  const completedTravels = driverTravels.filter(travel => {
    const travelDate = new Date(travel.travel_date);
    return travelDate < new Date();
  });

  const todayTravels = driverTravels.filter(travel => {
    const travelDate = new Date(travel.travel_date);
    const now = new Date();
    const diffTime = travelDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 1;
  });

  const fetchPassengerDetails = async (travel: TravelWithDetails) => {
    setLoadingPassengers(true);
    try {
      // Get all tickets for this travel
      const tickets = await getTicketsByTravelId(travel.travel_id);
      if (!tickets) {
        setPassengerDetails([]);
        return;
      }

      // Get bookings for booked tickets
      const bookedTickets = tickets.filter(ticket => ticket.status === "booked");
      const passengerDetailsPromises = bookedTickets.map(async (ticket) => {
        const bookings = await getBookingsByTicketId(ticket.ticket_id);
        if (bookings.length > 0) {
          const booking = bookings[0];
          const userProfile = await getProfileById(booking.user_id);
          return {
            booking_id: booking.booking_id,
            user_name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Unknown",
            user_email: userProfile?.email || "Unknown",
            seat_number: ticket.seat_number,
            booking_date: booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : "Unknown",
          };
        }
        return null;
      });

      const passengers = await Promise.all(passengerDetailsPromises);
      setPassengerDetails(passengers.filter(p => p !== null) as PassengerDetails[]);
    } catch (error) {
      console.error("Error fetching passenger details:", error);
      setPassengerDetails([]);
    } finally {
      setLoadingPassengers(false);
    }
  };

  const handleTravelClick = (travel: TravelWithDetails) => {
    setSelectedTravel(travel);
    setIsTravelDetailsModalOpen(true);
    fetchPassengerDetails(travel);
  };

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Bus className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading driver dashboard...</p>
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
          <h1 className="font-semibold text-lg md:text-2xl">Driver Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {driverProfile?.first_name || "Driver"}! Here's your driving schedule.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="" alt="Driver" />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Driver Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Travels</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driverTravels.length}</div>
            <p className="text-xs text-muted-foreground">
              All time travels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingTravels.length}</div>
            <p className="text-xs text-muted-foreground">
              Future journeys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayTravels.length}</div>
            <p className="text-xs text-muted-foreground">
              Today's schedule
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTravels.length}</div>
            <p className="text-xs text-muted-foreground">
              Past travels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Bus Information */}
      {assignedBus && (
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-6 w-6 text-blue-600" />
              Your Assigned Bus
            </CardTitle>
            <CardDescription>
              Vehicle details and specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <Bus className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">{assignedBus.plate_number}</p>
                  <p className="text-sm text-gray-600">Plate Number</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">{assignedBus.capacity}</p>
                  <p className="text-sm text-gray-600">Passenger Capacity</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {driverTravels.filter(t => new Date(t.travel_date) >= new Date()).length}
                  </p>
                  <p className="text-sm text-gray-600">Upcoming Routes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule */}
      {todayTravels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Your driving assignments for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayTravels.map((travel) => {
                const status = getTravelStatus(travel);
                return (
                  <div
                    key={travel.travel_id}
                    className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-all duration-200"
                    onClick={() => handleTravelClick(travel)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {new Date(travel.travel_date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 text-sky-600" />
                          <span className="text-sky-600 font-medium">{travel.departure_name}</span>
                          <RouteIcon className="h-3 w-3 text-gray-400" />
                          <MapPin className="h-3 w-3 text-orange-600" />
                          <span className="text-orange-600 font-medium">{travel.arrival_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {travel.booked_seats}/{travel.total_seats} passengers
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
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

      {/* Upcoming Travels */}
      {upcomingTravels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Upcoming Travels
            </CardTitle>
            <CardDescription>
              Your scheduled journeys for the coming days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTravels.slice(0, 5).map((travel) => {
                const status = getTravelStatus(travel);
                return (
                  <div
                    key={travel.travel_id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleTravelClick(travel)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {new Date(travel.travel_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 text-sky-600" />
                          <span className="text-sky-600 font-medium">{travel.departure_name}</span>
                          <RouteIcon className="h-3 w-3 text-gray-400" />
                          <MapPin className="h-3 w-3 text-orange-600" />
                          <span className="text-orange-600 font-medium">{travel.arrival_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span>
                            {new Date(travel.travel_date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {travel.booked_seats}/{travel.total_seats} passengers
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
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

      {/* No Travels State */}
      {driverTravels.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Navigation className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No travels assigned</h3>
            <p className="text-muted-foreground text-center mb-4">
              You don't have any travels assigned yet. Check back later for your driving schedule.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Travel Details Modal */}
      <Dialog open={isTravelDetailsModalOpen} onOpenChange={setIsTravelDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Travel Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this travel and passenger list
            </DialogDescription>
          </DialogHeader>

          {selectedTravel && (
            <div className="space-y-6">
              {/* Travel Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Travel Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date & Time</p>
                      <p className="text-lg font-semibold">
                        {new Date(selectedTravel.travel_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedTravel.travel_date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Route</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-sky-600" />
                        <span className="text-sky-600 font-medium">{selectedTravel.departure_name}</span>
                        <RouteIcon className="h-4 w-4 text-gray-400" />
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <span className="text-orange-600 font-medium">{selectedTravel.arrival_name}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bus</p>
                      <p className="text-lg font-semibold">{assignedBus?.plate_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Passenger Count</p>
                      <p className="text-lg font-semibold">
                        {selectedTravel.booked_seats}/{selectedTravel.total_seats} passengers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Passenger List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Passenger List</CardTitle>
                  <CardDescription>
                    {passengerDetails.length} passengers booked for this travel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPassengers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Users className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading passenger details...</p>
                      </div>
                    </div>
                  ) : passengerDetails.length > 0 ? (
                    <div className="space-y-3">
                      {passengerDetails.map((passenger) => (
                        <div
                          key={passenger.booking_id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" alt="Passenger" />
                              <AvatarFallback>
                                {passenger.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{passenger.user_name}</p>
                              <p className="text-sm text-gray-600">{passenger.user_email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="mb-1">
                              Seat {passenger.seat_number}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              Booked: {passenger.booking_date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 font-medium">No passengers booked</p>
                      <p className="text-sm text-gray-500">No bookings have been made for this travel yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}