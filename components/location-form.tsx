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

const locationSchema = z.object({
  location_name: z.string().min(1, "Location name is required"),
});

const LocationForm = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    /* defaultValues: {
      email: "",
      password: "",
    }, */
  });

  const onSubmit = async (values: z.infer<typeof locationSchema>) => {
    const createdLocation = await createLocation(values.location_name);
    if (createdLocation) {
      toast({
        title: "Location added successfully",
        description: "You can check locations list or add a new route with it.",
      });
    } else {
      // Handle creation errors
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        // description: error.message,
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
                          // disabled={loading}
                          type="text"
                          placeholder="Type in the location name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Sample description.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormControl>
              <Button className="w-full" type="submit">
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
