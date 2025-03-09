
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserRole } from '@/types';
import { Session, User } from '@supabase/supabase-js';

// Define our own Session and User types since we're using a mock
export type MockUser = {
  id: string;
  email?: string; // Make email optional to match Supabase User type
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

  // Helper function to convert Supabase Session to MockSession
  const convertSession = (supabaseSession: Session | null): MockSession | null => {
    if (!supabaseSession) return null;
    return {
      user: {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email || undefined,
        role: undefined, // Will be set after checking the users table
        user_metadata: supabaseSession.user.user_metadata as { username?: string }
      },
      access_token: supabaseSession.access_token
    };
  };

  // Helper function to convert Supabase User to MockUser
  const convertUser = (supabaseUser: User | null): MockUser | null => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || undefined,
      role: undefined, // Will be set after checking the users table
      user_metadata: supabaseUser.user_metadata as { username?: string }
    };
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current session from Supabase
        const { data } = await supabase.auth.getSession();
        const mockSession = convertSession(data.session);
        const mockUser = convertUser(data.session?.user ?? null);
        
        setSession(mockSession);
        setUser(mockUser);

        // Check if user is admin
        if (data.session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
          
          setIsAdmin(userData?.role === 'admin');
          
          // Update user with role from database
          if (mockUser && userData?.role) {
            setUser(prevUser => ({
              ...prevUser!,
              role: userData.role as UserRole
            }));
          }
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
        const mockSession = convertSession(newSession);
        const mockUser = convertUser(newSession?.user ?? null);
        
        setSession(mockSession);
        setUser(mockUser);
        setLoading(true);

        // Check if user is admin on auth change
        if (newSession?.user) {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', newSession.user.id)
            .single();
          
          setIsAdmin(data?.role === 'admin');
          
          // Update user with role from database
          if (mockUser && data?.role) {
            setUser(prevUser => ({
              ...prevUser!,
              role: data.role as UserRole
            }));
          }
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@kingsbase.com`,
        password,
      });

      if (error) {
        // Try mock authentication
        const mockUsers = [
          { id: '1', username: 'student', email: 'student@kingsbase.com', password: 'student', role: 'student' },
          { id: '2', username: 'admin', email: 'admin@kingsbase.com', password: 'admin', role: 'admin' },
          { id: '3', username: 'ghaith', email: 'ghaith@kingsbase.com', password: 'justustestingoutshitforfunyk', role: 'student' },
          { id: '4', username: 'king', email: 'king@kingsbase.com', password: 'king', role: 'admin' }
        ];
        
        const mockUser = mockUsers.find(
          user => user.username === username && user.password === password
        );
        
        if (!mockUser) {
          toast.error('Login failed: Invalid username or password');
          throw new Error('Invalid username or password');
        }
        
        // Create mock session and user
        const mockSession: MockSession = {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role as UserRole,
            user_metadata: {
              username: mockUser.username
            }
          },
          access_token: 'mock_token_' + Date.now()
        };
        
        setSession(mockSession);
        setUser(mockSession.user);
        setIsAdmin(mockUser.role === 'admin');
        
        toast.success(`Logged in as ${mockUser.username} (mock)`);
        navigate('/dashboard');
        return;
      }

      // If Supabase login succeeds, use that session
      const mockSession = convertSession(data.session);
      const mockUser = convertUser(data.session?.user ?? null);
      
      setSession(mockSession);
      setUser(mockUser);
      
      // Check if user is admin
      if (data.session) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        setIsAdmin(userData?.role === 'admin');
        
        // Update user with role from database
        if (mockUser && userData?.role) {
          setUser(prevUser => ({
            ...prevUser!,
            role: userData.role as UserRole
          }));
        }
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
