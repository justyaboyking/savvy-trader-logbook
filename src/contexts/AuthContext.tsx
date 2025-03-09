
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserRole } from '@/types';

// Define our own Session and User types since we're using a mock
export type MockUser = {
  id: string;
  email: string;
  role?: UserRole;
  user_metadata?: {
    username?: string;
  };
};

export type MockSession = {
  user: MockUser;
  access_token: string;
};

export type AuthContextType = {
  session: MockSession | null;
  user: MockUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<MockSession | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current session from Supabase
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        // Check if user is admin
        if (data.session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
          
          setIsAdmin(userData?.role === 'admin');
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(true);

        // Check if user is admin on auth change
        if (newSession?.user) {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', newSession.user.id)
            .single();
          
          setIsAdmin(data?.role === 'admin');
        } else {
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Format username to email for Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@kingsbase.com`,
        password,
      });

      if (error) {
        toast.error('Login failed: ' + error.message);
        throw error;
      }

      // Set the session and user state directly
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // Check if user is admin
      if (data.session) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        setIsAdmin(userData?.role === 'admin');
      }
      
      // Navigate to dashboard after login
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Logout failed: ' + error.message);
        throw error;
      }
      
      // Clear local state
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      
      // Navigate to login page
      navigate('/login');
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
