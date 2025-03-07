
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Check if user is admin
        if (currentSession?.user) {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();
          
          setIsAdmin(data?.role === 'admin');
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
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
      // We format username to email for Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@kingsbase.com`,
        password,
      });

      if (error) throw error;
      
      // Navigate to dashboard after login
      navigate('/dashboard');
    } catch (error) {
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
      if (error) throw error;
      navigate('/');
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

// Protected route component
export const withAuth = (Component: React.ComponentType) => {
  return () => {
    const { session, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !session) {
        navigate('/');
      }
    }, [loading, session, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-kings-black">
          <div className="animate-pulse-slow text-white text-xl">Loading...</div>
        </div>
      );
    }

    return session ? <Component /> : null;
  };
};

// Admin route component
export const withAdmin = (Component: React.ComponentType) => {
  return () => {
    const { isAdmin, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !isAdmin) {
        navigate('/dashboard');
      }
    }, [loading, isAdmin, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-kings-black">
          <div className="animate-pulse-slow text-white text-xl">Loading...</div>
        </div>
      );
    }

    return isAdmin ? <Component /> : null;
  };
};
