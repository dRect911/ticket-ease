"use client"

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { travelSchema, Travel, Bus, Route } from '@/types';
import { getAllBuses, getAllRoutes, createTravel } from '@/utils/supabase/queries';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Select } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Check, ChevronsUpDown, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from './ui/button';
import { Input } from './ui/input';

const TravelForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<Travel>({
    resolver: zodResolver(travelSchema),
  });

    // 1. Define your form.
    const form = useForm<Travel>({
        resolver: zodResolver(travelSchema),
        /* defaultValues: {
          email: "",
          password: "",
        }, */
      });

  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [busValue, setBusValue] = useState("");
  const [routeValue, setRouteValue] = useState("");
  const [busOpen, setBusOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    async function fetchData() {
      const fetchedBuses = await getAllBuses();
      const fetchedRoutes = await getAllRoutes();
      setBuses(fetchedBuses);
      setRoutes(fetchedRoutes);
    }
    fetchData();
  }, []);

  const onSubmit = async (data: Travel) => {
    const result = await createTravel(data);
    if (result) {
      console.log('Travel created:', result);
    } else {
      console.error('Error creating travel');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>

        <FormField
          control={control}
          name="bus_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bus</FormLabel>
              <Popover open={busOpen} onOpenChange={setBusOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={busOpen}
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? buses.find(bus => bus.bus_id === field.value)?.plate_number
                        : "Select bus..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search bus..." />
                    <CommandEmpty>No bus found.</CommandEmpty>
                    <CommandGroup>
                      {buses.map((bus) => (
                        <CommandItem
                          key={bus.bus_id}
                          onSelect={() => { field.onChange(bus.bus_id); setBusOpen(false); }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", field.value === bus.bus_id ? "opacity-100" : "opacity-0")}
                          />
                          {bus.plate_number}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage>{errors.bus_id?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="route_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route</FormLabel>
              <Popover open={routeOpen} onOpenChange={setRouteOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={routeOpen}
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? routes.find(route => route.route_id === field.value)?.start_location_id + ' - ' + routes.find(route => route.route_id === field.value)?.end_location_id
                        : "Select route..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search route..." />
                    <CommandEmpty>No route found.</CommandEmpty>
                    <CommandGroup>
                      {routes.map((route) => (
                        <CommandItem
                          key={route.route_id}
                          onSelect={() => { field.onChange(route.route_id); setRouteOpen(false); }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", field.value === route.route_id ? "opacity-100" : "opacity-0")}
                          />
                          {route.start_location_id} - {route.end_location_id}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage>{errors.route_id?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage>{errors.price?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="travel_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Travel Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage>{errors.travel_date?.message}</FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit">Create Travel</Button>
      </form>
    </Form>
  );
};

export default TravelForm;
