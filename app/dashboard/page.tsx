"use client";
import { getUserData } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import withAuth from "@/lib/withAuth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserMetadata } from "@supabase/supabase-js";
import { getProfileById, getUser, getAllLocations, getLatestTravels, getAllBookings, getAllTravels, getRouteIdByTravelId, getRouteLocations, getLocationNameById } from "@/utils/supabase/queries";
import { supabase } from "@/utils/supabase/client";
import { Profile, Location, Travel, Booking } from "@/types";
import useSWR from "swr";
import {
  Luggage,
  RefreshCw,
  Ticket as TicketIcon,
  Bus,
  Route as RouteIcon,
  MapPin,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  Search,
  Heart,
  Award
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

function Dashboard() {
  const [userData, setUserData] = useState<Profile | null | undefined>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [upcomingTravels, setUpcomingTravels] = useState<Travel[]>([]);
  const [travelDetails, setTravelDetails] = useState<any[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allTravels, setAllTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userId = (await getUser())?.id;
        const userProfile = await getProfileById(userId as string);
        setUserData(userProfile);

        // Fetch locations
        const allLocations = await getAllLocations();
        setLocations(allLocations);

        // Fetch upcoming travels
        const travels = await getLatestTravels(6);
        setUpcomingTravels(travels);

        // Fetch travel details with location information
        const travelsWithDetails = await Promise.all(
          travels.map(async (travel) => {
            try {
              const routeId = await getRouteIdByTravelId(travel.travel_id);
              const routeLocations = routeId ? await getRouteLocations(routeId) : null;
              
              const departure_name = routeLocations?.startLocationId 
                ? await getLocationNameById(routeLocations.startLocationId) as string
                : "Unknown";
              const arrival_name = routeLocations?.endLocationId 
                ? await getLocationNameById(routeLocations.endLocationId) as string
                : "Unknown";

              return {
                ...travel,
                departure_name,
                arrival_name,
              };
            } catch (error) {
              console.error(`Error fetching details for travel ${travel.travel_id}:`, error);
              return {
                ...travel,
                departure_name: "Unknown",
                arrival_name: "Unknown",
              };
            }
          })
        );
        setTravelDetails(travelsWithDetails);

        // Fetch all bookings and travels for statistics
        const bookings = await getAllBookings();
        const allTravelsData = await getAllTravels();
        setAllBookings(bookings);
        setAllTravels(allTravelsData);

        // Fetch user bookings (if user is logged in)
        if (userId) {
          const userBookings = bookings.filter(booking => booking.user_id === userId);
          setUserBookings(userBookings);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate real statistics
  const calculateStats = () => {
    const totalBookings = allBookings.length;
    const totalTravels = allTravels.length;
    const userBookingCount = userBookings.length;
    
    // Calculate unique destinations from user bookings
    const userDestinations = new Set();
    userBookings.forEach(booking => {
      // You might need to fetch travel details to get route information
      // For now, we'll use booking IDs as a proxy
      userDestinations.add(booking.booking_id);
    });

    // Calculate member status based on activity
    const memberStatus = userBookingCount > 0 ? 'Active' : 'New';
    
    // Calculate average bookings per user
    const uniqueUsers = new Set(allBookings.map(b => b.user_id)).size;
    const avgBookingsPerUser = uniqueUsers > 0 ? Math.round(totalBookings / uniqueUsers) : 0;

    return {
      totalBookings,
      totalTravels,
      userBookingCount,
      userDestinations: userDestinations.size,
      memberStatus,
      avgBookingsPerUser,
      uniqueUsers
    };
  };

  const stats = calculateStats();

  // Popular locations (you can customize this based on your data)
  const popularLocations = locations.slice(0, 6);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {userData?.first_name || 'Traveler'}! 👋
              </h1>
              <p className="text-gray-600">
                Ready for your next adventure? Discover amazing destinations and book your journey.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt="Profile" />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/bookings">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <TicketIcon className="h-8 w-8 mb-2" />
                    <h3 className="text-lg font-semibold mb-1">Book a Ticket</h3>
                    <p className="text-blue-100 text-sm">Find and book your next journey</p>
                  </div>
                  <ArrowRight className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/my-bookings">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Luggage className="h-8 w-8 mb-2" />
                    <h3 className="text-lg font-semibold mb-1">My Bookings</h3>
                    <p className="text-green-100 text-sm">View your travel history</p>
                  </div>
                  <ArrowRight className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Popular Locations & Upcoming Travels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Popular Locations */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Popular Destinations
                </CardTitle>
                <CardDescription>
                  Discover our most popular travel destinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {popularLocations.map((location, index) => (
                    <div
                      key={location.location_id}
                      className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-pointer border border-blue-100 hover:border-blue-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        {index < 3 && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {location.location_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {index < 3 ? 'Top destination' : 'Popular route'}
                      </p>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Travels */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-6 w-6 text-green-600" />
                  Upcoming Travels
                </CardTitle>
                <CardDescription>
                  Don't miss these upcoming journeys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {travelDetails.slice(0, 4).map((travel) => (
                    <div
                      key={travel.travel_id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {new Date(travel.travel_date).toLocaleDateString()}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 text-sky-600" />
                            <span className="text-sky-600 font-medium">{travel.departure_name}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <MapPin className="h-3 w-3 text-orange-600" />
                            <span className="text-orange-600 font-medium">{travel.arrival_name}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(travel.travel_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {travel.price.toLocaleString()} XOF
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Available
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/bookings">
                      View All Travels
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - User Stats & Quick Actions */}
          <div className="space-y-6">
            {/* User Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  Your Travel Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TicketIcon className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{stats.userBookingCount}</p>
                      <p className="text-sm text-gray-600">Your Bookings</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{stats.userDestinations}</p>
                      <p className="text-sm text-gray-600">Destinations Visited</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{stats.memberStatus}</p>
                      <p className="text-sm text-gray-600">Member Status</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Offers */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-orange-600" />
                  Special Offers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-orange-800">Early Bird Discount</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Book 7 days in advance and save 15%
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-orange-800">Group Travel</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Travel with 4+ people and get 20% off
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Call to Action */}
        <div className="mt-12">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Discover amazing destinations, book your tickets, and create unforgettable memories. 
                Your next adventure is just a click away!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/dashboard/bookings">
                    <TicketIcon className="h-5 w-5 mr-2" />
                    Book Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/dashboard/travels">
                    <Bus className="h-5 w-5 mr-2" />
                    View Routes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
