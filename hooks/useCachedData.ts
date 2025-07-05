import useSWR from 'swr';
import { cacheConfig, cacheKeys } from '@/utils/cache-config';
import {
  getAllBookings,
  getLatestBookings,
  getAllTravels,
  getAllTickets,
  _getAllTickets,
  getAllProfiles,
  getAllBuses,
  getAllLocations,
  getAllRoutes,
  getProfileById,
  getTravelById,
  getTicketById,
  getBusById,
  getLocationById,
  getRouteById,
} from '@/utils/supabase/queries';

// High urgency data hooks (real-time)
export function useBookings() {
  return useSWR(cacheKeys.bookings, getAllBookings, cacheConfig.high);
}

export function useRecentBookings(amount: number = 5) {
  return useSWR(
    `${cacheKeys.recentBookings}-${amount}`,
    () => getLatestBookings(amount),
    cacheConfig.high
  );
}

// Medium urgency data hooks (occasionally changes)
export function useTravels() {
  return useSWR(cacheKeys.travels, getAllTravels, cacheConfig.medium);
}

export function useTickets() {
  return useSWR(cacheKeys.tickets, _getAllTickets, cacheConfig.medium);
}

export function useTravelDetails(travelId: string) {
  return useSWR(
    travelId ? cacheKeys.travelDetails(travelId) : null,
    () => getTravelById(travelId),
    cacheConfig.medium
  );
}

export function useTicketDetails(ticketId: string) {
  return useSWR(
    ticketId ? `ticket-details-${ticketId}` : null,
    () => getTicketById(ticketId),
    cacheConfig.medium
  );
}

// Low urgency data hooks (rarely changes)
export function useProfiles() {
  return useSWR(cacheKeys.profiles, getAllProfiles, cacheConfig.low);
}

export function useBuses() {
  return useSWR(cacheKeys.buses, getAllBuses, cacheConfig.low);
}

export function useUserProfile(userId: string) {
  return useSWR(
    userId ? cacheKeys.userProfile(userId) : null,
    () => getProfileById(userId),
    cacheConfig.low
  );
}

export function useBusDetails(busId: string) {
  return useSWR(
    busId ? cacheKeys.busDetails(busId) : null,
    () => getBusById(busId),
    cacheConfig.low
  );
}

// Static data hooks (rarely changes)
export function useLocations() {
  return useSWR(cacheKeys.locations, getAllLocations, cacheConfig.static);
}

export function useRoutes() {
  return useSWR(cacheKeys.routes, getAllRoutes, cacheConfig.static);
}

export function useLocationDetails(locationId: string) {
  return useSWR(
    locationId ? cacheKeys.locationDetails(locationId) : null,
    () => getLocationById(locationId),
    cacheConfig.static
  );
}

export function useRouteDetails(routeId: string) {
  return useSWR(
    routeId ? cacheKeys.routeDetails(routeId) : null,
    () => getRouteById(routeId),
    cacheConfig.static
  );
}

// Composite data hooks for booking details
export function useBookingDetails(bookings: any[]) {
  const { data: profiles } = useProfiles();
  const { data: travels } = useTravels();
  const { data: tickets } = useTickets();
  const { data: buses } = useBuses();
  const { data: locations } = useLocations();
  const { data: routes } = useRoutes();

  return {
    profiles,
    travels,
    tickets,
    buses,
    locations,
    routes,
  };
}

// Prefetch hooks for better UX
export function usePrefetchData() {
  const { data: bookings } = useBookings();
  const { data: travels } = useTravels();
  const { data: profiles } = useProfiles();
  const { data: locations } = useLocations();
  const { data: routes } = useRoutes();

  return {
    bookings,
    travels,
    profiles,
    locations,
    routes,
    isReady: !!(bookings && travels && profiles && locations && routes),
  };
} 