"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "@/utils/supabase/queries";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { Location, Profile, profileSchema } from "@/types";
import { Check, ChevronsUpDown, Pencil } from "lucide-react";
import { cn } from "@/utils";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { log } from "console";

const EditUserDraft = ({ userData }: { userData: Profile }) => {
  const { toast } = useToast();

  const form = useForm<Partial<z.infer<typeof profileSchema>>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      role: userData.role,
    },
  });

  async function onSubmit(values: Partial<Profile>) {
    try {
      console.log("got into the submit logic");

      toast({
        title: "You submitted this",
        description: `First name: ${values.first_name}, Last name: ${values.last_name}, Role: ${values.role}`,
      });

      const updatedProfiles = await updateProfile(values);
      if (updatedProfiles) {
        toast({
          title: "Profile updated successfully",
          description: "...",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong. ",
          description: "An error occurred while submitting the form.",
        });
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        variant: "destructive",
        title: "Submission error",
        description: "An error occurred while submitting the form.",
      });
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Pencil size={16} className="hover:cursor-pointer text-sky-600" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log("Form submitted");
              form.handleSubmit(onSubmit)(e);
            }}
          >
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      required
                      type="text"
                      placeholder={userData.first_name}
                      id="first_name"
                      className="col-span-3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      required
                      type="text"
                      placeholder={userData.last_name}
                      id="last_name"
                      className="col-span-3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="pb-20">
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={userData.role}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={userData.role} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">
                        <span
                          className={`rounded-full py-0.5 px-2 bg-emerald-200 text-emerald-700 font-medium`}
                        >
                          {"user"}
                        </span>
                      </SelectItem>
                      <SelectItem value="driver">
                        <span
                          className={`rounded-full py-0.5 px-2 bg-pink-200 text-pink-700 font-medium`}
                        >
                          {"driver"}
                        </span>
                      </SelectItem>
                      <SelectItem value="admin">
                        <span
                          className={`rounded-full py-0.5 px-2 bg-purple-200 text-purple-700 font-medium`}
                        >
                          {"admin"}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose role carefuly</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save changes</Button>
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

export default EditUserDraft;

{
  /* <Input type="text" defaultValue={userData.first_name} />
        <Input type="text" defaultValue={userData.last_name} />
        <Input type="text" defaultValue={userData.role} /> */
}
/* 

<Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormControl>
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        // disabled={loading}
                        type="text"
                        placeholder="Type in your first name"
                        id="first_name"
                        defaultValue={userData.first_name}
                        className="col-span-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input
                        // disabled={loading}
                        type="text"
                        placeholder="Type in your first name"
                        id="last_name"
                        defaultValue={userData.last_name}
                        className="col-span-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={userData.role}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={userData.role} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">
                          <span
                            className={`rounded-full py-0.5 px-2 bg-emerald-200 text-emerald-700 font-medium`}
                          >
                            {"user"}
                          </span>
                        </SelectItem>
                        <SelectItem value="driver">
                          <span
                            className={`rounded-full py-0.5 px-2 bg-pink-200 text-pink-700 font-medium`}
                          >
                            {"driver"}
                          </span>
                        </SelectItem>
                        <SelectItem value="admin">
                          <span
                            className={`rounded-full py-0.5 px-2 bg-purple-200 text-purple-700 font-medium`}
                          >
                            {"admin"}
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose role carefuly</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormControl>
          </form>
        </Form>*/
