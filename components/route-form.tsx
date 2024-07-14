"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAllLocations,
  createRoute,
  getLocationNameById,
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
import { Location } from "@/types";
import { Input } from "./ui/input";

const routeSchema = z
  .object({
    start_location_id: z.string().min(1, "Start location is required"),
    end_location_id: z.string().min(1, "End location is required"),
    distance: z
      .number()
      .positive("Distance must be a positive number")
      .transform((val) => parseFloat(val as any))
      .refine((val) => !isNaN(val) && val > 0, {
        message: "Distance must be a positive number",
      }),
    duration: z.string().min(1),
  })
  .refine((data) => data.start_location_id !== data.end_location_id, {
    message: "Start and end locations must be different",
    path: ["end_location_id"], // specify the path to show the error
  });

const RouteForm = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const form = useForm<z.infer<typeof routeSchema>>({
    resolver: zodResolver(routeSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const locationData = await getAllLocations();
      setLocations(locationData);
    };

    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof routeSchema>) => {
    if (values.start_location_id === values.end_location_id) {
      toast({
        variant: "destructive",
        title: "Start and end locations must be different.",
      });
      return;
    }

    const createdRoute = await createRoute(values);
    if (createdRoute) {
      toast({
        title: "Route added successfully",
        description: "You can now use this route for travels.",
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
        <Button variant="outline">New Route</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a new route</SheetTitle>
          <SheetDescription>
            Add a new route to create new travels
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="start_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem
                          key={location.location_id}
                          value={location.location_id}
                        >
                          {location.location_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select end location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem
                          key={location.location_id}
                          value={location.location_id}
                        >
                          {location.location_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="distance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter distance"
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
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter duration"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full mt-4" type="submit">
              Add Route
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

export default RouteForm;
