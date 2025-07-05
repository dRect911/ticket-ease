import { mutate } from 'swr';
import { cacheKeys } from './cache-config';

// Cache invalidation utilities
export const cacheUtils = {
  // Invalidate booking-related cache
  invalidateBookings: () => {
    mutate(cacheKeys.bookings);
    mutate(cacheKeys.recentBookings);
  },

  // Invalidate travel-related cache
  invalidateTravels: () => {
    mutate(cacheKeys.travels);
  },

  // Invalidate user-related cache
  invalidateUsers: () => {
    mutate(cacheKeys.profiles);
  },

  // Invalidate bus-related cache
  invalidateBuses: () => {
    mutate(cacheKeys.buses);
  },

  // Invalidate location-related cache
  invalidateLocations: () => {
    mutate(cacheKeys.locations);
  },

  // Invalidate route-related cache
  invalidateRoutes: () => {
    mutate(cacheKeys.routes);
  },

  // Invalidate specific booking
  invalidateBooking: (bookingId: string) => {
    mutate(cacheKeys.bookingDetails(bookingId));
  },

  // Invalidate specific travel
  invalidateTravel: (travelId: string) => {
    mutate(cacheKeys.travelDetails(travelId));
  },

  // Invalidate specific user
  invalidateUser: (userId: string) => {
    mutate(cacheKeys.userProfile(userId));
  },

  // Invalidate all cache
  invalidateAll: () => {
    mutate(() => true, undefined, { revalidate: true } as any);
  },

  // Optimistic update for bookings
  optimisticUpdateBooking: (bookingId: string, newData: any) => {
    // Update the cache immediately with new data
    mutate(cacheKeys.bookings, (currentBookings: any[] | undefined) => {
      if (!currentBookings) return currentBookings;
      return currentBookings.map(booking => 
        booking.booking_id === bookingId ? { ...booking, ...newData } : booking
      );
    }, false); // Don't revalidate immediately
  },

  // Optimistic update for travels
  optimisticUpdateTravel: (travelId: string, newData: any) => {
    mutate(cacheKeys.travels, (currentTravels: any[] | undefined) => {
      if (!currentTravels) return currentTravels;
      return currentTravels.map(travel => 
        travel.travel_id === travelId ? { ...travel, ...newData } : travel
      );
    }, false);
  },
};

// Cache warming utilities
export const cacheWarming = {
  // Prefetch all essential data
  prefetchAll: async () => {
    const prefetchPromises = [
      mutate(cacheKeys.bookings),
      mutate(cacheKeys.travels),
      mutate(cacheKeys.profiles),
      mutate(cacheKeys.locations),
      mutate(cacheKeys.routes),
      mutate(cacheKeys.buses),
    ];

    await Promise.all(prefetchPromises);
  },

  // Prefetch booking-related data
  prefetchBookings: async () => {
    await mutate(cacheKeys.bookings);
    await mutate(cacheKeys.recentBookings);
  },

  // Prefetch travel-related data
  prefetchTravels: async () => {
    await mutate(cacheKeys.travels);
  },
};

// Cache monitoring utilities
export const cacheMonitoring = {
  // Get cache status for a key
  getCacheStatus: (key: string) => {
    // This would need to be implemented with SWR's internal cache
    // For now, we'll return a simple status
    return {
      key,
      timestamp: Date.now(),
      status: 'unknown',
    };
  },

  // Get all cache keys
  getAllCacheKeys: () => {
    return Object.values(cacheKeys).filter(key => typeof key === 'string');
  },

  // Clear specific cache
  clearCache: (key: string) => {
    mutate(key, undefined, { revalidate: false } as any);
  },

  // Clear all cache
  clearAllCache: () => {
    mutate(() => true, undefined, { revalidate: false } as any);
  },
}; 