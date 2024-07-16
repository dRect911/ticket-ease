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
  Profile,
  routeSchema,
} from "@/types";
import { z } from "zod";

/* CREATE ACTIONS */

/**
 * Creates a new profile in the database.
 *
 * @param profileData - The profile data to be inserted.
 * @returns A promise that resolves to the newly created profile if successful, or undefined if an error occurs.
 * @throws An error if the insertion fails.
 */
export async function createProfile(
  profileData: Profile
): Promise<Profile | undefined> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert([profileData]);

    if (error) throw error;

    if (data) return data[0] as Profile;
  } catch (error) {
    console.error("Error creating profile:", error);
  }
}

/**
 * Creates a new location in the database.
 *
 * @param location_name - The name of the location to be created.
 * @returns A Promise that resolves with the created Location object if successful, true if the record was inserted but not returned, or null if an error occurs.
 */
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

/* const routeSchema = z
  .object({
    start_location_id: z.string().min(1, "Start location is required"),
    end_location_id: z.string().min(1, "End location is required"),
    distance: z
      .number()
      .positive("Distance must be a positive number")
      .transform((val) => parseFloat(val as any))
      .refine((val) => !isNaN(val) && val > 0, {
        message: "Distance must be a positive number",
      }),
    duration: z.string().min(1),
  })
  .refine((data) => data.start_location_id !== data.end_location_id, {
    message: "Start and end locations must be different",
    path: ["end_location_id"], // specify the path to show the error
  }); */


/**
 * Creates a new route in the database.
 *
 * @param route - The route data to be inserted.
 * @returns A promise that resolves to the newly created route if successful, or undefined if an error occurs.
 * @throws An error if the insertion fails.
 * @see https://www.typescriptlang.org/docs/handbook/writing-modular-code.html#typescript-documentation-comments
 */
export async function createRoute(
  route: Omit<(z.infer<typeof routeSchema>), 'route_id' >
): Promise<Route | null> {
  try {
    const { data, error } = await supabase.from("routes").insert(route).select();

    if (error) throw error;

    if (data) return data[0] as Route; // Assuming single record inserted
    return null
  } catch (error) {
    console.error("Error creating route:", error);
    return null;
  }
}

/**
 * Creates a new bus in the database.
 *
 * @param bus - The bus data to be inserted.
 * @returns A promise that resolves to the newly created bus if successful, or undefined if an error occurs.
 * @throws An error if the insertion fails.
 */
export async function createBus(
  bus: Omit<(z.infer<typeof busSchema>), 'bus_id' >
): Promise<Bus | null> {
  try {
    const { data, error } = await supabase.from("buses").insert(bus).select();

    if (error) throw error;

    if (data) return data[0] as Bus; // Assuming single record inserted
    return null;
  } catch (error) {
    console.error("Error creating bus:", error);
    return null;
  }
}

/**
 * Creates a new travel in the database.
 *
 * @param travel - The travel data to be inserted.
 * @returns A promise that resolves to the newly created travel if successful, or undefined if an error occurs.
 * @throws An error if the insertion fails.
 * @see https://www.typescriptlang.org/docs/handbook/writing-modular-code.html#typescript-documentation-comments
 */
export async function createTravel(
  travel: Omit<(z.infer<typeof travelSchema>), 'travel_id' >
): Promise<Travel | null> {
  try {
    const { data, error } = await supabase.from("travels").insert(travel).select();

    if (error) throw error;

    if (data) return data?.[0] as Travel; // Check for both data and data[0] being defined
    return null;
  } catch (error) {
    console.error("Error creating travel:", error);
    return null;
  }
}

/**
 * Creates a new ticket in the database.
 *
 * @param ticket - The ticket data to be inserted.
 * @returns A promise that resolves to the newly created ticket if successful, or undefined if an error occurs.
 * @throws An error if the insertion fails.
 */
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

