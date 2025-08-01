'use client'
import React, { useState, useEffect } from "react";
import RouteSearchBar from "@/components/RouteSearchBar";
import RouteList from "@/components/RouteList";
import TravelList from "@/components/TravelList";
import SeatSelection from "@/components/SeatSelection";
import PaymentModal from "@/components/PaymentModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Route as RouteIcon, 
  Bus, 
  Ticket, 
  CheckCircle2,
  MapPin,
  Calendar,
  Clock
} from "lucide-react";
import { getAllLocations } from "@/utils/supabase/queries";
import { useToast } from "@/components/ui/use-toast";
import { Travel } from "@/types";

interface Location {
  location_id: string;
  location_name: string;
}

interface Route {
  route_id: string;
  start_location_id: string;
  end_location_id: string;
}

export default function UserBookingPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getAllLocations().then(setLocations);
  }, []);

  const getLocationName = (id: string) =>
    locations.find((l) => l.location_id === id)?.location_name || "Unknown";

  const steps = [
    { id: 1, title: "Search Location", icon: Search, completed: !!selectedLocation },
    { id: 2, title: "Select Route", icon: RouteIcon, completed: !!selectedRoute },
    { id: 3, title: "Choose Travel", icon: Bus, completed: !!selectedTravel },
    { id: 4, title: "Book Seat", icon: Ticket, completed: !!selectedSeat }
  ];

  const handleSeatSelected = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Booking Confirmed! 🎉",
      description: "Your seat has been successfully booked. Check your email for confirmation details.",
    });
    
    // Reset the entire booking flow
    setSelectedLocation(null);
    setSelectedRoute(null);
    setSelectedTravel(null);
    setSelectedSeat(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Journey</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search for your destination, find the perfect route, and secure your seat in just a few clicks.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.completed ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Search and Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Search className="h-6 w-6 text-blue-600" />
                  Where would you like to go?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RouteSearchBar onSelect={loc => {
                  setSelectedLocation(loc);
                  setSelectedRoute(null);
                  setSelectedTravel(null);
                  setSelectedSeat(null);
                }} />
              </CardContent>
            </Card>

            {/* Routes Section */}
            <RouteList
              location={selectedLocation}
              onSelect={route => {
                setSelectedRoute(route);
                setSelectedTravel(null);
                setSelectedSeat(null);
              }}
            />

            {/* Travels Section */}
            <TravelList
              route={selectedRoute}
              onSelect={travel => {
                setSelectedTravel(travel);
                setSelectedSeat(null);
              }}
            />

            {/* Seat Selection */}
            {selectedTravel && (
              <SeatSelection
                travel={selectedTravel}
                onSeatSelected={handleSeatSelected}
              />
            )}

            {/* Book Now Button */}
            {selectedSeat && selectedTravel && (
              <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Ready to Book!</h3>
                        <p className="text-sm text-gray-600">Seat {selectedSeat} selected</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                    >
                      <Ticket className="w-5 h-5 mr-2" />
                      Book Now - {selectedTravel.price.toLocaleString()} XOF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary and Help */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedLocation ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedLocation.location_name}</p>
                      <p className="text-sm text-gray-600">Selected location</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No location selected</p>
                  </div>
                )}

                {selectedRoute && (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                    <RouteIcon className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {getLocationName(selectedRoute.start_location_id)} → {getLocationName(selectedRoute.end_location_id)}
                      </p>
                      <p className="text-sm text-gray-600">Selected route</p>
                    </div>
                  </div>
                )}

                {selectedTravel && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Bus className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedTravel.travel_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedTravel.price} XOF
                      </p>
                    </div>
                  </div>
                )}

                {selectedSeat && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Ticket className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Seat {selectedSeat}</p>
                      <p className="text-sm text-gray-600">Selected seat</p>
                    </div>
                  </div>
                )}

                {!selectedLocation && !selectedRoute && !selectedTravel && !selectedSeat && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Start by searching for a location</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-indigo-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Search for your destination</p>
                    <p className="text-xs text-gray-600">Type any city or location name</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-indigo-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Choose your route</p>
                    <p className="text-xs text-gray-600">Select from available routes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-indigo-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pick your travel time</p>
                    <p className="text-xs text-gray-600">Select date and time that works for you</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-indigo-600">4</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Book your seat</p>
                    <p className="text-xs text-gray-600">Choose your preferred seat and confirm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Modal */}
        {selectedTravel && selectedSeat && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            travel={selectedTravel}
            seatNumber={selectedSeat}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </main>
    </div>
  );
}