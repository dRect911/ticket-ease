"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  MapPin, 
  Users, 
  Clock,
  Search,
  Filter,
  Route as RouteIcon,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
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

type TravelFilter = "all" | "upcoming" | "past" | "today";

export default function DriverTravelsPage() {
  const [driverProfile, setDriverProfile] = useState<Profile | null>(null);
  const [assignedBus, setAssignedBus] = useState<BusType | null>(null);
  const [driverTravels, setDriverTravels] = useState<TravelWithDetails[]>([]);
  const [filteredTravels, setFilteredTravels] = useState<TravelWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTravel, setSelectedTravel] = useState<TravelWithDetails | null>(null);
  const [isTravelDetailsModalOpen, setIsTravelDetailsModalOpen] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [filter, setFilter] = useState<TravelFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const user = await getUser();
        if (!user) return;

        const profile = await getProfileById(user.id);
        setDriverProfile(profile);

        const bus = await getBusByDriverId(user.id);
        setAssignedBus(bus);

        const travels = await getTravelsByDriverId(user.id);
        if (travels) {
          const travelsWithDetails = await Promise.all(
            travels.map(async (travel) => {
              const routeId = await getRouteIdByTravelId(travel.travel_id);
              if (!routeId) return null;

              const routeLocations = await getRouteLocations(routeId);
              if (!routeLocations) return null;

              const departureName = await getLocationNameById(routeLocations.startLocationId);
              const arrivalName = await getLocationNameById(routeLocations.endLocationId);

              const tickets = await getTicketsByTravelId(travel.travel_id);
              const bookedSeats = tickets ? tickets.filter(ticket => ticket.status === "booked").length : 0;
              const totalSeats = assignedBus?.capacity || 0;

              return {
                ...travel,
                departure_name: departureName || "Unknown",
                arrival_name: arrivalName || "Unknown",
                booked_seats: bookedSeats,
                total_seats: totalSeats,
              };
            })
          );

          const validTravels = travelsWithDetails.filter(travel => travel !== null) as TravelWithDetails[];
          setDriverTravels(validTravels);
        }
      } catch (error) {
        console.error("Error fetching driver data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [assignedBus?.capacity]);

  useEffect(() => {
    let filtered = [...driverTravels];

    // Apply filter
    switch (filter) {
      case "upcoming":
        filtered = filtered.filter(travel => {
          const travelDate = new Date(travel.travel_date);
          const now = new Date();
          return travelDate > now;
        });
        break;
      case "past":
        filtered = filtered.filter(travel => {
          const travelDate = new Date(travel.travel_date);
          const now = new Date();
          return travelDate < now;
        });
        break;
      case "today":
        filtered = filtered.filter(travel => {
          const travelDate = new Date(travel.travel_date);
          const now = new Date();
          const diffTime = travelDate.getTime() - now.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays < 1;
        });
        break;
      default:
        break;
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(travel =>
        travel.departure_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        travel.arrival_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(travel.travel_date).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.travel_date).getTime() - new Date(a.travel_date).getTime());

    setFilteredTravels(filtered);
  }, [driverTravels, filter, searchTerm]);

  const fetchPassengerDetails = async (travel: TravelWithDetails) => {
    setLoadingPassengers(true);
    try {
      const tickets = await getTicketsByTravelId(travel.travel_id);
      if (!tickets) {
        setPassengerDetails([]);
        return;
      }

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

  const getTravelStatus = (travel: TravelWithDetails) => {
    const travelDate = new Date(travel.travel_date);
    const now = new Date();
    const diffTime = travelDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      return {
        label: "Completed",
        color: "bg-gray-100 text-gray-800",
        icon: <CheckCircle className="h-3 w-3" />,
      };
    } else if (diffDays >= 0 && diffDays < 1) {
      return {
        label: "Today",
        color: "bg-orange-100 text-orange-800",
        icon: <Clock className="h-3 w-3" />,
      };
    } else {
      return {
        label: "Upcoming",
        color: "bg-blue-100 text-blue-800",
        icon: <Calendar className="h-3 w-3" />,
      };
    }
  };

  const getStats = () => {
    const now = new Date();
    const total = driverTravels.length;
    const upcoming = driverTravels.filter(travel => new Date(travel.travel_date) > now).length;
    const past = driverTravels.filter(travel => new Date(travel.travel_date) < now).length;
    const today = driverTravels.filter(travel => {
      const travelDate = new Date(travel.travel_date);
      const diffTime = travelDate.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 1;
    }).length;

    return { total, upcoming, past, today };
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Bus className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading your travels...</p>
          </div>
        </div>
      </main>
    );
  }

  const stats = getStats();

  return (
    <main className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Travels</h1>
        <p className="text-gray-600">Manage and view all your scheduled travels</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Travels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-orange-600">{stats.today}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.past}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by location or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filter} onValueChange={(value: TravelFilter) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Travels</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travels List */}
      <div className="space-y-4">
        {filteredTravels.length > 0 ? (
          filteredTravels.map((travel) => {
            const status = getTravelStatus(travel);
            return (
              <Card
                key={travel.travel_id}
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => handleTravelClick(travel)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {new Date(travel.travel_date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </h3>
                          <Badge className={status.color}>
                            {status.icon}
                            <span className="ml-1">{status.label}</span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 text-sky-600" />
                          <span className="text-sky-600 font-medium">{travel.departure_name}</span>
                          <RouteIcon className="h-4 w-4 text-gray-400" />
                          <MapPin className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-600 font-medium">{travel.arrival_name}</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(travel.travel_date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {travel.booked_seats}/{travel.total_seats} passengers
                          </span>
                          <span className="flex items-center gap-1">
                            <Bus className="h-3 w-3" />
                            {assignedBus?.plate_number || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Occupancy</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {Math.round((travel.booked_seats / travel.total_seats) * 100)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Bus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No travels found</h3>
              <p className="text-gray-600">
                {filter === "all" 
                  ? "You don't have any travels scheduled yet."
                  : `No ${filter} travels found. Try adjusting your filters.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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