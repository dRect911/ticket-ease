import { SupabaseClient, User } from "@supabase/supabase-js";
import { cache } from "react";
import { supabase } from "./client";
import { Bus, Location, Route, Travel } from "@/types";



/* CREATE ACTIONS */

export async function createLocation(
  locationName: string
): Promise<Location | null> {
  try {
    const { data, error } = await supabase
      .from("locations")
      .insert({ locationName });

    if (error) throw error;

    if (data) return data[0] as Location; // Assuming single record inserted
    return null;
  } catch (error) {
    console.error("Error creating location:", error);
    return null;
  }
}

export async function createRoute(route: Route): Promise<Route | null> {
  try {
    const { data, error } = await supabase.from("routes").insert(route);

    if (error) throw error;

    if (data) return data[0] as Route; // Assuming single record inserted
    return null;
  } catch (error) {
    console.error("Error creating route:", error);
    return null;
  }
}

export async function createBus(bus: Bus): Promise<Bus | null> {
  try {
    const { data, error } = await supabase.from("buses").insert(bus);

    if (error) throw error;

    if (data) return data[0] as Bus; // Assuming single record inserted
    return null;
  } catch (error) {
    console.error("Error creating bus:", error);
    return null;
  }
}

export async function createTravel(travel: Travel): Promise<Travel | null> {
  try {
    const { data, error } = await supabase
      .from('travels')
      .insert(travel);

    if (error) throw error;

    if (data) return data?.[0] as Travel; // Check for both data and data[0] being defined
    return null 
  } catch (error) {
    console.error('Error creating travel:', error);
    return null;
  }
}



/* READ ACTIONS */

export const getUser = cache(
  async (supabase: SupabaseClient): Promise<User | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }
);

export const getUserRole = async (
  supabase: SupabaseClient
): Promise<"user" | "admin" | "driver" | null> => {
  try {
    const user = await getUser(supabase);

    if (user) {
      return user.user_metadata.role;
    } else {
      return null;
    }
  } catch {
    console.log("Failed to get user");
    return null;
  }
};

export async function getAllLocations(): Promise<Location[]> {
  try {
    const { data, error } = await supabase.from("locations").select("*");

    if (error) throw error;

    return data as Location[];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function getLocationById(
  locationId: string
): Promise<Location | null> {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("location_id", locationId);

    if (error) throw error;

    return (data[0] as Location) || null; // Check for empty data
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
}

export async function getAllRoutes(): Promise<Route[]> {
  try {
    const { data, error } = await supabase.from("routes").select("*");

    if (error) throw error;

    return data as Route[];
  } catch (error) {
    console.error("Error fetching routes:", error);
    return [];
  }
}
export async function getRouteById(routeId: string): Promise<Route | null> {
  try {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("route_id", routeId);

    if (error) throw error;

    return (data[0] as Route) || null; // Check for empty data
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
}

export async function getAllBuses(): Promise<Bus[]> {
  try {
    const { data, error } = await supabase.from("buses").select("*");

    if (error) throw error;

    return data as Bus[];
  } catch (error) {
    console.error("Error fetching buses:", error);
    return [];
  }
}

export async function getBusById(busId: string): Promise<Bus | null> {
  try {
    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .eq("bus_id", busId);

    if (error) throw error;

    return (data[0] as Bus) || null; // Check for empty data
  } catch (error) {
    console.error("Error fetching bus:", error);
    return null;
  }
}

export async function getAllTravels(): Promise<Travel[]> {
  try {
    const { data, error } = await supabase
      .from('travels')
      .select('*');

    if (error) throw error;

    return data as Travel[];
  } catch (error) {
    console.error('Error fetching travels:', error);
    return [];
  }
}

export async function getTravelById(travelId: string): Promise<Travel | null> {
  try {
    const { data, error } = await supabase
      .from('travels')
      .select('*')
      .eq('travel_id', travelId);

    if (error) throw error;

    return data[0] as Travel || null; // Check for empty data
  } catch (error) {
    console.error('Error fetching travel:', error);
    return null;
  }
}



/* UPDATE ACTIONS */

export async function updateLocation(
  location: Location
): Promise<Location | null> {
  const { location_id, location_name } = location;

  try {
    const { data, error } = await supabase
      .from("locations")
      .update({ location_name })
      .eq("location_id", location_id);

    if (error) throw error;

    return { ...location }; // Return updated location object
  } catch (error) {
    console.error("Error updating location:", error);
    return null;
  }
}

export async function updateRoute(route: Route): Promise<Route | null> {
  const { route_id, ...routeData } = route; // Destructure route_id for update

  try {
    const { data, error } = await supabase
      .from("routes")
      .update(routeData)
      .eq("route_id", route_id);

    if (error) throw error;

    return { ...route }; // Return updated route object
  } catch (error) {
    console.error("Error updating route:", error);
    return null;
  }
}

export async function updateBus(bus: Bus): Promise<Bus | null> {
  const { bus_id, ...busData } = bus; // Destructure bus_id for update

  try {
    const { data, error } = await supabase
      .from("buses")
      .update(busData)
      .eq("bus_id", bus_id);

    if (error) throw error;

    return { ...bus }; // Return updated bus object
  } catch (error) {
    console.error("Error updating bus:", error);
    return null;
  }
}

export async function updateTravel(travel: Travel): Promise<Travel | null> {
  const { travel_id, ...travelData } = travel; // Destructure travel_id for update

  try {
    const { data, error } = await supabase
      .from('travels')
      .update(travelData)
      .eq('travel_id', travel_id);

    if (error) throw error;

    return { ...travel }; // Return updated travel object
  } catch (error) {
    console.error('Error updating travel:', error);
    return null;
  }
}



/* DELETE ACTIONS */

export async function deleteLocation(locationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("location_id", locationId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting location:", error);
    return false;
  }
}

export async function deleteRoute(routeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("routes")
      .delete()
      .eq("routeId", routeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting route:", error);
    return false;
  }
}

export async function deleteBus(busId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("buses").delete().eq("bus_id", busId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting bus", error);
    return false;
  }
}

export async function deleteTravel(travelId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('travels')
      .delete()
      .eq('travel_id', travelId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting travel:', error);
    return false;
  }
}
