"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAllLocations,
  createRoute,
  getLocationNameById,
  getAllRoutes,
  getAllBuses,
  createTravel,
  getBusesWithDrivers,
} from "@/utils/supabase/queries";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

import { Bus, Location, Route } from "@/types";
import { ArrowRight, CalendarIcon } from "lucide-react";

const travelFormSchema = z.object({
  bus_id: z.string().uuid(), // References buses(bus_id)
  route_id: z.string().uuid(), // References routes(route_id)
  price: z.number().positive().int(),
  travel_date: z.date(), // Travel date must be a valid date
});

interface RouteDetails extends Route {
  departure_name: string;
  arrival_name: string;
}

const TravelForm = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<RouteDetails[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const form = useForm<z.infer<typeof travelFormSchema>>({
    resolver: zodResolver(travelFormSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const r = await getAllRoutes();
      const routesWithNames = await Promise.all(
        r.map(async (route) => {
          const departure_name = (await getLocationNameById(
            route.start_location_id
          )) as string;
          const arrival_name = (await getLocationNameById(
            route.end_location_id
          )) as string;
          return { ...route, departure_name, arrival_name };
        })
      );
      const b = await getBusesWithDrivers();
      setBuses(b);
      setRoutes(routesWithNames);
    };

    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof travelFormSchema>) => {
    /* if (values.start_location_id === values.end_location_id) {
      toast({
        variant: "destructive",
        title: "Start and end locations must be different.",
      });
      return;
    } */

    const createdTravel = await createTravel(values);
    if (createdTravel) {
      toast({
        title: "Travel scheduled added successfully",
        description: "Check tickets and bookings for more.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">New Travel</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a new travel</SheetTitle>
          <SheetDescription>Add a travel to sell ticekts cuh</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="bus_id"
              render={({ field }) => (
                <FormItem className="py-1">
                  <FormLabel>Bus</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    disabled={buses.length == 0}
                    // defaultValue={userData.role}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            buses.length > 0
                              ? `Choose a bus`
                              : `No bus availble`
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem key={bus.bus_id} value={bus.bus_id}>
                          <span className="font-semibold text-lg text-purple-800" >

                          {bus.plate_number} {/* {driver.last_name} */}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a bus for this travel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="route_id"
              render={({ field }) => (
                <FormItem className="py-1">
                  <FormLabel>Route</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    disabled={routes.length == 0}
                    // defaultValue={userData.role}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            routes.length > 0
                              ? `Choose a route`
                              : `No route availble`
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.route_id} value={route.route_id}>
                          <span className="flex  gap-2 items-center">
                            <span className="font-medium text-sky-600">{route.departure_name}</span>
                            <ArrowRight size={16} className="text-neutral-500" />
                            <span className="font-medium text-orange-600">{route.arrival_name}</span>
                          </span>
                            
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a route for this travel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="py-1">
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      className="text-green-600 text-lg font-medium"
                      {...field}
                      value={field.value || ""} // Ensure the value is not undefined
                      onChange={(e) => field.onChange(e.target.valueAsNumber)} // Convert to number
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="travel_date"
              render={({ field }) => (
                <FormItem className="flex flex-col py-1a">
                  <FormLabel>Date </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() // Disable dates before today
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Set a date for this new travel.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full mt-4" type="submit">
              Add Travel
            </Button>
          </form>
        </Form>
        {/* <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Save changes</Button>
        </SheetClose>
      </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
};

export default TravelForm;
