import { z } from "zod";

export const locationSchema = z.object({
  location_id: z.string().uuid(), // Assuming UUID for location_id
  location_name: z.string().min(1), // Location name must not be empty
});

export interface Location extends z.infer<typeof locationSchema> {}

export const routeSchema = z.object({
  route_id: z.string().uuid(), // Assuming UUID for route_id
  start_location_id: z.string().uuid(), // Assuming UUID for location_id
  end_location_id: z.string().uuid(), // Assuming UUID for location_id
  distance: z.number().positive(), // Distance must be positive
  duration: z.string().min(1), // Duration must not be empty
});

export interface Route extends z.infer<typeof routeSchema> {}

export const busSchema = z.object({
  bus_id: z.string().uuid(), // Assuming UUID for bus_id
  plate_number: z
    .string()
    .min(1)
    .regex(/^[A-Z]{2}-\d{4}$/, "Plate number must be in AA-0000 format"), // Plate number validation
  capacity: z.number().positive().int(), // Capacity must be a positive integer
  driver_id: z.string().uuid().optional(), // Driver ID can be optional (null)
});

export interface Bus extends z.infer<typeof busSchema> {}

export const travelSchema = z.object({
  travel_id: z.string().uuid(), // Assuming UUID for travel_id
  bus_id: z.string().uuid(), // References buses(bus_id)
  route_id: z.string().uuid(), // References routes(route_id)
  price: z.number().positive().int(),
  travel_date: z.date(), // Travel date must be a valid date
});

export interface Travel extends z.infer<typeof travelSchema> {}

export const ticketSchema = z.object({
  ticket_id: z.string().uuid(), // Assuming UUID for ticket_id
  travel_id: z.string().uuid(), // References travels(travel_id)
  seat_number: z.number().positive().int(), // Seat number must be positive integer
  status: z.enum(["booked", "available"]), // Status must be either 'booked' or 'available'
});

export interface Ticket extends z.infer<typeof ticketSchema> {}

export const bookingSchema = z.object({
  booking_id: z.string().uuid(), // Assuming UUID for booking_id
  user_id: z.string().uuid(), // References users(user_id)
  ticket_id: z.string().uuid(), // References tickets(ticket_id)
  booking_date: z.date().optional(), // Allow optional booking_date (defaults to now())
});

export interface Booking extends z.infer<typeof bookingSchema> {}

export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["user", "admin", "driver"]),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
});

export interface Profile extends z.infer<typeof profileSchema> {}