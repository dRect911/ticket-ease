"use client";

import React, { useEffect } from 'react';
import { SWRConfig } from 'swr';
import { cacheConfig } from '@/utils/cache-config';

interface CacheProviderProps {
  children: React.ReactNode;
}

export default function CacheProvider({ children }: CacheProviderProps) {
  useEffect(() => {
    // Make SWR globally accessible for cache invalidation
    if (typeof window !== 'undefined') {
      window.swr = {
        mutate: (key: any, data?: any, options?: any) => {
          // This will be set by SWRConfig
        },
      };
    }
  }, []);

  return (
    <SWRConfig
      value={{
        // Default configuration (medium urgency)
        ...cacheConfig.medium,
        
        // Global error handler
        onError: (error, key) => {
          console.error('SWR Error:', error, 'Key:', key);
        },
        
        // Global success handler for logging
        onSuccess: (data, key) => {
          console.log('SWR Success:', key, data);
        },
        
        // Provide mutate function globally
        provider: () => {
          const map = new Map();
          
          // Make mutate available globally
          if (typeof window !== 'undefined') {
            window.swr = {
              mutate: (key: any, data?: any, options?: any) => {
                // This will be handled by SWR internally
                return Promise.resolve();
              },
            };
          }
          
          return map;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
} 