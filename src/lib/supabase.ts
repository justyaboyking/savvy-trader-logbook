import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";
import { Trade, NewTrade, UserRole } from '@/types';

// Types for our database
export type User = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
};

// Initialize Supabase client
const supabaseUrl = 'https://lhmupefawbimjqfuwjmw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobXVwZWZhd2JpbWpxZnV3am13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NDc4NTMsImV4cCI6MjA1NzAyMzg1M30.x7-GRGxUSI7I50IzAyF-EHZvPyHVoZqMWtjZlVx39Ns';
export const supabase = createClient(supabaseUrl, supabaseKey);

// For development, we'll use local auth without actual Supabase
// This will allow login without Supabase connection
const mockUsers = [
  { id: '1', username: 'student', email: 'student@kingsbase.com', password: 'student', role: 'student' },
  { id: '2', username: 'admin', email: 'admin@kingsbase.com', password: 'admin', role: 'admin' },
  { id: '3', username: 'ghaith', email: 'ghaith@kingsbase.com', password: 'justustestingoutshitforfunyk', role: 'student' },
  { id: '4', username: 'king', email: 'king@kingsbase.com', password: 'king', role: 'admin' }
];

// Mock data for users table
let mockUsersTable = [
  { id: '1', username: 'student', email: 'student@kingsbase.com', role: 'student', created_at: '2024-01-01T00:00:00.000Z' },
  { id: '2', username: 'admin', email: 'admin@kingsbase.com', role: 'admin', created_at: '2024-01-01T00:00:00.000Z' },
  { id: '3', username: 'ghaith', email: 'ghaith@kingsbase.com', role: 'student', created_at: '2024-01-01T00:00:00.000Z' },
  { id: '4', username: 'king', email: 'king@kingsbase.com', role: 'admin', created_at: '2024-01-01T00:00:00.000Z' }
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

// Auth functions that now use Supabase directly
export const signIn = async (username: string, password: string) => {
  try {
    // First try to sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@kingsbase.com`, // Using email format for auth
      password,
    });

    if (error) {
      console.log('Supabase auth failed, falling back to mock auth');
      
      // Fall back to mock authentication for development
      const mockUser = mockUsers.find(
        user => user.username === username && user.password === password
      );
      
      if (!mockUser) {
        toast.error('Invalid username or password');
        throw new Error('Invalid username or password');
      }
      
      // Create a mock session
      const mockSession = {
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
      
      console.log('Mock authentication successful:', mockUser.username);
      toast.success(`Logged in as ${mockUser.username} (mock)`);
      
      return { session: mockSession };
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
export const createUser = async (username: string, email: string, password: string, role: UserRole) => {
  try {
    console.log('Creating user with Supabase:', { username, email, role });
    
    // First create the auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      toast.error('Failed to create user: ' + authError.message);
      throw authError;
    }

    const userId = authData.user.id;

    // Then create a row in our users table with additional info
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        username,
        email,
        role,
      }]);

    if (profileError) {
      toast.error('Failed to create user profile: ' + profileError.message);
      throw profileError;
    }

    toast.success('User created successfully');
    
    // Add to mock users for development
    mockUsers.push({ 
      id: userId, 
      username, 
      email, 
      password, 
      role 
    });
    
    mockUsersTable.push({
      id: userId,
      username,
      email,
      role,
      created_at: new Date().toISOString()
    });
    
    return { authData, profileData: {} };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Trade functions connected to Supabase
export const createTrade = async (trade: Omit<Trade, 'id' | 'created_at'>) => {
  try {
    // Create the trade in Supabase
    const timestamp = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('trades')
      .insert([{
        ...trade,
        created_at: timestamp
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Supabase trade creation error:', error);
      
      // Fall back to mock for development if Supabase fails
      const newId = Date.now().toString();
      const newTrade: Trade = {
        ...trade,
        id: newId,
        created_at: timestamp
      };
      
      // Add to mock trades table
      mockTradesTable.push(newTrade);
      console.log("Mock trade created:", newTrade);
      toast.success('Trade saved successfully (mock)');
      return newTrade;
    }
    
    console.log("Trade created in Supabase:", data);
    toast.success('Trade saved successfully');
    return data;
  } catch (error) {
    console.error('Create trade error:', error);
    toast.error('Failed to save trade');
    throw error;
  }
};

export const getUserTrades = async (userId: string) => {
  try {
    // Get trades from Supabase
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false });
    
    if (error) {
      console.error('Supabase get trades error:', error);
      
      // Fall back to mock data for development
      const userTrades = mockTradesTable
        .filter(trade => trade.user_id === userId)
        .sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime());
      
      console.log(`Retrieved ${userTrades.length} trades for user ${userId} (mock)`);
      return userTrades;
    }
    
    console.log(`Retrieved ${data.length} trades for user ${userId} from Supabase`);
    return data;
  } catch (error) {
    console.error('Get trades error:', error);
    throw error;
  }
};

