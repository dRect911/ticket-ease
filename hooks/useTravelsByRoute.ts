import { useState, useEffect } from "react";
import { getAllTravels } from "@/utils/supabase/queries";

export function useTravelsByRoute(routeId?: string) {
  const [travels, setTravels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!routeId) {
      setTravels([]);
      return;
    }
    setIsLoading(true);
    (async () => {
      const all = await getAllTravels();
      const now = new Date();
      const filtered = all.filter((travel: any) =>
        travel.route_id === routeId && new Date(travel.travel_date) >= now
      );
      setTravels(filtered);
      setIsLoading(false);
    })();
  }, [routeId]);

  return { travels, isLoading };
} 