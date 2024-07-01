import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabaseClient';

export function withAuth(Component: React.FC) {
  return function AuthComponent(props: any) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
      const session = supabase.auth.getSession();
      setUser(session?.user ?? null);

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          router.push('/login');
        }
      });

      return () => {
        authListener?.unsubscribe();
      };
    }, [router]);

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}
  