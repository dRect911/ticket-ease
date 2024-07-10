"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAllLocations, createRoute, getLocationNameById } from "@/utils/supabase/queries";
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
import { Location } from "@/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"



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

const EditUser = () => {
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
    <Dialog>
      <DialogTrigger >
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUser;
