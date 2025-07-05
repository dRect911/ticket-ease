import { SWRConfiguration } from 'swr';

// Cache configuration based on data urgency
export const cacheConfig = {
  // High urgency - real-time data that changes frequently
  high: {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // 30 seconds
    dedupingInterval: 10000, // 10 seconds
  } as SWRConfiguration,

  // Medium urgency - data that changes occasionally
  medium: {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 60000, // 1 minute
    dedupingInterval: 30000, // 30 seconds
  } as SWRConfiguration,

  // Low urgency - data that changes rarely
  low: {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 300000, // 5 minutes
    dedupingInterval: 60000, // 1 minute
  } as SWRConfiguration,

  // Static data - rarely changes
  static: {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0, // No auto refresh
    dedupingInterval: 300000, // 5 minutes
  } as SWRConfiguration,
};

// Cache keys for different data types
export const cacheKeys = {
  // High urgency - real-time booking data
  bookings: 'bookings',
  recentBookings: 'recent-bookings',
  
  // Medium urgency - travel and ticket data
  travels: 'travels',
  tickets: 'tickets',
  
  // Low urgency - user profiles and bus data
  profiles: 'profiles',
  buses: 'buses',
  
  // Static data - locations and routes
  locations: 'locations',
  routes: 'routes',
  
  // Composite keys for detailed data
  bookingDetails: (bookingId: string) => `booking-details-${bookingId}`,
  travelDetails: (travelId: string) => `travel-details-${travelId}`,
  userProfile: (userId: string) => `user-profile-${userId}`,
  busDetails: (busId: string) => `bus-details-${busId}`,
  locationDetails: (locationId: string) => `location-details-${locationId}`,
  routeDetails: (routeId: string) => `route-details-${routeId}`,
};

// Cache invalidation helpers
export const invalidateCache = {
  bookings: () => {
    // Invalidate all booking-related cache
    if (typeof window !== 'undefined' && window.swr) {
      window.swr.mutate(cacheKeys.bookings);
      window.swr.mutate(cacheKeys.recentBookings);
    }
  },
  
  travel: (travelId?: string) => {
    if (typeof window !== 'undefined' && window.swr) {
      window.swr.mutate(cacheKeys.travels);
      if (travelId) {
        window.swr.mutate(cacheKeys.travelDetails(travelId));
      }
    }
  },
  
  user: (userId?: string) => {
    if (typeof window !== 'undefined' && window.swr) {
      window.swr.mutate(cacheKeys.profiles);
      if (userId) {
        window.swr.mutate(cacheKeys.userProfile(userId));
      }
    }
  },
  
  all: () => {
    if (typeof window !== 'undefined' && window.swr) {
      // Invalidate all cache
      window.swr.mutate(() => true, undefined, { revalidate: true });
    }
  },
};

// Extend Window interface for SWR
declare global {
  interface Window {
    swr?: {
      mutate: (key: any, data?: any, options?: any) => void;
    };
  }
} 