"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAllLocations,
  createRoute,
  getLocationNameById,
  getFreeDrivers,
  getPlateNumbers,
  createBus,
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
import { busSchema, Bus, Profile } from "@/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils";
import { Input } from "./ui/input";


export const busFormSchema = z.object({
  // bus_id: z.string().uuid(), // Assuming UUID for bus_id
  plate_number: z
    .string()
    .min(1, "Plate number is required")
    .regex(/^[A-Z]{2}-\d{4}$/, "Plate number must be in AA-0000 format"),
  capacity: z.number().positive("Capacity must be a positive number").int(),
  driver_id: z.string().uuid().optional(), // Driver ID can be optional (null)
});

const BusForm = () => {
  const { toast } = useToast();
  const [freeDrivers, setFreeDrivers] = useState<Profile[]>([]);
  const [plateNumbers, setPlateNumbers] = useState<string[]>([]);
  const form = useForm<z.infer<typeof busFormSchema>>({
    resolver: zodResolver(busFormSchema),
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

  const onSubmit = async (values: z.infer<typeof busFormSchema>) => {
    console.log("got into submit logic");

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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">New Bus</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a new bus</SheetTitle>
          <SheetDescription>
            Add a new bus to create new travels
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={(e) => {
              console.log("Form submitted");
              form.handleSubmit(onSubmit)(e);
            }}>
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
                  <FormDescription>
                    You should follow this format "AA-0000"
                  </FormDescription>
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
                      value={field.value || ""} // Ensure the value is not undefined
                      onChange={(e) => field.onChange(e.target.valueAsNumber)} // Convert to number
                    />
                  </FormControl>
                  <FormDescription>
                    Set the amount of places of the bus
                  </FormDescription>
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
                        <SelectValue
                          placeholder={
                            freeDrivers.length > 0
                              ? `Choose a driver`
                              : `No driver availble`
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {freeDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
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
        {/* <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Save changes</Button>
        </SheetClose>
      </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
};

export default BusForm;
{
  /* <Drawer>
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
                        value={field.value || ''} // Ensure the value is not undefined
          onChange={(e) => field.onChange(e.target.valueAsNumber)} // Convert to number
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
    </Drawer> */
}
