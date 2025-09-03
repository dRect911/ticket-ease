"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import useLogout from "@/hooks/useLogout";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bus, 
  MapPin, 
  Clock, 
  Shield, 
  Users, 
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Sparkles
} from "lucide-react";
import { getUserRole } from "@/utils/supabase/queries";




export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } else {
      toast({
        title: "Logout successful!",
        description: "You will be redirected to login page",
      });
      router.push("/auth/login");
    }
  };

  const getDashboardRoute = (role: string | null) => {
    switch (role) {
      case "admin":
        return "/admin-dashboard";
      case "driver":
        return "/driver-dashboard";
      case "user":
      default:
        return "/dashboard";
    }
  };

  const getRoleDisplay = (role: string | null) => {
    switch (role) {
      case "admin":
        return { name: "Administrator", icon: Shield, color: "bg-slate-100 text-slate-800" };
      case "driver":
        return { name: "Driver", icon: Bus, color: "bg-slate-100 text-slate-800" };
      case "user":
        return { name: "Customer", icon: Users, color: "bg-slate-100 text-slate-800" };
      default:
        return { name: "Guest", icon: Users, color: "bg-gray-100 text-gray-800" };
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session) {
          setIsAuthenticated(true);
          const role = await getUserRole();
          setUserRole(role);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);




  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-4xl mx-auto">
            
            {/* Logo and Title Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <Skeleton className="h-12 w-12 rounded animate-pulse" />
                  <Skeleton className="h-4 w-4 rounded absolute -top-1 -right-1 animate-pulse" />
                </div>
                <Skeleton className="h-12 w-48 animate-pulse" />
              </div>
              <Skeleton className="h-6 w-96 animate-pulse" />
            </div>

            {/* User Status Card Skeleton */}
            <div className="mt-16 w-full max-w-md">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <Skeleton className="h-6 w-6 rounded animate-pulse" />
                      <Skeleton className="h-6 w-32 animate-pulse" />
                    </div>
                    <Skeleton className="h-6 w-24 mx-auto animate-pulse" />
                  </div>
                  
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full animate-pulse" />
                    <Skeleton className="h-12 w-full animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer Skeleton */}
            <div className="mt-16">
              <Skeleton className="h-4 w-64 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const roleDisplay = getRoleDisplay(userRole);
  const RoleIcon = roleDisplay.icon;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Bus className="h-12 w-12 text-slate-800" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <h1 className="text-5xl font-bold text-slate-800">
                Ticket Ease
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl">
              Your journey begins here. Book tickets, manage travels, and experience seamless transportation with our modern booking platform.
            </p>
          </div>

          {/* Features Grid */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Quick Booking</h3>
                <p className="text-sm text-gray-600">Book your tickets in seconds with our streamlined process</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Wide Coverage</h3>
                <p className="text-sm text-gray-600">Extensive network of routes connecting major destinations</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Secure & Reliable</h3>
                <p className="text-sm text-gray-600">Safe transactions and reliable service you can trust</p>
              </CardContent>
            </Card>
          </div> */}

          {/* User Status and Actions */}
          <div className="mt-16 w-full max-w-md">
            {isAuthenticated ? (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <RoleIcon className="h-6 w-6 text-slate-800" />
                      <span className="text-lg font-semibold text-gray-900">Welcome back!</span>
                    </div>
                    <Badge className={`${roleDisplay.color} px-3 py-1`}>
                      {roleDisplay.name}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      asChild 
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      <Link href={getDashboardRoute(userRole)} className="flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5" />
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={logout}
                      className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-300"
                      size="lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">Ready to get started?</h3>
                    <p className="text-gray-600">Join thousands of satisfied travelers</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      asChild 
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      <Link href="/auth/register" className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-colors duration-300"
                      size="lg"
                    >
                      <Link href="/auth/login">
                        Already have an account? Sign In
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-gray-500">
            <p>© 2024 Ticket Ease. Making travel booking simple and efficient.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