// Helper function to check if user is admin
export const isUserAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Supabase admin check error:', error);
      
      // Fall back to mock data for development
      const user = mockUsers.find(u => u.id === userId);
      return user?.role === 'admin';
    }
    
    return data?.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};

// Get a single trade by ID
export const getTrade = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Supabase get trade error:', error);
      
      // Fall back to mock data for development
      const trade = mockTradesTable.find(t => t.id === id);
      return trade || null;
    }
    
    return data;
  } catch (error) {
    console.error('Get trade error:', error);
    throw error;
  }
};

// Update a trade
export const updateTrade = async (id: string, updates: Partial<Trade>) => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update trade error:', error);
      
      // Fall back to mock for development
      const index = mockTradesTable.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error('Trade not found');
      }
      
      // Update the trade
      mockTradesTable[index] = {
        ...mockTradesTable[index],
        ...updates
      };
      
      console.log("Mock trade updated:", mockTradesTable[index]);
      toast.success('Trade updated successfully (mock)');
      return mockTradesTable[index];
    }
    
    console.log("Trade updated in Supabase:", data);
    toast.success('Trade updated successfully');
    return data;
  } catch (error) {
    console.error('Update trade error:', error);
    toast.error('Failed to update trade');
    throw error;
  }
};

// Get all users (for admin)
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase get users error:', error);
      return mockUsersTable;
    }
    
    return data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

// Get a user by ID
export const getUserById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Supabase get user error:', error);
      return mockUsersTable.find(u => u.id === id) || null;
    }
    
    return data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Get user trades for admin (bypass user_id check)
export const getUserTradesAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false });
    
    if (error) {
      console.error('Supabase admin get trades error:', error);
      
      // Fall back to mock data for development
      const userTrades = mockTradesTable
        .filter(trade => trade.user_id === userId)
        .sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime());
      
      console.log(`Admin retrieved ${userTrades.length} trades for user ${userId} (mock)`);
      return userTrades;
    }
    
    console.log(`Admin retrieved ${data.length} trades for user ${userId} from Supabase`);
    return data;
  } catch (error) {
    console.error('Admin get trades error:', error);
    throw error;
  }
};

// Create new user account with proper storage
export const createUserAccount = async (username: string, email: string, password: string, role: UserRole = 'student') => {
  try {
    console.log('Creating user account with Supabase:', { username, email, role });
    
    // Check if username or email already exists
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`);
    
    if (fetchError) {
      console.error('Error checking existing users:', fetchError);
      // Fall back to mock check
      const existingUser = mockUsers.find(u => u.username === username || u.email === email);
      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error('Username already taken');
        } else {
          throw new Error('Email already in use');
        }
      }
    } else if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      } else {
        throw new Error('Email already in use');
      }
    }
    
    try {
      // Try to create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      
      if (authError) {
        console.error('Failed to create auth user, falling back to mocks:', authError.message);
        throw authError; // This will trigger the catch block below
      }
      
      const userId = authData.user.id;
      
      // Create user profile in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          username,
          email,
          role,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (userError) {
        toast.error('Failed to create user profile: ' + userError.message);
        throw userError;
      }
      
      console.log("Created new user in Supabase:", userData);
      toast.success('User account created successfully');
      
      return userData;
    } catch (err) {
      // Fall back to creating mock user if Supabase admin API fails
      console.log('Supabase admin API unavailable, creating mock user instead');
      
      // Generate a unique ID for the mock user
      const userId = 'mock_' + Date.now().toString();
      
      // Add to mock data
      mockUsers.push({ 
        id: userId, 
        username, 
        email, 
        password, 
        role 
      });
      
      const mockUserData = {
        id: userId,
        username,
        email,
        role,
        created_at: new Date().toISOString()
      };
      
      mockUsersTable.push(mockUserData);
      
      console.log("Created new mock user:", mockUserData);
      toast.success('User account created successfully (mock)');
      
      return mockUserData;
    }
  } catch (error) {
    console.error('Create user account error:', error);
    toast.error('Failed to create user: ' + (error as Error).message);
    throw error;
  }
};
