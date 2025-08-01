import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRoutesByLocation } from "@/hooks/useRoutesByLocation";
import { MapPin, Route as RouteIcon, ArrowRight, Clock } from "lucide-react";
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

interface RouteListProps {
  location: Location | null;
  onSelect: (route: Route) => void;
}

const RouteList: React.FC<RouteListProps> = ({ location, onSelect }) => {
  const { routes, isLoading } = useRoutesByLocation(location?.location_id);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    getAllLocations().then(setLocations);
  }, []);

  const getLocationName = (id: string) =>
    locations.find((l) => l.location_id === id)?.location_name || "Unknown";

  if (!location) return null;

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <RouteIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Available Routes
            </h3>
            <p className="text-sm text-gray-600">
              From <span className="font-medium text-indigo-700">{location.location_name}</span>
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-600" />
              <p className="text-gray-600">Loading routes...</p>
            </div>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-8">
            <RouteIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium">No routes found</p>
            <p className="text-sm text-gray-500">No routes available from this location</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routes.map(route => (
              <button
                key={route.route_id}
                className="w-full text-left p-4 hover:bg-indigo-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all duration-200 group"
                onClick={() => onSelect(route)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center group-hover:from-sky-200 group-hover:to-blue-200 transition-all duration-200">
                      <MapPin className="h-5 w-5 text-sky-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200">
                        {getLocationName(route.start_location_id)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
                      <span className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200">
                        {getLocationName(route.end_location_id)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors duration-200">
                      Select route
                    </span>
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors duration-200">
                      <ArrowRight className="h-3 w-3 text-indigo-600" />
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

export default RouteList; 