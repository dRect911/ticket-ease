import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLocationsSearch } from "@/hooks/useLocationsSearch";
import { Search, MapPin, Loader2 } from "lucide-react";

interface Location {
  location_id: string;
  location_name: string;
}

interface RouteSearchBarProps {
  onSelect: (location: Location) => void;
}

const RouteSearchBar: React.FC<RouteSearchBarProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { results, isLoading } = useLocationsSearch(query);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by location name (departure or arrival)"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="w-full pl-10 pr-4 py-3 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg"
        />
      </div>
      
      {showSuggestions && query && (
        <Card className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-4 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching locations...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No locations found</p>
                <p className="text-xs text-gray-400">Try a different search term</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {results.map(loc => (
                  <button
                    key={loc.location_id}
                    className="block w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center gap-3 group"
                    onMouseDown={() => {
                      onSelect(loc);
                      setQuery(loc.location_name);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-150">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                        {loc.location_name}
                      </div>
                      <div className="text-sm text-gray-500">Available for booking</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RouteSearchBar; 