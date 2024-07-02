import { supabase } from "@/utils/supabase/client";
// import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const useLogout = () => {
  // const router = useRouter();
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
        description: "You will be rdirected to home page",
      });
      // router.push("/");
    }
  };

  return logout;
};

export default useLogout;
