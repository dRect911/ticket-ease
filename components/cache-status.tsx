"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import useSWR from 'swr';

interface CacheStatusProps {
  cacheKey: string;
  label?: string;
  showIcon?: boolean;
}

export default function CacheStatus({ cacheKey, label = "Data", showIcon = true }: CacheStatusProps) {
  const { data, error, isValidating, mutate } = useSWR(cacheKey);

  const getStatusInfo = () => {
    if (error) {
      return {
        status: 'error',
        icon: <AlertCircle className="h-3 w-3" />,
        color: 'destructive',
        text: 'Error',
        tooltip: 'Failed to load data'
      };
    }
    
    if (!data) {
      return {
        status: 'loading',
        icon: <RefreshCw className="h-3 w-3 animate-spin" />,
        color: 'secondary',
        text: 'Loading',
        tooltip: 'Loading data...'
      };
    }
    
    if (isValidating) {
      return {
        status: 'revalidating',
        icon: <RefreshCw className="h-3 w-3 animate-spin" />,
        color: 'default',
        text: 'Updating',
        tooltip: 'Refreshing data...'
      };
    }
    
    return {
      status: 'success',
      icon: <CheckCircle className="h-3 w-3" />,
      color: 'default',
      text: 'Fresh',
      tooltip: 'Data is up to date'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={statusInfo.color as any} 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => mutate()}
          >
            {showIcon && statusInfo.icon}
            <span className="ml-1">{label}: {statusInfo.text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusInfo.tooltip}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click to refresh
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Cache status overview component
export function CacheOverview() {
  const { data: bookings } = useSWR('bookings');
  const { data: travels } = useSWR('travels');
  const { data: profiles } = useSWR('profiles');
  const { data: locations } = useSWR('locations');

  const allDataLoaded = bookings && travels && profiles && locations;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>
        Cache: {allDataLoaded ? 'Ready' : 'Loading...'}
      </span>
      {allDataLoaded && (
        <Badge variant="outline" className="text-xs">
          {bookings?.length || 0} bookings
        </Badge>
      )}
    </div>
  );
} 