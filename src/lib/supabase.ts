
import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";

// Types for our database
export type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  created_at: string;
};

export type Trade = {
  id: string;
  user_id: string;
  trade_date: string;
  market: 'futures' | 'forex' | 'crypto';
  symbol: string;
  type: 'buy' | 'sell';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_reward: number;
  outcome: 'win' | 'loss' | 'pending';
  notes: string;
  created_at: string;
};

// For development, we'll use local auth without actual Supabase
// This will allow login without Supabase connection
const mockUsers = [
  { id: '1', username: 'student', email: 'student@kingsbase.com', password: 'student', role: 'student' },
  { id: '2', username: 'admin', email: 'admin@kingsbase.com', password: 'admin', role: 'admin' }
];

// Mock supabase client for development
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Extract username from email (email format is username@kingsbase.com)
      const username = email.split('@')[0];
      
      // Find the matching user
      const user = mockUsers.find(u => 
        (u.username === username || u.email === email) && 
        u.password === password
      );
      
      if (user) {
        return {
          data: {
            user: {
              id: user.id,
              email: user.email,
              user_metadata: { username: user.username }
            },
            session: {
              user: {
                id: user.id,
                email: user.email,
                user_metadata: { username: user.username }
              },
              access_token: 'mock-token'
            }
          },
          error: null
        };
      } else {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid credentials' }
        };
      }
    },
    signOut: async () => {
      return { error: null };
    },
    getSession: async () => {
      // For demo purposes, return no active session initially
      return { data: { session: null } };
    },
    onAuthStateChange: (callback: any) => {
      // Simple mock for the subscription
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table: string) => {
    return {
      select: () => {
        return {
          eq: () => {
            return {
              single: async () => {
                if (table === 'users') {
                  // For role checking in isUserAdmin
                  const userId = arguments[1];
                  const user = mockUsers.find(u => u.id === userId);
                  return { data: user ? { role: user.role } : null, error: null };
                }
                return { data: null, error: null };
              },
              order: () => {
                return { data: [], error: null };
              }
            };
          }
        };
      },
      insert: () => {
        return { select: () => { return { data: [], error: null }; } };
      }
    };
  }
};

// Auth functions that now use the mock implementation
export const signIn = async (username: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@kingsbase.com`, // Using email format for auth
      password,
    });

    if (error) {
      toast.error('Login failed: ' + error.message);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed: ' + error.message);
      throw error;
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// User functions for admin
export const createUser = async (username: string, email: string, password: string, role: 'admin' | 'student') => {
  try {
    // In real implementation, this would create an auth user
    // For the mock, just return success
    toast.success('User created successfully');
    return { authData: {}, profileData: {} };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Trade functions
export const createTrade = async (trade: Omit<Trade, 'id' | 'created_at'>) => {
  try {
    // Mock implementation
    const mockTrade = {
      ...trade,
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    
    toast.success('Trade saved successfully');
    return mockTrade;
  } catch (error) {
    console.error('Create trade error:', error);
    throw error;
  }
};

export const getUserTrades = async (userId: string) => {
  try {
    // Mock implementation returns empty array
    return [] as Trade[];
  } catch (error) {
    console.error('Get trades error:', error);
    throw error;
  }
};

// Helper function to check if user is admin
export const isUserAdmin = async (userId: string) => {
  try {
    const user = mockUsers.find(u => u.id === userId);
    return user?.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};