export const getUser = cache(async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getAllUsers = async () => {
  try {
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    return users as User[];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

export const getUserData = (
  user: User
): {
  first_name: string;
  last_name: string;
  role: string;
} => {
  return {
    first_name: user.user_metadata.first_name,
    last_name: user.user_metadata.last_name,
    role: user.user_metadata.role,
  };
};

export const getUserRole = async (): Promise<Profile["role"] | null> => {
  try {
    const userId = (await getUser())?.id;

    if (userId) {
      return ((await getProfileById(userId as string)) as Profile).role;
    } else {
      return null;
    }
  } catch {
    console.log("Failed to get user");
    return null;
  }
};

export const getAllProfiles = cache(async (): Promise<Profile[]> => {
  const { data, error } = await supabase.from("profiles").select("*");

  if (error) {
    console.error("Error fetching profiles:", error);
    throw error;
  }

  return data;
});

export const getProfileById = cache(
  async (id: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }
);

async function getActiveDriverIds(): Promise<string[]> {
  const { data, error } = await supabase.from("buses").select("driver_id"); // Get all driver IDs from the buses table

  if (error) {
    console.error("Error fetching active driver IDs:", error);
    throw error;
  }

  return data.map((row) => row.driver_id) as string[]; // Extract and cast IDs to string array
}

async function getAllDriverIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "driver"); // Get IDs of profiles with role "driver"

  if (error) {
    console.error("Error fetching all driver IDs:", error);
    throw error;
  }

  return data.map((row) => row.id) as string[]; // Extract and cast IDs to string array
}

export async function getFreeDrivers(): Promise<Profile[]> {
  const activeDriverIds = await getActiveDriverIds();
  const allDriverIds = await getAllDriverIds();

  // Find free driver IDs (all drivers - active drivers)
  const freeDriverIds = allDriverIds.filter(
    (id) => !activeDriverIds.includes(id)
  );

  // Fetch profiles for free drivers using map and getProfileById
  const freeDrivers = await Promise.all(
    freeDriverIds.map((id) => getProfileById(id))
  );

  return freeDrivers.filter((driver) => driver !== null) as Profile[]; // Filter out any null profiles
}

export const getAllLocations = cache(async (): Promise<Location[]> => {
  try {
    const { data, error } = await supabase.from("locations").select("*");

    if (error) throw error;

    return data as Location[];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
});

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

export const getLocationNameById = cache(async (locationId: string): Promise<string | null> => {
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
});

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

export async function getRouteIdByTravelId(
  travelId: string
): Promise<string | null> {
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

export async function getRouteLocations(
  routeId: string
): Promise<{ startLocationId: string; endLocationId: string } | null> {
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

export const getAllBuses = cache(async (): Promise<Bus[]> => {
  try {
    const { data, error } = await supabase.from("buses").select("*");

    if (error) throw error;

    return data as Bus[];
  } catch (error) {
    console.error("Error fetching buses:", error);
    return [];
  }
});

export async function getBusesWithDrivers(): Promise<Bus[]> {
  try {
    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .not("driver_id", "is", null);

    if (error) throw error;

    return data as Bus[]; // Ensure the data is typed as an array of Bus
  } catch (error) {
    console.error("Error fetching buses with drivers:", error);
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



export async function getPlateNumbers(): Promise<string[]> {
  const { data, error } = await supabase.from("buses").select("plate_number"); // Get all plate numbers from the buses table

  if (error) {
    console.error("Error fetching active driver IDs:", error);
    throw error;
  }

  return data.map((row) => row.plate_number) as string[]; // Extract and cast plate numbers to string array
}

export async function getPlateNumberByBusId(
  busId: string
): Promise<string | null> {
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

export async function getDriverIdByBusId(
  busId: string
): Promise<string | null> {
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

export async function getBusIdByTravelId(
  travelId: string
): Promise<string | null> {
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

export const getAllTravels = cache(async (): Promise<Travel[]> => {
  try {
    const { data, error } = await supabase.from("travels").select("*");

    if (error) throw error;

    return data as Travel[];
  } catch (error) {
    console.error("Error fetching travels:", error);
    return [];
  }
});

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
  } else {
    console.log("Invalid amount. Please provide a positive integer.");
    return [];
  }
}

export const getAllTickets = cache(async (): Promise<Ticket[]> => {
  try {
    const { data, error } = await supabase.from("tickets").select("*");

    if (error) throw error;

    return data as Ticket[];
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
});

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

export const getAllBookings = cache(async (): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase.from("bookings").select("*");

    if (error) throw error;

    return data as Booking[];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
});

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

/**
 * Updates the profile data in the database.
 *
 * @param profileData - The profile data to be updated. This should be a partial object, meaning only the fields that need to be updated should be included.
 * @returns A promise that resolves to the updated profile if successful, or undefined if an error occurs.
 * @throws An error if the update fails.
 * @see https://www.typescriptlang.org/docs/handbook/writing-modular-code.html#typescript-documentation-comments
 */
export async function updateProfile(
  profileData: Partial<Profile>
): Promise<Profile | undefined> {
  const { id, ...profileUpdates } = profileData; // Destructure ID and updates

  const { data, error } = await supabase
    .from("profiles")
    .update(profileUpdates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
  if (data) return data[0];
}

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

    if (error) {
      throw error;
    }

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

export async function deleteProfile(id: string): Promise<boolean | undefined> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) throw error;

    if (data) return true;
  } catch (error) {
    console.error("Error deleting profile:", error);
    return false;
  }
}
