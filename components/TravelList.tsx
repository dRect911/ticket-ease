import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTravelsByRoute } from "@/hooks/useTravelsByRoute";
import { Calendar, Bus, DollarSign, Clock, ArrowRight } from "lucide-react";
import { getAllLocations } from "@/utils/supabase/queries";

interface Location {
  location_id: string;
  location_name: string;
}

interface Route {
  route_id: string;
  start_location_id: string;
  end_location_id: string;
}

interface Travel {
  travel_id: string;
  travel_date: Date;
  price: number;
  bus_id: string;
  route_id: string;
}

interface TravelListProps {
  route: Route | null;
  onSelect: (travel: Travel) => void;
}

const TravelList: React.FC<TravelListProps> = ({ route, onSelect }) => {
  const { travels, isLoading } = useTravelsByRoute(route?.route_id);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    getAllLocations().then(setLocations);
  }, []);

  const getLocationName = (id: string) =>
    locations.find((l) => l.location_id === id)?.location_name || "Unknown";

  if (!route) return null;

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Bus className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Travels
            </h3>
            <p className="text-sm text-gray-600">
              {getLocationName(route.start_location_id)} → {getLocationName(route.end_location_id)}
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
              <p className="text-gray-600">Loading travels...</p>
            </div>
          </div>
        ) : travels.length === 0 ? (
          <div className="text-center py-8">
            <Bus className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium">No upcoming travels</p>
            <p className="text-sm text-gray-500">No scheduled travels for this route</p>
          </div>
        ) : (
          <div className="space-y-3">
            {travels.map(travel => (
              <button
                key={travel.travel_id}
                className="w-full text-left p-4 hover:bg-green-50 rounded-xl border border-gray-100 hover:border-green-200 transition-all duration-200 group"
                onClick={() => onSelect(travel)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-sky-100 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-sky-200 transition-all duration-200">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                          {new Date(travel.travel_date).toLocaleDateString("en-US", { 
                            weekday: 'short',
                            month: "short", 
                            day: "numeric" 
                          })}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(travel.travel_date).toLocaleTimeString("en-US", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <span className="font-semibold text-emerald-600 text-lg">
                          {travel.price.toLocaleString()} XOF
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 group-hover:text-green-600 transition-colors duration-200">
                      Select travel
                    </span>
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                      <ArrowRight className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TravelList; 