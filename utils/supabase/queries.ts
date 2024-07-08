import { SupabaseClient, User } from "@supabase/supabase-js";
import { cache } from "react";
import { supabase } from "./client";
import {
  Bus,
  Location,
  Route,
  Travel,
  Ticket,
  Booking,
  bookingSchema,
  // routeSchema,
  busSchema,
  travelSchema,
  ticketSchema,
} from "@/types";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";



/* CREATE ACTIONS */

export async function createLocation(
  location_name: string
): Promise<Location | null | true> {
  try {
    const { data, error } = await supabase
      .from("locations")
      .insert({ location_name });

    if (error) throw error;

    if (data) return data as Location; // Assuming single record inserted
    return true;
  } catch (error) {
    console.error("Error creating location:", error);
    
    return null;
  }
}
const routeSchema = z.object({
  start_location_id: z.string().min(1, "Start location is required"),
  end_location_id: z.string().min(1, "End location is required"),
  distance: z.number().positive("Distance must be a positive number").transform((val) => parseFloat(val as any))
  .refine((val) => !isNaN(val) && val > 0, {
    message: "Distance must be a positive number",
  }),
  duration: z.string().min(1),
}).refine((data) => data.start_location_id !== data.end_location_id, {
  message: "Start and end locations must be different",
  path: ["end_location_id"], // specify the path to show the error
});
export async function createRoute(
  route: z.infer<typeof routeSchema >
): Promise<Route | null | true> {
  try {
    const { data, error } = await supabase.from("routes").insert(route);

    if (error) throw error;

    if (data) return data[0] as Route; // Assuming single record inserted
    return true;
  } catch (error) {
    console.error("Error creating route:", error);
    return null;
  }
}

