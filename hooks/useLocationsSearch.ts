import { useState, useEffect } from "react";
import { getAllLocations } from "@/utils/supabase/queries";

export function useLocationsSearch(query: string) {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const handler = setTimeout(async () => {
      const all = await getAllLocations();
      const filtered = all.filter((loc: any) =>
        loc.location_name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  return { results, isLoading };
} 