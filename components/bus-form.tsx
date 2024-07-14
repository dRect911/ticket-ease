"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAllLocations, createRoute, getLocationNameById, getFreeDrivers, getPlateNumbers, createBus } from "@/utils/supabase/queries";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { busSchema, Location, Profile } from "@/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils";
import { Input } from "./ui/input";



const routeSchema = z.object({
    start_location_id: z.string().min(1, "Start location is required"),
    end_location_id: z.string().min(1, "End location is required"),
    distance: z.number().positive("Distance must be a positive number").transform((val) => parseFloat(val as any))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Distance must be a positive number",
    }),
    duration: z.string().min(1),
  }).refine((data) => data.start_location_id !== data.end_location_id, {
    message: "Start and end locations must be different",
    path: ["end_location_id"], // specify the path to show the error
  });

const BusForm = () => {
  const { toast } = useToast();
  const [freeDrivers, setFreeDrivers] = useState<Profile[]>([]);
  const [plateNumbers, setPlateNumbers] = useState<string[]>([]);
  const form = useForm<z.infer<typeof busSchema>>({
    resolver: zodResolver(busSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const fd = await getFreeDrivers();
      setFreeDrivers(fd);
      const pn = await getPlateNumbers();
      setPlateNumbers(pn);
    };

    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof busSchema>) => {
    if (plateNumbers.includes(values.plate_number)) {
      toast({
        variant: "destructive",
        title: "This plate number already exists",
      });
      return;
    }

    const createdbus = await createBus(values);
    if (createdbus) {
      toast({
        title: "Bus added successfully",
        description: "You can now use this bus for travels.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
      });
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">New Bus</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add a new bus</DrawerTitle>
            <DrawerDescription>
              Add a new bus to create new travels
            </DrawerDescription>
          </DrawerHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="plate_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plate number</FormLabel>
                  <FormControl>
                    <Input
                      required
                      type="text"
                      placeholder="AA-0000"
                      id="plate_number"
                      className="col-span-3"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>You should follow this format "AA-0000"</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter capacity"
                        {...field}
                      />
                    </FormControl>
                      <FormDescription>Set the amount of places of the bus</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
              control={form.control}
              name="driver_id"
              render={({ field }) => (
                <FormItem className="pb-20">
                  <FormLabel>Driver</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    disabled={freeDrivers.length == 0}
                    // defaultValue={userData.role}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={freeDrivers.length > 0 ? `Choose a driver` : `No driver availble`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {freeDrivers.map(driver => (
                        <SelectItem
                          key={driver.id}
                          value={driver.id}
                        >
                          {driver.first_name} {driver.last_name}
                        </SelectItem>
                      ))}
                      
                    </SelectContent>
                  </Select>
                  <FormDescription>Assign a driver to this bus</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
              <Button className="w-full mt-4" type="submit">
                Add Bus
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

export default BusForm;
