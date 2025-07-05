"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAllLocations,
  getLocationNameById,
  getAllRoutes,
  getAllBuses,
  updateTravel,
  getBusesWithDrivers,
  getTravelById,
  getRouteIdByTravelId,
  getBusIdByTravelId,
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
import { Edit } from "lucide-react";

import { Bus, Location, Route, Travel } from "@/types";
import { ArrowRight, CalendarIcon } from "lucide-react";

const travelFormSchema = z.object({
  bus_id: z.string().uuid(),
  route_id: z.string().uuid(),
  price: z.number().positive().int(),
  travel_date: z.date(),
});

interface RouteDetails extends Route {
  departure_name: string;
  arrival_name: string;
}

interface EditTravelFormProps {
  travelId: string;
  onSuccess: () => void;
}

const EditTravelForm = ({ travelId, onSuccess }: EditTravelFormProps) => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<RouteDetails[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const loadTravelData = async () => {
    setIsLoading(true);
    try {
      const travel = await getTravelById(travelId);
      if (travel) {
        const routeId = await getRouteIdByTravelId(travelId);
        const busId = await getBusIdByTravelId(travelId);
        
        form.reset({
          bus_id: busId || "",
          route_id: routeId || "",
          price: travel.price,
          travel_date: new Date(travel.travel_date),
        });
      }
    } catch (error) {
      console.error("Error loading travel data:", error);
      toast({
        title: "Error loading travel data",
        description: "Failed to load travel information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof travelFormSchema>) => {
    try {
      const updatedTravel = await updateTravel({
        travel_id: travelId,
        ...values,
      });
      
      if (updatedTravel) {
        toast({
          title: "Travel updated successfully",
          description: "The travel has been updated with the new information.",
        });
        onSuccess();
        setIsOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error updating travel",
          description: "Failed to update the travel. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating travel:", error);
      toast({
        variant: "destructive",
        title: "Error updating travel",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(true);
            loadTravelData();
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Travel</SheetTitle>
          <SheetDescription>
            Update travel information and settings.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bus_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    disabled={buses.length === 0 || isLoading}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            buses.length > 0
                              ? "Choose a bus"
                              : "No bus available"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem key={bus.bus_id} value={bus.bus_id}>
                          <span className="font-semibold text-lg text-purple-800">
                            {bus.plate_number}
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
                <FormItem>
                  <FormLabel>Route</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    disabled={routes.length === 0 || isLoading}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            routes.length > 0
                              ? "Choose a route"
                              : "No route available"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.route_id} value={route.route_id}>
                          <span className="flex gap-2 items-center">
                            <span className="font-medium text-sky-600">
                              {route.departure_name}
                            </span>
                            <ArrowRight className="h-4 w-4" />
                            <span className="font-medium text-orange-600">
                              {route.arrival_name}
                            </span>
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
                <FormItem>
                  <FormLabel>Price (XOF)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Set the ticket price for this travel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="travel_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Travel Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
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
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the travel date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Travel"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditTravelForm; 