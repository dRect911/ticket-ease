"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod"; // Assuming you have your location schema defined in Zod
import { zodResolver } from "@hookform/resolvers/zod";
import { createLocation } from "@/utils/supabase/queries";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";

const locationSchema = z.object({
  location_name: z.string().min(1, "Location name is required"),
});

const LocationForm = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
  });

  const onSubmit = async (values: z.infer<typeof locationSchema>) => {
    setLoading(true);
    const createdLocation = await createLocation(values.location_name).catch((error) => {
      toast({
        variant: "destructive",
        title: "Error creating location",
        description: error.message,
      });
    });
    setLoading(false);
    if (createdLocation) {
      toast({
        title: "Location added successfully",
        description: "You can check locations list or add a new route with it.",
      });
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">New location</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add a new location</DrawerTitle>
            <DrawerDescription>
              Add a new location to create new routes
            </DrawerDescription>
          </DrawerHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Optional Form Description */}
              <FormControl>
                <FormField
                  control={form.control}
                  name="location_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          type="text"
                          placeholder="Enter the location name here"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Sample description.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormControl>
              <Button className="w-full" disabled={loading} type="submit">
                Create Location
              </Button>
            </form>
          </Form>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LocationForm;
