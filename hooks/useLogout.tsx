import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const supabase = createClient()

const useLogout = () => {
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

  return logout;
};

export default useLogout;
