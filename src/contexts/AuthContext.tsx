
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserRole } from '@/types';
import { User } from '@supabase/supabase-js';

type AuthUser = {
  id: string;
  email: string;
  username?: string;
  role?: UserRole;
};

export type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, username')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          username: profile?.username || session.user.email?.split('@')[0] || '',
          role: profile?.role as UserRole || 'student'
        };
        
        setUser(authUser);
        setIsAdmin(profile?.role === 'admin');
      }
      
      setLoading(false);
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state changed:', event, newSession);
          
          if (event === 'SIGNED_IN' && newSession?.user) {
            setLoading(true);
            const profile = await fetchUserProfile(newSession.user.id);
            
            const authUser: AuthUser = {
              id: newSession.user.id,
              email: newSession.user.email || '',
              username: profile?.username || newSession.user.email?.split('@')[0] || '',
              role: profile?.role as UserRole || 'student'
            };
            
            setUser(authUser);
            setIsAdmin(profile?.role === 'admin');
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsAdmin(false);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);

  // Sign in function
  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Try email login directly if username contains @
      const email = username.includes('@') ? username : `${username}@kingsbase.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // If login successful, get user profile
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        
        // Update state with user info
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          username: profile?.username || username,
          role: profile?.role as UserRole || 'student'
        };
        
        setUser(authUser);
        setIsAdmin(profile?.role === 'admin');
        
        // Navigate to appropriate dashboard
        navigate('/dashboard');
        toast.success(`Welcome back, ${profile?.username || username}!`);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAdmin(false);
      navigate('/login');
      toast.success('Successfully logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(`Logout failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
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
