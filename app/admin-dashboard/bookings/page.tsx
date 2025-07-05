"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BookingTable from "@/components/booking-table";
import BookingStats from "@/components/booking-stats";
import { useBookings, usePrefetchData } from "@/hooks/useCachedData";
import { Skeleton } from "@/components/ui/skeleton";
import { CacheOverview } from "@/components/cache-status";

const Bookings = () => {
  // Use cached bookings with high urgency (real-time data)
  const { data: bookings, error, isLoading } = useBookings();
  
  // Prefetch other data for better UX
  const { isReady: isDataReady } = usePrefetchData();

  if (error) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error loading bookings</div>
            <div className="text-muted-foreground">Please try refreshing the page</div>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <Skeleton className="h-8 w-64" />
        </div>
        
        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Bookings Management</h1>
        <CacheOverview />
      </div>
      
      {/* Enhanced Stats Section */}
      <BookingStats bookings={bookings || []} />

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            Manage and view all customer bookings with detailed information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingTable />
        </CardContent>
      </Card>
    </main>
  );
};

export default Bookings;