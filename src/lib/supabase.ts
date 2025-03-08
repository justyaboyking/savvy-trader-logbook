
import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";
import { Trade, NewTrade } from '@/types';

// Types for our database
export type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  created_at: string;
};

// For development, we'll use local auth without actual Supabase
// This will allow login without Supabase connection
const mockUsers = [
  { id: '1', username: 'student', email: 'student@kingsbase.com', password: 'student', role: 'student' },
  { id: '2', username: 'admin', email: 'admin@kingsbase.com', password: 'admin', role: 'admin' }
];

// Mock data for users table
let mockUsersTable = [
  { id: '1', username: 'student', email: 'student@kingsbase.com', role: 'student', created_at: '2024-01-01T00:00:00.000Z' },
  { id: '2', username: 'admin', email: 'admin@kingsbase.com', role: 'admin', created_at: '2024-01-01T00:00:00.000Z' }
];

// Mock data for trades
let mockTradesTable: Trade[] = [
  {
    id: '1',
    user_id: '1',
    trade_date: '2025-03-05T00:00:00.000Z',
    market: 'futures',
    symbol: 'NQ',
    type: 'buy',
    entry_price: 18500,
    stop_loss: 18400,
    take_profit: 18700,
    risk_reward: 2,
    outcome: 'win',
    notes: 'Good momentum trade',
    created_at: '2025-03-05T00:00:00.000Z'
  },
  {
    id: '2',
    user_id: '1',
    trade_date: '2025-03-06T00:00:00.000Z',
    market: 'forex',
    symbol: 'EUR/USD',
    type: 'sell',
    entry_price: 1.0850,
    stop_loss: 1.0870,
    take_profit: 1.0810,
    risk_reward: 2,
    outcome: 'loss',
    notes: 'Caught in a fakeout',
    created_at: '2025-03-06T00:00:00.000Z'
  },
  {
    id: '3',
    user_id: '1',
    trade_date: '2025-03-07T00:00:00.000Z',
    market: 'crypto',
    symbol: 'BTC',
    type: 'buy',
    entry_price: 61000,
    stop_loss: 60000,
    take_profit: 63000,
    risk_reward: 2,
    outcome: 'pending',
    notes: 'Looking for breakout confirmation',
    created_at: '2025-03-07T00:00:00.000Z'
  },
  {
    id: '4',
    user_id: '1',
    trade_date: '2025-03-08T00:00:00.000Z',
    market: 'futures',
    symbol: 'ES',
    type: 'buy',
    entry_price: 5200,
    stop_loss: 5150,
    take_profit: 5300,
    risk_reward: 2,
    outcome: 'win',
    notes: 'Trend continuation play',
    created_at: '2025-03-08T00:00:00.000Z'
  }
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
    },
    admin: {
      createUser: async ({ email, password, email_confirm = true }: any) => {
        const newId = (mockUsers.length + 1).toString();
        const newUser = {
          id: newId,
          email,
          password,
          username: email.split('@')[0],
          user_metadata: { username: email.split('@')[0] }
        };
        
        mockUsers.push({ 
          id: newId, 
          username: email.split('@')[0], 
          email, 
          password, 
          role: 'student' 
        });
        
        return { 
          data: { user: newUser }, 
          error: null 
        };
      },
      deleteUser: async (userId: string) => {
        const index = mockUsers.findIndex(u => u.id === userId);
        if (index !== -1) {
          mockUsers.splice(index, 1);
          return { error: null };
        }
        return { error: { message: 'User not found' } };
      }
    }
  },
  from: (table: string) => {
    const mockQueryBuilder = {
      select: (selection = '*') => {
        return {
          eq: (field: string, value: string) => {
            return {
              single: async () => {
                if (table === 'users') {
                  const user = mockUsersTable.find(u => u[field as keyof typeof u] === value);
                  return { data: user ? { role: user.role } : null, error: null };
                }
                return { data: null, error: null };
              },
              order: (field: string, { ascending = true }: { ascending: boolean }) => {
                if (table === 'users') {
                  const filteredUsers = mockUsersTable.filter(u => u[field as keyof typeof u] === value);
                  const sortedUsers = [...filteredUsers].sort((a, b) => {
                    if (ascending) {
                      return a[field as keyof typeof a] > b[field as keyof typeof b] ? 1 : -1;
                    } else {
                      return a[field as keyof typeof a] < b[field as keyof typeof b] ? 1 : -1;
                    }
                  });
                  return { data: sortedUsers, error: null };
                } else if (table === 'trades') {
                  const filteredTrades = mockTradesTable.filter(t => t[field as keyof typeof t] === value);
                  const sortedTrades = [...filteredTrades].sort((a, b) => {
                    const aField = a[field as keyof typeof a];
                    const bField = b[field as keyof typeof b];
                    if (ascending) {
                      return aField > bField ? 1 : -1;
                    } else {
                      return aField < bField ? 1 : -1;
                    }
                  });
                  return { data: sortedTrades, error: null };
                }
                return { data: [], error: null };
              }
            };
          },
          order: (field: string, { ascending = true }: { ascending: boolean }) => {
            if (table === 'users') {
              // Sort the mock users
              const sortedUsers = [...mockUsersTable].sort((a, b) => {
                if (ascending) {
                  return a[field as keyof typeof a] > b[field as keyof typeof b] ? 1 : -1;
                } else {
                  return a[field as keyof typeof a] < b[field as keyof typeof b] ? 1 : -1;
                }
              });
              return { data: sortedUsers, error: null };
            } else if (table === 'trades') {
              const sortedTrades = [...mockTradesTable].sort((a, b) => {
                const aField = a[field as keyof typeof a];
                const bField = b[field as keyof typeof b];
                if (ascending) {
                  return aField > bField ? 1 : -1;
                } else {
                  return aField < bField ? 1 : -1;
                }
              });
              return { data: sortedTrades, error: null };
            }
            return { data: [], error: null };
          }
        };
      },
      insert: (items: any[]) => {
        if (table === 'users') {
          // Add created_at field if not provided
          const itemsWithTimestamp = items.map(item => ({
            ...item,
            created_at: item.created_at || new Date().toISOString()
          }));
          
          // Add the users to our mock table
          mockUsersTable = [...mockUsersTable, ...itemsWithTimestamp];
          
          return { 
            data: itemsWithTimestamp, 
            error: null,
            select: () => ({ data: itemsWithTimestamp, error: null })
          };
        } else if (table === 'trades') {
          // Add created_at and id field if not provided
          const tradesWithTimestamp = items.map((item, index) => ({
            ...item,
            id: item.id || (mockTradesTable.length + index + 1).toString(),
            created_at: item.created_at || new Date().toISOString()
          }));
          
          // Add the trades to our mock table
          mockTradesTable = [...mockTradesTable, ...tradesWithTimestamp];
          
          return { 
            data: tradesWithTimestamp, 
            error: null,
            select: () => ({ data: tradesWithTimestamp, error: null })
          };
        }
        return { 
          data: items, 
          error: null,
          select: () => ({ data: items, error: null })
        };
      },
      delete: () => {
        return {
          eq: (field: string, value: string) => {
            if (table === 'users') {
              const index = mockUsersTable.findIndex(u => u[field as keyof typeof u] === value);
              if (index !== -1) {
                mockUsersTable.splice(index, 1);
                return { data: null, error: null };
              }
            } else if (table === 'trades') {
              const index = mockTradesTable.findIndex(t => t[field as keyof typeof t] === value);
              if (index !== -1) {
                mockTradesTable.splice(index, 1);
                return { data: null, error: null };
              }
            }
            return { data: null, error: { message: `Item not found in ${table}` } };
          }
        };
      }
    };
    
    return mockQueryBuilder;
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
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password
    });

    if (authError) throw authError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        username,
        email,
        role,
      }]);

    if (profileError) throw profileError;

    toast.success('User created successfully');
    return { authData, profileData: {} };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Trade functions
export const createTrade = async (trade: Omit<Trade, 'id' | 'created_at'>) => {
  try {
    // Update mock implementation to actually save trades
    const { data, error } = await supabase
      .from('trades')
      .insert([trade]);
    
    if (error) throw error;
    
    toast.success('Trade saved successfully');
    return data[0];
  } catch (error) {
    console.error('Create trade error:', error);
    throw error;
  }
};

export const getUserTrades = async (userId: string) => {
  try {
    // Update mock implementation to return mock trades
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false });
    
    if (error) throw error;
    
    return data as Trade[];
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
