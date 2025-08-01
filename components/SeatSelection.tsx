import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bus, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CreditCard,
  DollarSign
} from "lucide-react";
import { getTicketsByTravelId, getBusById, getBusIdByTravelId } from "@/utils/supabase/queries";

interface Travel {
  travel_id: string;
  travel_date: string | Date;
  price: number;
  bus_id: string;
  route_id: string;
}

interface SeatSelectionProps {
  travel: Travel;
  onSeatSelected: (seatNumber: number) => void;
}

interface Seat {
  number: number;
  isAvailable: boolean;
  isSelected: boolean;
}

export default function SeatSelection({ travel, onSeatSelected }: SeatSelectionProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalSeats, setTotalSeats] = useState(0);
  const [busPlate, setBusPlate] = useState("");

  useEffect(() => {
    const fetchSeatAvailability = async () => {
      try {
        setLoading(true);
        
        // Get bus details to get the actual capacity
        const busId = await getBusIdByTravelId(travel.travel_id);
        const bus = busId ? await getBusById(busId) : null;
        const capacity = bus?.capacity || 30; // Fallback to 30 if bus not found
        setTotalSeats(capacity);
        setBusPlate(bus?.plate_number || "N/A");

        // Get all tickets for this travel to check which seats are taken
        const tickets = await getTicketsByTravelId(travel.travel_id);
        const bookedSeats = tickets
          ? tickets.filter(ticket => ticket.status === "booked")
              .map(ticket => ticket.seat_number)
          : [];

        // Create seat array with availability based on actual bus capacity
        const seatArray: Seat[] = Array.from({ length: capacity }, (_, index) => ({
          number: index + 1,
          isAvailable: !bookedSeats.includes(index + 1),
          isSelected: false,
        }));

        setSeats(seatArray);
      } catch (error) {
        console.error("Error fetching seat availability:", error);
        // Fallback to 30 seats if there's an error
        setTotalSeats(30);
        setBusPlate("N/A");
        const seatArray: Seat[] = Array.from({ length: 30 }, (_, index) => ({
          number: index + 1,
          isAvailable: true,
          isSelected: false,
        }));
        setSeats(seatArray);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatAvailability();
  }, [travel.travel_id]);

  const handleSeatClick = (seatNumber: number) => {
    const seat = seats.find(s => s.number === seatNumber);
    if (seat && seat.isAvailable) {
      // Deselect previous seat
      setSeats(prev => prev.map(s => ({ ...s, isSelected: false })));
      // Select new seat
      setSeats(prev => prev.map(s => 
        s.number === seatNumber ? { ...s, isSelected: true } : s
      ));
      setSelectedSeat(seatNumber);
      onSeatSelected(seatNumber);
    }
  };

  const getSeatClasses = (seat: Seat) => {
    let baseClasses = "w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-200 font-semibold text-sm relative";
    
    if (seat.isSelected) {
      return `${baseClasses} bg-green-500 border-green-600 text-white hover:bg-green-600 shadow-lg`;
    }
    if (!seat.isAvailable) {
      return `${baseClasses} bg-red-500 border-red-600 text-white cursor-not-allowed opacity-80`;
    }
    return `${baseClasses} bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 hover:border-blue-400 hover:shadow-md`;
  };

  const availableSeats = seats.filter(seat => seat.isAvailable).length;
  const bookedSeats = totalSeats - availableSeats;

  // Calculate grid layout based on total seats
  const getGridLayout = () => {
    if (totalSeats <= 20) return "grid-cols-4";
    if (totalSeats <= 30) return "grid-cols-5";
    if (totalSeats <= 40) return "grid-cols-6";
    return "grid-cols-7";
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-blue-600" />
            Loading Seat Availability...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bus className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Checking seat availability...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-6 w-6 text-blue-600" />
          Select Your Seat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bus Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bus className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Bus {busPlate}</p>
                <p className="text-sm text-blue-700">Capacity: {totalSeats} seats</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {availableSeats} Available
            </Badge>
          </div>
        </div>

        {/* Seat Availability Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalSeats}</div>
            <div className="text-sm text-gray-600">Total Seats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{availableSeats}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{bookedSeats}</div>
            <div className="text-sm text-gray-600">Booked</div>
          </div>
        </div>

        {/* Bus Layout */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Bus Layout</h3>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border-2 border-red-600 rounded"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 border-2 border-green-600 rounded"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>

          {/* Driver Area */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg border border-yellow-300">
              <Bus className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Driver</span>
            </div>
          </div>

          {/* Seats Grid */}
          <div className={`grid ${getGridLayout()} gap-3 max-w-4xl mx-auto`}>
            {seats.map((seat) => (
              <button
                key={seat.number}
                className={getSeatClasses(seat)}
                onClick={() => handleSeatClick(seat.number)}
                disabled={!seat.isAvailable}
                title={seat.isAvailable ? `Select seat ${seat.number}` : `Seat ${seat.number} is booked`}
              >
                <span className="text-xs font-bold">{seat.number}</span>
                {seat.isSelected && (
                  <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
                )}
                {!seat.isAvailable && (
                  <XCircle className="absolute -top-1 -right-1 h-4 w-4 text-red-600 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Selected Seat Info */}
          {selectedSeat && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Seat {selectedSeat} Selected</p>
                    <p className="text-sm text-green-600">Ready for booking</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {travel.price} XOF
                </Badge>
              </div>
            </div>
          )}

          {/* Warning if no seats available */}
          {availableSeats === 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">No Available Seats</p>
                  <p className="text-sm text-red-600">This travel is fully booked</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 