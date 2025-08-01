import { useState, useEffect } from "react";
import { getAllRoutes } from "@/utils/supabase/queries";

export function useRoutesByLocation(locationId?: string) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!locationId) {
      setRoutes([]);
      return;
    }
    setIsLoading(true);
    (async () => {
      const all = await getAllRoutes();
      const filtered = all.filter((route: any) =>
        route.start_location_id === locationId || route.end_location_id === locationId
      );
      setRoutes(filtered);
      setIsLoading(false);
    })();
  }, [locationId]);

  return { routes, isLoading };
} 