export async function createBus(
  bus: z.infer<typeof busSchema>
): Promise<Bus | null> {
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

export async function createTravel(
  travel: z.infer<typeof travelSchema>
): Promise<Travel | null> {
  try {
    const { data, error } = await supabase.from("travels").insert(travel);

    if (error) throw error;

    if (data) return data?.[0] as Travel; // Check for both data and data[0] being defined
    return null;
  } catch (error) {
    console.error("Error creating travel:", error);
    return null;
  }
}

export async function createTicket(
  ticket: z.infer<typeof ticketSchema>
): Promise<Ticket | null> {
  try {
    const { data, error } = await supabase.from("tickets").insert(ticket);

    if (error) throw error;

    if (data) return data[0] as Ticket; // Assuming single record inserted
    return null;
  } catch (error) {
    console.error("Error creating ticket:", error);
    return null;
  }
}

export async function createBooking(
  booking: z.infer<typeof bookingSchema>
): Promise<Booking | null> {
  try {
    const { data, error } = await supabase.from("bookings").insert(booking);

    if (error) throw error;

    if (data) return data[0] as Booking; // Assuming single record inserted
    return null;
  } catch (error) {
    console.error("Error creating booking:", error);
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

export async function getLocationById(locationId: string): Promise<Location | null> {
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

export async function getLocationNameById(locationId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("location_name")
      .eq("location_id", locationId)
      .single();

    if (error) throw error;

    if (!data) return null;

    return data.location_name;
  } catch (error) {
    console.error("Error fetching location name:", error);
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

export async function getRouteIdByTravelId(travelId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("travels")
      .select("route_id")
      .eq("travel_id", travelId)
      .single();

    if (error) throw error;

    if (!data) return null;

    return data.route_id;
  } catch (error) {
    console.error("Error fetching route ID:", error);
    return null;
  }
}


export async function getRouteLocations(routeId: string): Promise<{ startLocationId: string; endLocationId: string } | null> {
  try {
    const { data, error } = await supabase
      .from("routes")
      .select("start_location_id, end_location_id")
      .eq("route_id", routeId)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      startLocationId: data.start_location_id,
      endLocationId: data.end_location_id,
    };
  } catch (error) {
    console.error("Error fetching route locations:", error);
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

export async function getPlateNumberByBusId(busId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("buses")
      .select("plate_number")
      .eq("bus_id", busId)
      .single();

    if (error) throw error;

    if (!data) return null;

    return data.plate_number;
  } catch (error) {
    console.error("Error fetching plate number:", error);
    return null;
  }
}

export async function getDriverIdByBusId(busId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("buses")
      .select("driver_id")
      .eq("bus_id", busId)
      .single();

    if (error) throw error;

    if (!data) return null;

    return data.driver_id;
  } catch (error) {
    console.error("Error fetching driver ID:", error);
    return null;
  }
}


export async function getBusIdByTravelId(travelId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("travels")
      .select("bus_id")
      .eq("travel_id", travelId)
      .single();

    if (error) throw error;

    if (!data) return null;

    return data.bus_id;
  } catch (error) {
    console.error("Error fetching bus ID:", error);
    return null;
  }
}


export async function getAllTravels(): Promise<Travel[]> {
  try {
    const { data, error } = await supabase.from("travels").select("*");

    if (error) throw error;

    return data as Travel[];
  } catch (error) {
    console.error("Error fetching travels:", error);
    return [];
  }
}

export async function getTravelById(travelId: string): Promise<Travel | null> {
  try {
    const { data, error } = await supabase
      .from("travels")
      .select("*")
      .eq("travel_id", travelId);

    if (error) throw error;

    return (data[0] as Travel) || null; // Check for empty data
  } catch (error) {
    console.error("Error fetching travel:", error);
    return null;
  }
}

export async function getLatestTravels(amount: number): Promise<Travel[]> {
  if (amount > 0) {
    amount = Math.min(amount, 100); // Limit to 100 records for performance reasons
    try {
    const { data, error } = await supabase
      .from("travels")
      .select("*")
      .order("travel_date", { ascending: false })
      .limit(amount);

    if (error) throw error;

    return data as Travel[];
  } catch (error) {
    console.error("Error fetching latest travels:", error);
    return [];
  }
  }else{
    console.log("Invalid amount. Please provide a positive integer.");
    return [];
  }
}

export async function getAllTickets(): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase.from("tickets").select("*");

    if (error) throw error;

    return data as Ticket[];
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
}

export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("ticket_id", ticketId);

    if (error) throw error;

    return (data[0] as Ticket) || null; // Check for empty data
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return null;
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase.from("bookings").select("*");

    if (error) throw error;

    return data as Booking[];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function getBookingById(
  bookingId: string
): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_id", bookingId);

    if (error) throw error;

    return (data[0] as Booking) || null; // Check for empty data
  } catch (error) {
    console.error("Error fetching booking:", error);
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
      .from("travels")
      .update(travelData)
      .eq("travel_id", travel_id);

    if (error) throw error;

    return { ...travel }; // Return updated travel object
  } catch (error) {
    console.error("Error updating travel:", error);
    return null;
  }
}

export async function updateTicket(ticket: Ticket): Promise<Ticket | null> {
  const { ticket_id, ...ticketData } = ticket; // Destructure ticket_id for update

  try {
    const { data, error } = await supabase
      .from("tickets")
      .update(ticketData)
      .eq("ticket_id", ticket_id);

    if (error) throw error;

    return { ...ticket }; // Return updated ticket object
  } catch (error) {
    console.error("Error updating ticket:", error);
    return null;
  }
}

export async function updateBooking(booking: Booking): Promise<Booking | null> {
  const { booking_id, ...bookingData } = booking; // Destructure booking_id for update

  try {
    const { data, error } = await supabase
      .from("bookings")
      .update(bookingData)
      .eq("booking_id", booking_id);

    if (error) throw error;

    return { ...booking }; // Return updated booking object
  } catch (error) {
    console.error("Error updating booking:", error);
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
      .from("travels")
      .delete()
      .eq("travel_id", travelId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting travel:", error);
    return false;
  }
}

export async function deleteTicket(ticketId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("ticket_id", ticketId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return false;
  }
}

export async function deleteBooking(bookingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("booking_id", bookingId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting booking:", error);
    return false;
  }
}
