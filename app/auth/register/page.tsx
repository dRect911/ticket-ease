"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { createProfile } from "@/utils/supabase/queries";

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(4, {
    message: "Password must be at least 2 characters.",
  }),
});

// import RegisterForm from "@/components/register-form";

export default function Register() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.first_name,
            last_name: values.last_name,
          },
        },
      });
      if (data.user) {
        const pf = await createProfile({
          id: data.user.id,
          email: values.email,
          role: "user",
          first_name: values.first_name,
          last_name: values.last_name,
        });
      }

      if (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.message,
        });
      } else {
        toast({
          title: "Registration successful!",
          description: "Please check your email for verification.",
        });
        router.push("/auth/login");
      }
    } catch (error) {
      throw error;
    }

    setLoading(false);
  }

  // 3. Define a loading state.
  useEffect(() => {
    if (loading) {
      toast({
        description: "Registering...",
      });
    }
  }, [loading]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input
                    required
                    disabled={loading}
                    placeholder="First name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your public display first name.
                </FormDescription>
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
                    disabled={loading}
                    placeholder="Last name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your public display last name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    type="email"
                    placeholder="Email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be private.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    type="password"
                    placeholder="First name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Mind to add capital letters and numbers to your password.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} type="submit">
            {loading ? "Please wait" : "Register"}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
